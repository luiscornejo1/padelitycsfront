export const getStandings = (group: any, matchScores: Record<string, {t1:number, t2:number}> = {}) => {
  const standings = group.pairs.map((p: any) => ({
    ...p,
    name: p.name || `${p.player1?.name?.split(' ')[0] || 'Jugador'} / ${p.player2?.name?.split(' ')[0] || 'Jugador'}`,
    points: 0,
    gamesAgainst: 0,
    matchesPlayed: 0
  }));

  group.matches.forEach((m: any, matchIdx: number) => {
    const matchId = `g${group.courtNumber}_m${matchIdx}`;
    const score = matchScores[matchId];
    if (score) {
      const t1 = standings.find((s: any) => s.id === m.team1.id);
      const t2 = standings.find((s: any) => s.id === m.team2.id);
      const hasBeenPlayed = score !== undefined;
      
      if (hasBeenPlayed) {
        if (t1) {
          t1.points += score.t1;
          t1.gamesAgainst += score.t2;
          t1.matchesPlayed += 1;
        }
        if (t2) {
          t2.points += score.t2;
          t2.gamesAgainst += score.t1;
          t2.matchesPlayed += 1;
        }
      }
    }
  });

  return standings.sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    return (a.gamesAgainst || 0) - (b.gamesAgainst || 0); // lower gamesAgainst is better
  });
};

export const getStandingsByGroup = (activeT: any) => {
  if (!activeT || !activeT.fixture) return [];

  return activeT.fixture.map((group: any) => ({
    courtNumber: group.courtNumber,
    courtName: group.courtName,
    standings: getStandings(group, activeT.matchScores)
  }));
};

export const getOverallClassified = (activeT: any, returnAllPairs: boolean = false) => {
  if (!activeT) return [];
  
  const participantsList = activeT.participants || (Array.isArray(activeT.pairs) ? activeT.pairs : []);

  if (!activeT.fixture) return participantsList.map((p: any, idx: number) => ({
    id: p.id, name: p.name || `${p.p1Name?.split(' ')[0] || 'Jugador'} / ${p.p2Name?.split(' ')[0] || 'Jugador'}`, seed: `${idx + 1}`, court: 'Manual', points: 0, matchesPlayed: 0
  }));

  if (activeT.format === 'personalizado') {
    const individualStandings = participantsList.map((p: any) => ({
      id: p.id,
      name: p.name,
      points: 0,
      matchesPlayed: 0
    }));

    activeT.fixture.forEach((group: any) => {
      group.matches.forEach((m: any, matchIdx: number) => {
        const matchId = `g${group.courtNumber}_m${matchIdx}`;
        const score = activeT.matchScores?.[matchId];
        if (score !== undefined) {
          const team1Won = score.t1 > score.t2;
          const team2Won = score.t2 > score.t1;
          
          [m.team1.player1, m.team1.player2].forEach((player: any) => {
            const standing = individualStandings.find((s: any) => s.id === player.id.replace('ind-', ''));
            if (standing) {
              if (team1Won) standing.points += 1;
              standing.matchesPlayed += 1;
            }
          });
          [m.team2.player1, m.team2.player2].forEach((player: any) => {
            const standing = individualStandings.find((s: any) => s.id === player.id.replace('ind-', ''));
            if (standing) {
              if (team2Won) standing.points += 1;
              standing.matchesPlayed += 1;
            }
          });
        }
      });
    });

    return individualStandings.sort((a: any, b: any) => b.points - a.points).map((p: any, idx: number) => ({
      id: p.id,
      name: p.name,
      seed: `${idx + 1}`,
      court: 'Tabla General',
      points: p.points,
      matchesPlayed: p.matchesPlayed,
      isSetFormat: true
    }));
  }
  
  if (activeT.format === 'fase_de_grupos') {
    const topPairsPerGroup: any[][] = [];
    activeT.fixture.forEach((group: any) => {
      const standings = getStandings(group, activeT.matchScores);
      standings.sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points;
        if (a.matchesPlayed !== b.matchesPlayed) return a.matchesPlayed - b.matchesPlayed;
        return a.id.toString().localeCompare(b.id.toString());
      });
      topPairsPerGroup.push(standings.map((s: any) => ({...s, groupName: group.courtName}))); 
    });

    if (returnAllPairs) {
        return topPairsPerGroup.flat().sort((a: any, b: any) => b.points - a.points).map((p: any, idx: number) => ({
            id: p.id.toString(),
            name: `${p.player1?.name?.split(' ')[0] || ''} / ${p.player2?.name?.split(' ')[0] || ''}`,
            seed: `${idx + 1}`,
            court: p.groupName || 'Grupo',
            points: p.points,
            matchesPlayed: p.matchesPlayed
        }));
    }

    const seeds: any[] = [];
    if (topPairsPerGroup.length === 2) {
      if (topPairsPerGroup[0][0]) seeds.push(topPairsPerGroup[0][0]); // 1A
      if (topPairsPerGroup[1][1]) seeds.push(topPairsPerGroup[1][1]); // 2B
      if (topPairsPerGroup[1][0]) seeds.push(topPairsPerGroup[1][0]); // 1B
      if (topPairsPerGroup[0][1]) seeds.push(topPairsPerGroup[0][1]); // 2A
    } else if (topPairsPerGroup.length === 4) {
      if (topPairsPerGroup[0][0]) seeds.push(topPairsPerGroup[0][0]); // 1A
      if (topPairsPerGroup[1][1]) seeds.push(topPairsPerGroup[1][1]); // 2B
      if (topPairsPerGroup[2][0]) seeds.push(topPairsPerGroup[2][0]); // 1C
      if (topPairsPerGroup[3][1]) seeds.push(topPairsPerGroup[3][1]); // 2D
      if (topPairsPerGroup[1][0]) seeds.push(topPairsPerGroup[1][0]); // 1B
      if (topPairsPerGroup[0][1]) seeds.push(topPairsPerGroup[0][1]); // 2A
      if (topPairsPerGroup[3][0]) seeds.push(topPairsPerGroup[3][0]); // 1D
      if (topPairsPerGroup[2][1]) seeds.push(topPairsPerGroup[2][1]); // 2C
    } else if (topPairsPerGroup.length === 8) {
      seeds.push(...topPairsPerGroup.map(g => g[0]));
      seeds.push(...topPairsPerGroup.map(g => g[1]));
    } else {
      const combined = topPairsPerGroup.flat();
      combined.sort((a: any, b: any) => b.points - a.points);
      seeds.push(...combined.slice(0, 8));
    }

    return seeds.filter(Boolean).map((p, idx) => ({
      id: p.id.toString(),
      name: `${p.player1?.name?.split(' ')[0] || ''} / ${p.player2?.name?.split(' ')[0] || ''}`,
      seed: `${idx + 1}`,
      court: p.groupName,
      points: p.points,
      matchesPlayed: p.matchesPlayed
    }));
  }

  // Fallback para Americano y Romano
  let allPairs: any[] = [];
  activeT.fixture.forEach((group: any) => {
    const standings = getStandings(group, activeT.matchScores);
    allPairs = [...allPairs, ...standings.map((s: any) => ({...s, groupName: group.courtName}))];
  });
  
  allPairs.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.matchesPlayed !== b.matchesPlayed) return a.matchesPlayed - b.matchesPlayed;
    return a.id.toString().localeCompare(b.id.toString());
  });
  
  const count = returnAllPairs ? allPairs.length : (allPairs.length >= 8 ? 8 : (allPairs.length >= 4 ? 4 : allPairs.length));
  return allPairs.slice(0, count).map((p, idx) => ({
    id: p.id.toString(),
    name: `${p.player1?.name?.split(' ')[0] || ''} / ${p.player2?.name?.split(' ')[0] || ''}`,
    seed: `${idx + 1}`,
    court: p.groupName || 'Tabla General',
    points: p.points,
    matchesPlayed: p.matchesPlayed
  }));
};
