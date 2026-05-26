  const [pendingBenchDecision, setPendingBenchDecision] = useState<{
    winners: string[];
    losers: string[];
    count: 5 | 6;
    nextHistory: Record<string, number>;
    updatedMatches: MPLMatch[];
    winnersMustSplit: boolean;
  } | null>(null);

  const handleRegisterScore = () => {
    if (!activeTournament || !currentMatch) return;
    const t1Score = parseInt(scoreT1);
    const t2Score = parseInt(scoreT2);

    if (isNaN(t1Score) || isNaN(t2Score) || t1Score === t2Score) {
      setValidationError('Por favor ingresa un resultado válido y sin empates.');
      return;
    }
    setValidationError(null);

    const updatedMatches = [...activeTournament.matches];
    updatedMatches[updatedMatches.length - 1] = {
      ...currentMatch,
      score: { t1: t1Score, t2: t2Score }
    };

    let nextHistory = { ...activeTournament.pairPlayHistory };
    const roundComplete = checkRoundComplete(activeTournament.players, nextHistory);

    if (roundComplete) {
      const updatedTourney = { ...activeTournament, matches: updatedMatches, pairPlayHistory: nextHistory };
      setActiveTournament(updatedTourney);
      setScoreT1('');
      setScoreT2('');
      saveState('active', activeTournament.players, activeTournament.playerCount as 5 | 6, updatedTourney);
      return;
    }

    const winners = t1Score > t2Score ? [...currentMatch.team1] : [...currentMatch.team2];
    const losers = t1Score > t2Score ? [...currentMatch.team2] : [...currentMatch.team1];
    
    const winPairKey = getPairKey(winners[0], winners[1]);
    const winPairCount = nextHistory[winPairKey] || 0;
    const winnersMustSplit = winPairCount >= 2;

    // INTERCEPT FOR MANUAL SELECTION
    // If winners must split, we ALWAYS ask the user to choose who rests.
    // We can also ask who rests from the losers to be completely manual.
    setPendingBenchDecision({
      winners,
      losers,
      count: activeTournament.playerCount as 5 | 6,
      nextHistory,
      updatedMatches,
      winnersMustSplit
    });
  };

  const executeNextMatch = (manualResting: string[]) => {
    if (!activeTournament || !pendingBenchDecision) return;

    // Use the manual resting selection to generate the next match
    const nextMatch = generateNextMatchManual(
      activeTournament.players,
      pendingBenchDecision.updatedMatches,
      pendingBenchDecision.nextHistory,
      manualResting
    );

    const nextHistory = { ...pendingBenchDecision.nextHistory };
    const k1 = getPairKey(nextMatch.team1[0], nextMatch.team1[1]);
    const k2 = getPairKey(nextMatch.team2[0], nextMatch.team2[1]);
    nextHistory[k1] = (nextHistory[k1] || 0) + 1;
    nextHistory[k2] = (nextHistory[k2] || 0) + 1;

    const nextMatches = [...pendingBenchDecision.updatedMatches, nextMatch];

    const updatedTourney: MPLTournament = {
      ...activeTournament,
      matches: nextMatches,
      pairPlayHistory: nextHistory
    };

    setActiveTournament(updatedTourney);
    setScoreT1('');
    setScoreT2('');
    setPendingBenchDecision(null);
    saveState('active', activeTournament.players, activeTournament.playerCount as 5 | 6, updatedTourney);
  };

  // Generate next match using explicitly provided resting players
  const generateNextMatchManual = (
    playerList: MPLPlayer[],
    matches: MPLMatch[],
    pairHistory: Record<string, number>,
    restingIds: string[]
  ): MPLMatch => {
    const lastMatch = matches[matches.length - 1];
    const currentMatchNum = matches.length + 1;
    const roundNumber = lastMatch.round;
    const allIds = playerList.map(p => p.id);
    
    const courtPlayers = allIds.filter(id => !restingIds.includes(id));
    const [p1, p2, p3, p4] = courtPlayers;
    const allPairings: { team1: [string, string]; team2: [string, string] }[] = [
      { team1: [p1, p2], team2: [p3, p4] },
      { team1: [p1, p3], team2: [p2, p4] },
      { team1: [p1, p4], team2: [p2, p3] }
    ];

    const validPairings = allPairings.filter(p => {
      const k1 = getPairKey(p.team1[0], p.team1[1]);
      const k2 = getPairKey(p.team2[0], p.team2[1]);
      return (pairHistory[k1] || 0) < 2 && (pairHistory[k2] || 0) < 2;
    });

    const pool = validPairings.length > 0 ? validPairings : allPairings;
    const unmetKeys = new Set(getUnmetPairs(playerList, pairHistory).map(([a, b]) => getPairKey(a, b)));

    const scored = pool.map(pairing => {
      const k1 = getPairKey(pairing.team1[0], pairing.team1[1]);
      const k2 = getPairKey(pairing.team2[0], pairing.team2[1]);
      let pts = 0;
      if (unmetKeys.has(k1)) pts += 10;
      if (unmetKeys.has(k2)) pts += 10;
      if ((pairHistory[k1] || 0) >= 2) pts -= 100;
      if ((pairHistory[k2] || 0) >= 2) pts -= 100;

      // Reward keeping winners together if they are both on court
      const winners = lastMatch.score!.t1 > lastMatch.score!.t2 ? lastMatch.team1 : lastMatch.team2;
      const winKey = getPairKey(winners[0], winners[1]);
      if (courtPlayers.includes(winners[0]) && courtPlayers.includes(winners[1])) {
        if (k1 === winKey || k2 === winKey) pts += 3;
      }

      return { ...pairing, pts };
    });

    scored.sort((a, b) => b.pts - a.pts);
    const bestPts = scored[0].pts;
    const best = scored.filter(p => p.pts === bestPts);
    const chosen = best[Math.floor(Math.random() * best.length)];

    return {
      round: roundNumber,
      matchNumber: currentMatchNum,
      team1: chosen.team1,
      team2: chosen.team2,
      resting: restingIds
    };
  };
