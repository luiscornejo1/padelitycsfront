import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, User, Play, Plus, Trash2, Award, 
  RefreshCw, CheckCircle, Swords, UserPlus, Info, 
  Zap, AlertTriangle, Flag, Star, X
} from 'lucide-react';

interface MPLPlayer {
  id: string;
  name: string;
}

interface MPLMatch {
  round: number;
  matchNumber: number;
  team1: [string, string]; // player IDs
  team2: [string, string]; // player IDs
  score?: { t1: number; t2: number };
  resting: string[]; // player IDs
}

interface MPLTournament {
  id: number;
  playerCount: number; // 5 or 6
  players: MPLPlayer[];
  matches: MPLMatch[];
  currentRound: number;
  pairPlayHistory: Record<string, number>; // "p1Id-p2Id" -> count as PARTNERS in current round
}

export default function MicPadelLeagueView() {
  // MPL State
  const [stage, setStage] = useState<'config' | 'registration' | 'active' | 'finished'>('config');
  const [playerCount, setPlayerCount] = useState<5 | 6>(5);
  const [players, setPlayers] = useState<MPLPlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [activeTournament, setActiveTournament] = useState<MPLTournament | null>(null);
  
  // Live Match State
  const [scoreT1, setScoreT1] = useState<string>('');
  const [scoreT2, setScoreT2] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [rotationAlert, setRotationAlert] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedTournament = localStorage.getItem('padelitycs_mpl_tournament');
    const savedStage = localStorage.getItem('padelitycs_mpl_stage');
    const savedPlayers = localStorage.getItem('padelitycs_mpl_players');
    const savedPlayerCount = localStorage.getItem('padelitycs_mpl_player_count');

    if (savedTournament) {
      setActiveTournament(JSON.parse(savedTournament));
    }
    if (savedStage) {
      setStage(savedStage as any);
    }
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    if (savedPlayerCount) {
      setPlayerCount(parseInt(savedPlayerCount) as 5 | 6);
    }
  }, []);

  // Save states to local storage
  const saveState = (
    newStage: 'config' | 'registration' | 'active' | 'finished',
    newPlayers: MPLPlayer[],
    newCount: 5 | 6,
    newTourney: MPLTournament | null
  ) => {
    localStorage.setItem('padelitycs_mpl_stage', newStage);
    localStorage.setItem('padelitycs_mpl_players', JSON.stringify(newPlayers));
    localStorage.setItem('padelitycs_mpl_player_count', newCount.toString());
    if (newTourney) {
      localStorage.setItem('padelitycs_mpl_tournament', JSON.stringify(newTourney));
    } else {
      localStorage.removeItem('padelitycs_mpl_tournament');
    }
  };

  const handleResetTournament = () => {
    if (window.confirm('¿Estás seguro de que deseas reiniciar el torneo? Se perderán todos los datos actuales.')) {
      setActiveTournament(null);
      setStage('config');
      setPlayers([]);
      setNewPlayerName('');
      setScoreT1('');
      setScoreT2('');
      setValidationError(null);
      setShowFinishModal(false);
      
      localStorage.removeItem('padelitycs_mpl_tournament');
      localStorage.removeItem('padelitycs_mpl_stage');
      localStorage.removeItem('padelitycs_mpl_players');
      localStorage.removeItem('padelitycs_mpl_player_count');
    }
  };

  // ===== UTILITY HELPERS =====

  const getPairKey = (id1: string, id2: string) => {
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
  };

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };


  const determineNextMatch = (
    playerList: MPLPlayer[],
    matches: MPLMatch[],
    pairHistory: Record<string, number>,
    manualRestingId: string | null,
    count: 5 | 6
  ): { nextMatch: MPLMatch; alertMessage: string | null } => {
    const lastMatch = matches[matches.length - 1];
    const score = lastMatch.score || { t1: 0, t2: 0 };
    const currentMatchNum = matches.length + 1;
    const roundNumber = lastMatch.round;

    const winners = score.t1 > score.t2 ? [...lastMatch.team1] : [...lastMatch.team2];
    const losers = score.t1 > score.t2 ? [...lastMatch.team2] : [...lastMatch.team1];
    
    let alertMessage: string | null = null;
    let restingIds: string[] = [];

    if (count === 5) {
      if (manualRestingId) {
        restingIds = [manualRestingId];
      } else {
        restingIds = [losers[Math.floor(Math.random() * 2)]];
      }
    } else {
      restingIds = [...losers];
    }

    const allIds = playerList.map(p => p.id);
    const courtPlayers = allIds.filter(id => !restingIds.includes(id));

    const winPairKey = getPairKey(winners[0], winners[1]);
    const winnersOnCourt = winners.every(id => courtPlayers.includes(id));

    const [p1, p2, p3, p4] = courtPlayers;
    const pairings: { team1: [string, string]; team2: [string, string] }[] = [
      { team1: [p1, p2], team2: [p3, p4] },
      { team1: [p1, p3], team2: [p2, p4] },
      { team1: [p1, p4], team2: [p2, p3] }
    ];

    const unmetKeys = new Set(getUnmetPairs(playerList, pairHistory).map(([a, b]) => getPairKey(a, b)));

    const scored = pairings.map(pairing => {
      const k1 = getPairKey(pairing.team1[0], pairing.team1[1]);
      const k2 = getPairKey(pairing.team2[0], pairing.team2[1]);
      let pts = 0;

      if (winnersOnCourt) {
        if (k1 === winPairKey || k2 === winPairKey) {
          pts += 15;
        }
      }

      if ((pairHistory[k1] || 0) < 2) pts += 5;
      if ((pairHistory[k2] || 0) < 2) pts += 5;

      if (unmetKeys.has(k1)) pts += 10;
      if (unmetKeys.has(k2)) pts += 10;

      if ((pairHistory[k1] || 0) >= 2) pts -= 20;
      if ((pairHistory[k2] || 0) >= 2) pts -= 20;

      return { ...pairing, pts };
    });

    scored.sort((a, b) => b.pts - a.pts);
    const bestPts = scored[0].pts;
    const best = scored.filter(p => p.pts === bestPts);
    const chosen = best[Math.floor(Math.random() * best.length)];

    return {
      nextMatch: {
        round: roundNumber,
        matchNumber: currentMatchNum,
        team1: chosen.team1,
        team2: chosen.team2,
        resting: restingIds
      },
      alertMessage
    };
  };

  // Get pairs that still need more games together in this round
  const getUnmetPairs = (playerList: MPLPlayer[], pairHistory: Record<string, number>): [string, string][] => {
    const unmet: [string, string][] = [];
    for (let i = 0; i < playerList.length; i++) {
      for (let j = i + 1; j < playerList.length; j++) {
        const key = getPairKey(playerList[i].id, playerList[j].id);
        if ((pairHistory[key] || 0) < 2) {
          unmet.push([playerList[i].id, playerList[j].id]);
        }
      }
    }
    return unmet;
  };

  // ===== MATCHMAKING ALGORITHMS =====

  // Generate First Match of a round
  const generateFirstMatch = (playerList: MPLPlayer[], count: 5 | 6, roundNumber: number, matchNum: number): MPLMatch => {
    const shuffled = shuffle(playerList);

    if (count === 5) {
      return {
        round: roundNumber,
        matchNumber: matchNum,
        team1: [shuffled[0].id, shuffled[1].id],
        team2: [shuffled[2].id, shuffled[3].id],
        resting: [shuffled[4].id]
      };
    } else {
      return {
        round: roundNumber,
        matchNumber: matchNum,
        team1: [shuffled[0].id, shuffled[1].id],
        team2: [shuffled[2].id, shuffled[3].id],
        resting: [shuffled[4].id, shuffled[5].id]
      };
    }
  };

  // ===== EVENT HANDLERS =====

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    if (players.length >= playerCount) {
      alert(`Límite alcanzado. Este formato es para exactamente ${playerCount} jugadores.`);
      return;
    }

    const newPlayer: MPLPlayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayerName.trim()
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    setNewPlayerName('');
    saveState(stage, updatedPlayers, playerCount, activeTournament);
  };

  const handleDeletePlayer = (id: string) => {
    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    saveState(stage, updatedPlayers, playerCount, activeTournament);
  };

  const handleStartTournament = () => {
    if (players.length !== playerCount) {
      alert(`Por favor registra exactamente ${playerCount} jugadores.`);
      return;
    }

    const firstMatch = generateFirstMatch(players, playerCount, 1, 1);
    const newTourney: MPLTournament = {
      id: Date.now(),
      playerCount,
      players,
      matches: [firstMatch],
      currentRound: 1,
      pairPlayHistory: {}
    };

    // Record pairs from first match
    const k1 = getPairKey(firstMatch.team1[0], firstMatch.team1[1]);
    const k2 = getPairKey(firstMatch.team2[0], firstMatch.team2[1]);
    newTourney.pairPlayHistory[k1] = 1;
    newTourney.pairPlayHistory[k2] = 1;

    setActiveTournament(newTourney);
    setStage('active');
    saveState('active', players, playerCount, newTourney);
  };

  const [pendingBenchDecision, setPendingBenchDecision] = useState<{
    winners: string[];
    losers: string[];
    count: 5 | 6;
    nextHistory: Record<string, number>;
    updatedMatches: MPLMatch[];
    winnersMustSplit: boolean;
    losersMustSplit: boolean;
  } | null>(null);

  const handleRegisterScore = () => {
    if (!activeTournament || !currentMatch) return;
    const t1Score = parseInt(scoreT1);
    const t2Score = parseInt(scoreT2);

    if (isNaN(t1Score) || isNaN(t2Score) || t1Score < 0 || t2Score < 0) {
      setValidationError('Por favor ingresa un marcador válido (números positivos).');
      return;
    }

    if (t1Score > 10 || t2Score > 10) {
      setValidationError('El puntaje máximo por partido es de 10 puntos en la Mic Padel League.');
      return;
    }

    if (t1Score === t2Score) {
      setValidationError('El partido no puede terminar en empate. Debe haber un ganador.');
      return;
    }

    setValidationError(null);

    const updatedMatches = [...activeTournament.matches];
    updatedMatches[updatedMatches.length - 1] = {
      ...currentMatch,
      score: { t1: t1Score, t2: t2Score }
    };

    let nextHistory = { ...activeTournament.pairPlayHistory };
    const roundComplete = updatedMatches.filter(m => m.round === activeTournament.currentRound).length >= (activeTournament.playerCount === 5 ? 5 : 6);

    if (roundComplete) {
      const nextRoundNumber = activeTournament.currentRound + 1;
      const nextHistoryNewRound: Record<string, number> = {};
      
      const nextMatch = generateFirstMatch(
        activeTournament.players,
        activeTournament.playerCount as 5 | 6,
        nextRoundNumber,
        updatedMatches.length + 1
      );
      
      const k1 = getPairKey(nextMatch.team1[0], nextMatch.team1[1]);
      const k2 = getPairKey(nextMatch.team2[0], nextMatch.team2[1]);
      nextHistoryNewRound[k1] = 1;
      nextHistoryNewRound[k2] = 1;

      const updatedTourney = { 
        ...activeTournament, 
        matches: [...updatedMatches, nextMatch], 
        pairPlayHistory: nextHistoryNewRound,
        currentRound: nextRoundNumber 
      };

      setActiveTournament(updatedTourney);
      setScoreT1('');
      setScoreT2('');
      saveState('active', activeTournament.players, activeTournament.playerCount as 5 | 6, updatedTourney);
      return;
    }

    const winners = t1Score > t2Score ? [...currentMatch.team1] : [...currentMatch.team2];
    const losers = t1Score > t2Score ? [...currentMatch.team2] : [...currentMatch.team1];

    if (activeTournament.playerCount === 6) {
      const { nextMatch, alertMessage } = determineNextMatch(
        activeTournament.players,
        updatedMatches,
        nextHistory,
        null,
        6
      );

      setRotationAlert(alertMessage);

      const k1 = getPairKey(nextMatch.team1[0], nextMatch.team1[1]);
      const k2 = getPairKey(nextMatch.team2[0], nextMatch.team2[1]);
      nextHistory[k1] = (nextHistory[k1] || 0) + 1;
      nextHistory[k2] = (nextHistory[k2] || 0) + 1;

      const finalMatches = [...updatedMatches, nextMatch];

      const updatedTourney: MPLTournament = {
        ...activeTournament,
        matches: finalMatches,
        pairPlayHistory: nextHistory
      };

      setActiveTournament(updatedTourney);
      setScoreT1('');
      setScoreT2('');
      setPendingBenchDecision(null);
      saveState('active', activeTournament.players, 6, updatedTourney);
      return;
    }

    setRotationAlert(null);
    setPendingBenchDecision({
      winners,
      losers,
      count: activeTournament.playerCount as 5 | 6,
      nextHistory,
      updatedMatches,
      winnersMustSplit: false,
      losersMustSplit: false
    });
  };

  const executeNextMatch = (manualResting: string[]) => {
    if (!activeTournament || !pendingBenchDecision) return;

    // Generate the next match based on manual resting player
    const { nextMatch, alertMessage } = determineNextMatch(
      activeTournament.players,
      pendingBenchDecision.updatedMatches,
      pendingBenchDecision.nextHistory,
      manualResting[0],
      activeTournament.playerCount as 5 | 6
    );

    setRotationAlert(alertMessage);

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

  const handleFinishTournament = () => {
    if (!activeTournament) return;
    setStage('finished');
    setShowFinishModal(true);
    saveState('finished', activeTournament.players, activeTournament.playerCount as 5 | 6, activeTournament);
  };

  // ===== COMPUTED VALUES =====

  // Calculate Standings
  const getStandings = () => {
    if (!activeTournament) return [];

    const stats = activeTournament.players.map(p => ({
      id: p.id,
      name: p.name,
      setsWon: 0,
      setsLost: 0,
      pointsWon: 0,
      pointsLost: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      diff: 0
    }));

    activeTournament.matches.forEach(m => {
      if (!m.score) return;

      const team1Won = m.score.t1 > m.score.t2;

      m.team1.forEach(pId => {
        const player = stats.find(s => s.id === pId);
        if (player) {
          player.pointsWon += m.score!.t1;
          player.pointsLost += m.score!.t2;
          player.matchesPlayed += 1;
          if (team1Won) { player.setsWon += 1; player.wins += 1; }
          else { player.setsLost += 1; player.losses += 1; }
        }
      });

      m.team2.forEach(pId => {
        const player = stats.find(s => s.id === pId);
        if (player) {
          player.pointsWon += m.score!.t2;
          player.pointsLost += m.score!.t1;
          player.matchesPlayed += 1;
          if (!team1Won) { player.setsWon += 1; player.wins += 1; }
          else { player.setsLost += 1; player.losses += 1; }
        }
      });
    });

    stats.forEach(s => { s.diff = s.pointsWon - s.pointsLost; });

    return stats.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return b.pointsWon - a.pointsWon;
    });
  };

  // Get pair summary per round
  const getRoundPairSummary = () => {
    if (!activeTournament) return [];

    const rounds: { roundNumber: number; pairs: { p1Name: string; p2Name: string; count: number }[] }[] = [];

    // Group scored matches by round
    const matchesByRound: Record<number, MPLMatch[]> = {};
    activeTournament.matches.forEach(m => {
      if (!m.score) return;
      if (!matchesByRound[m.round]) matchesByRound[m.round] = [];
      matchesByRound[m.round].push(m);
    });

    const playerName = (id: string) => activeTournament.players.find(p => p.id === id)?.name || id;

    Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach(roundNum => {
        const roundMatches = matchesByRound[roundNum];
        const pairCounts: Record<string, number> = {};

        roundMatches.forEach(m => {
          const k1 = getPairKey(m.team1[0], m.team1[1]);
          const k2 = getPairKey(m.team2[0], m.team2[1]);
          pairCounts[k1] = (pairCounts[k1] || 0) + 1;
          pairCounts[k2] = (pairCounts[k2] || 0) + 1;
        });

        const pairs = Object.entries(pairCounts).map(([key, count]) => {
          const [id1, id2] = key.split('-');
          return {
            p1Name: playerName(id1),
            p2Name: playerName(id2),
            count
          };
        });

        // Sort: pairs with fewer games first (to highlight who still needs to play)
        pairs.sort((a, b) => a.count - b.count);

        rounds.push({ roundNumber: roundNum, pairs });
      });

    return rounds;
  };

  // Get progress for current round (matches played out of 5 or 6)
  const getRoundProgress = () => {
    if (!activeTournament) return { met: 0, total: 5 };
    const total = activeTournament.playerCount === 5 ? 5 : 6;
    const met = activeTournament.matches.filter(m => m.round === activeTournament.currentRound && m.score).length;
    return { met, total };
  };

  const standings = getStandings();
  const currentMatch = activeTournament?.matches[activeTournament.matches.length - 1];
  
  const isRoundComplete = activeTournament 
    ? activeTournament.matches.filter(m => m.round === activeTournament.currentRound && m.score).length >= (activeTournament.playerCount === 5 ? 5 : 6)
    : false;
  
  const roundProgress = getRoundProgress();
  const roundPairSummary = getRoundPairSummary();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <AnimatePresence mode="wait">
        
        {/* STAGE 1: CONFIGURATION */}
        {stage === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-md flex flex-col gap-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <Trophy className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-wide uppercase">Torneo Mic Padel League</h2>
                <p className="text-slate-400 text-sm mt-2 max-w-md">
                  El formato definitivo para jugar en una sola cancha con rotación dinámica inteligente y puntuación individual basada en sets/juegos.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 my-2 pt-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center block mb-4">
                ¿Cuántos jugadores participan hoy?
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {[5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setPlayerCount(num as any)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 gap-3 group relative overflow-hidden ${
                      playerCount === num 
                        ? 'bg-emerald-600/10 border-emerald-500/50 shadow-lg shadow-emerald-950/20' 
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/70'
                    }`}
                  >
                    {playerCount === num && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <Users className={`w-8 h-8 ${playerCount === num ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="text-2xl font-black text-white">{num} Jugadores</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">
                      {num === 5 ? '1 Cancha (4 juegan, 1 descansa)' : '1 Cancha (4 juegan, 2 descansan)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setStage('registration');
                saveState('registration', players, playerCount, activeTournament);
              }}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 group text-sm uppercase tracking-widest"
            >
              Comenzar Configuración
              <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* STAGE 2: PLAYER REGISTRATION */}
        {stage === 'registration' && (
          <motion.div
            key="registration"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col lg:flex-row gap-8 w-full"
          >
            {/* Input card */}
            <div className="w-full lg:w-5/12 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-6 shadow-xl h-fit">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Inscribir Jugadores</h3>
                  <p className="text-xs text-slate-500">Torneo de {playerCount} jugadores</p>
                </div>
              </div>

              <form onSubmit={handleAddPlayer} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Nombre del Jugador
                  </label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    disabled={players.length >= playerCount}
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 disabled:opacity-40 focus:border-emerald-500 focus:outline-none rounded-xl py-3 px-4 text-white placeholder:text-slate-600 transition-all text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={players.length >= playerCount}
                  className="w-full bg-emerald-600/90 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Jugador
                </button>
              </form>

              <div className="bg-slate-950/30 rounded-xl p-4 border border-slate-800/40 mt-2 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para este formato de la Mic Padel League necesitas registrar exactamente <strong className="text-emerald-400">{playerCount} jugadores</strong>. 
                  La ronda acaba cuando todos hayan jugado 2 veces como pareja con cada jugador.
                </p>
              </div>
            </div>

            {/* List and Actions card */}
            <div className="w-full lg:w-7/12 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  Jugadores Registrados
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700/60">
                    {players.length} / {playerCount}
                  </span>
                </h3>
                <button
                  onClick={() => {
                    setStage('config');
                    saveState('config', players, playerCount, activeTournament);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cambiar Formato
                </button>
              </div>

              <div className="min-h-[220px] bg-slate-950/30 rounded-2xl border border-slate-800/50 flex flex-col overflow-hidden">
                {players.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center gap-2">
                    <Users className="w-10 h-10 opacity-20" />
                    <p className="text-sm">Aún no has agregado ningún jugador.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    <AnimatePresence>
                      {players.map((p, idx) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-black text-slate-400 flex items-center justify-center border border-slate-700">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-white">{p.name}</span>
                          </div>
                          <button
                            onClick={() => handleDeletePlayer(p.id)}
                            className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <button
                onClick={handleStartTournament}
                disabled={players.length !== playerCount}
                className="w-full bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm uppercase tracking-widest mt-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Iniciar Torneo en Vivo
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: ACTIVE TOURNAMENT (LIVE GAME & STANDINGS) */}
        {(stage === 'active' || stage === 'finished') && activeTournament && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-8 w-full"
          >
            {/* Header Control Panel */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-md">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">
                    Mic Padel League ({activeTournament.playerCount} Jugadores)
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-slate-400">
                      Ronda {activeTournament.currentRound} — Partido #{activeTournament.matches.length} — Parejas completas: {roundProgress.met}/{roundProgress.total}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {stage === 'active' && (
                  <button
                    onClick={handleFinishTournament}
                    className="flex-1 md:flex-none px-4 py-2 border border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Terminar Torneo
                  </button>
                )}
                <button
                  onClick={handleResetTournament}
                  className="flex-1 md:flex-none px-4 py-2 border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reiniciar
                </button>
              </div>
            </div>

            {/* Round progress bar */}
            {stage === 'active' && (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progreso de Ronda {activeTournament.currentRound}</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {roundProgress.met}/{roundProgress.total} parejas completas
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950/60 rounded-full overflow-hidden border border-slate-800/40">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${roundProgress.total > 0 ? (roundProgress.met / roundProgress.total) * 100 : 0}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* UNIFIED CONTAINER CARD */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-850">
              
              {/* LEFT SIDE: MATCH & CONTROLS */}
              <div className="w-full lg:w-1/2 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Partido en Curso</h4>
                </div>

                {rotationAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl p-4 flex items-start gap-3 shadow-md relative"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs font-semibold leading-relaxed flex-1">
                      {rotationAlert}
                    </div>
                    <button
                      onClick={() => setRotationAlert(null)}
                      className="text-amber-400/60 hover:text-amber-400 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {stage === 'active' && currentMatch && (
                  pendingBenchDecision ? (
                    // --- MANUAL BENCH SELECTION UI ---
                    <div className="bg-slate-900/60 border border-emerald-500/30 p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full"></div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">
                            Rotación de Perdedores
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Elige quién del equipo perdedor irá a la banca. Los ganadores se quedarán jugando juntos.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Selecciona qué jugador de la pareja PERDEDORA descansa:
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          {pendingBenchDecision.losers.map(playerId => {
                            const player = activeTournament.players.find(p => p.id === playerId);
                            return (
                              <button
                                key={playerId}
                                onClick={() => {
                                  let finalResting = [playerId];
                                  if (pendingBenchDecision.count === 6) {
                                    finalResting = [...pendingBenchDecision.losers];
                                  }
                                  executeNextMatch(finalResting);
                                }}
                                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all p-4 rounded-xl flex flex-col items-center gap-2 group"
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40">
                                  <User className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                                </div>
                                <span className="text-sm font-bold text-white group-hover:text-emerald-400">
                                  {player?.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {pendingBenchDecision.count === 6 && (
                          <div className="mt-2 text-center text-[10px] text-slate-500 italic">
                            En formato de 6 jugadores, ambos perdedores irán a la banca. Haz clic en cualquiera para continuar.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // --- NORMAL MATCH SCORE INPUT ---
                    <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                      
                      {/* Visual Arena representation */}
                      <div className="flex flex-col gap-4 relative z-10">
                        
                        {/* Team 1 Card */}
                        <div className="bg-slate-900/85 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/20 transition-all">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Pareja A</span>
                            <div className="text-md font-bold text-white">
                              {activeTournament.players.find(p => p.id === currentMatch.team1[0])?.name}
                            </div>
                            <div className="text-md font-bold text-white">
                              {activeTournament.players.find(p => p.id === currentMatch.team1[1])?.name}
                            </div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={scoreT1}
                            onChange={(e) => setScoreT1(e.target.value)}
                            placeholder="0"
                            className="w-16 h-16 bg-slate-950/80 border border-slate-700/60 rounded-xl text-center text-3xl font-black text-white focus:outline-none focus:border-emerald-500 focus:bg-slate-950 transition-all placeholder:text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>

                        {/* VS Indicator */}
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 tracking-wider">
                            VS
                          </div>
                        </div>

                        {/* Team 2 Card */}
                        <div className="bg-slate-900/85 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/20 transition-all">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Pareja B</span>
                            <div className="text-md font-bold text-white">
                              {activeTournament.players.find(p => p.id === currentMatch.team2[0])?.name}
                            </div>
                            <div className="text-md font-bold text-white">
                              {activeTournament.players.find(p => p.id === currentMatch.team2[1])?.name}
                            </div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={scoreT2}
                            onChange={(e) => setScoreT2(e.target.value)}
                            placeholder="0"
                            className="w-16 h-16 bg-slate-950/80 border border-slate-700/60 rounded-xl text-center text-3xl font-black text-white focus:outline-none focus:border-emerald-500 focus:bg-slate-950 transition-all placeholder:text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>

                      </div>

                      {/* Validation Error Alert */}
                      {validationError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                          <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-red-400 font-medium">{validationError}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={handleRegisterScore}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        <CheckCircle className="w-4.5 h-4.5" />
                        Registrar Partido y Rotar
                      </button>
                    </div>
                  )
                )}

                {/* Resting players list */}
                {stage === 'active' && currentMatch && !isRoundComplete && (
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                      En la banca (Descansa en este partido)
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {currentMatch.resting.map(restingId => {
                        const player = activeTournament.players.find(p => p.id === restingId);
                        return (
                          <span
                            key={restingId}
                            className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            {player?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* FINISHED STATE */}
                {stage === 'finished' && !showFinishModal && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Torneo Finalizado</h4>
                      <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                        ¡Felicitaciones! Revisa el podio a la derecha.
                      </p>
                    </div>
                    <button
                      onClick={handleResetTournament}
                      className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all"
                    >
                      Crear Nuevo Torneo
                    </button>
                  </div>
                )}

                {/* Match History feed */}
                <div className="flex flex-col gap-3 mt-2 border-t border-slate-850 pt-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Historial de Partidos (Últimos 6)
                  </label>
                  <div className="flex flex-col gap-2">
                    {activeTournament.matches
                      .filter(m => m.score)
                      .reverse()
                      .slice(0, 6)
                      .map((m) => (
                      <div 
                        key={m.matchNumber}
                        className="bg-slate-950/20 border border-slate-900 p-3.5 rounded-xl flex items-center justify-between text-xs hover:bg-slate-950/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded">
                            # {m.matchNumber}
                          </span>
                          <span className="text-[10px] text-slate-600">R{m.round}</span>
                          <span className="text-slate-400">
                            {activeTournament.players.find(p => p.id === m.team1[0])?.name.split(' ')[0]} / {activeTournament.players.find(p => p.id === m.team1[1])?.name.split(' ')[0]}
                          </span>
                          <span className="text-slate-500">vs</span>
                          <span className="text-slate-400">
                            {activeTournament.players.find(p => p.id === m.team2[0])?.name.split(' ')[0]} / {activeTournament.players.find(p => p.id === m.team2[1])?.name.split(' ')[0]}
                          </span>
                        </div>
                        <div className="font-mono font-black text-emerald-400 text-sm">
                          {m.score?.t1} – {m.score?.t2}
                        </div>
                      </div>
                    ))}
                    {activeTournament.matches.filter(m => m.score).length === 0 && (
                      <span className="text-xs text-slate-600 pl-1">Aún no hay partidos terminados.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT SIDE: STANDINGS */}
              <div className="w-full lg:w-1/2 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Posiciones Individuales</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Por Partidos Ganados
                  </span>
                </div>

                <div className="bg-slate-950/30 rounded-2xl border border-slate-800/60 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                      <tr>
                        <th className="py-3 px-4 text-center w-12">#</th>
                        <th className="py-3 px-2">Jugador</th>
                        <th className="py-3 px-2 text-center w-14">PG</th>
                        <th className="py-3 px-2 text-center w-12">PJ</th>
                        <th className="py-3 px-2 text-center w-14">PP</th>
                        <th className="py-3 px-2 text-center w-18">Pts+</th>
                        <th className="py-3 px-4 text-center w-16">Dif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((s, idx) => {
                        const isLeader = idx === 0;
                        const isRunnerUp = idx === 1;
                        return (
                          <tr 
                            key={s.id}
                            className={`border-b border-slate-900/50 hover:bg-slate-800/10 transition-colors ${
                              isLeader ? 'bg-emerald-500/[0.02]' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center">
                              {isLeader ? (
                                <span className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center mx-auto text-xs font-black shadow-md shadow-yellow-950/10">
                                  🥇
                                </span>
                              ) : isRunnerUp ? (
                                <span className="w-6 h-6 rounded-full bg-slate-300/10 border border-slate-300/30 text-slate-300 flex items-center justify-center mx-auto text-xs font-black">
                                  🥈
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-slate-500">
                                  {idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`text-sm font-semibold ${isLeader ? 'text-emerald-300 font-bold' : 'text-slate-200'}`}>
                                {s.name}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-center font-mono font-black text-emerald-400 text-sm">
                              {s.wins}
                            </td>
                            <td className="py-3.5 px-2 text-center font-mono text-slate-400 text-xs">
                              {s.matchesPlayed}
                            </td>
                            <td className="py-3.5 px-2 text-center font-mono text-red-400 text-xs">
                              {s.losses}
                            </td>
                            <td className="py-3.5 px-2 text-center font-mono text-slate-300 text-xs">
                              {s.pointsWon}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-xs">
                              <span className={s.diff > 0 ? 'text-emerald-400' : s.diff < 0 ? 'text-red-400' : 'text-slate-500'}>
                                {s.diff > 0 ? `+${s.diff}` : s.diff}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Score calculation info */}
                <div className="bg-slate-950/20 border border-slate-900/60 p-4 rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>Sistema de Puntuación:</strong> Cada partido se juega por puntos individuales (máx. 10). <strong>PG</strong> = Partidos Ganados, <strong>PJ</strong> = Partidos Jugados, <strong>PP</strong> = Partidos Perdidos. Se ordena por partidos ganados, diferencia de puntos y puntos a favor.
                  </p>
                </div>

                {/* Resting status in current round */}
                {activeTournament && (
                  (() => {
                    const currentRoundMatches = activeTournament.matches.filter(m => m.round === activeTournament.currentRound);
                    const restedIds = new Set<string>();
                    currentRoundMatches.forEach(m => {
                      m.resting.forEach(id => restedIds.add(id));
                    });
                    const notRested = activeTournament.players.filter(p => !restedIds.has(p.id));

                    return (
                      <div className="bg-slate-950/20 border border-slate-900/60 p-4 rounded-xl flex items-start gap-3">
                        <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          <strong>Faltan por descansar esta ronda:</strong>{" "}
                          {notRested.length > 0 ? (
                            <span className="text-emerald-400 font-bold">
                              {notRested.map(p => p.name).join(", ")}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Todos los jugadores han descansado en esta ronda.</span>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}

              </div>

            </div>

            {/* ROUND PAIR HISTORY CARD */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-xl p-6 flex flex-col gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Swords className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Historial de Parejas por Ronda</h4>
              </div>

              {roundPairSummary.length === 0 ? (
                <p className="text-xs text-slate-600">Aún no hay parejas registradas.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {roundPairSummary.map(round => (
                    <div key={round.roundNumber} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                          Ronda {round.roundNumber}
                        </span>
                        <span className="flex-1 h-px bg-slate-800/60" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {round.pairs.map((pair, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                              pair.count >= 2
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                                : 'bg-slate-950/30 border-slate-800/40 text-slate-400'
                            }`}
                          >
                            <span className="truncate mr-1">
                              {pair.p1Name.split(' ')[0]} & {pair.p2Name.split(' ')[0]}
                            </span>
                            <span className={`font-mono font-black text-sm shrink-0 ${
                              pair.count >= 2 ? 'text-emerald-400' : 'text-slate-500'
                            }`}>
                              {pair.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Show unmet pairs for current round if active */}
                  {stage === 'active' && !isRoundComplete && (
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-300/80 leading-relaxed">
                        <strong>Faltan por completar:</strong>{' '}
                        {getUnmetPairs(activeTournament.players, activeTournament.pairPlayHistory).map(([id1, id2], i, arr) => {
                          const n1 = activeTournament.players.find(p => p.id === id1)?.name.split(' ')[0];
                          const n2 = activeTournament.players.find(p => p.id === id2)?.name.split(' ')[0];
                          return (
                            <span key={`${id1}-${id2}`}>
                              {n1} & {n2}
                              {i < arr.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* FINISH TOURNAMENT MODAL */}
      <AnimatePresence>
        {showFinishModal && activeTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowFinishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full flex flex-col items-center gap-6 relative overflow-hidden shadow-2xl"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-purple-500" />
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

              <button
                onClick={() => setShowFinishModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Trophy animation */}
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 8, stiffness: 150, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-emerald-500/10 border-2 border-yellow-500/30 flex items-center justify-center shadow-xl shadow-yellow-900/10"
              >
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-5xl"
                >
                  🏆
                </motion.span>
              </motion.div>

              <div className="text-center">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-black text-white uppercase tracking-wider"
                >
                  ¡Torneo Finalizado!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-slate-400 mt-2"
                >
                  Resultados finales por partidos ganados
                </motion.p>
              </div>

              {/* Podium */}
              <div className="w-full flex flex-col gap-2">
                {standings.slice(0, activeTournament.playerCount).map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.12 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      idx === 0
                        ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/30 shadow-md shadow-yellow-900/10'
                        : idx === 1
                        ? 'bg-slate-800/30 border-slate-600/30'
                        : idx === 2
                        ? 'bg-amber-900/10 border-amber-700/20'
                        : 'bg-slate-900/20 border-slate-800/40'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <span className={`text-sm font-bold flex-1 ${idx === 0 ? 'text-yellow-300' : 'text-white'}`}>
                      {s.name}
                    </span>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-emerald-400 font-bold">{s.wins}W</span>
                      <span className="text-red-400">{s.losses}L</span>
                      <span className={`font-bold ${s.diff > 0 ? 'text-emerald-400' : s.diff < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {s.diff > 0 ? `+${s.diff}` : s.diff}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Confetti stars */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  initial={{
                    x: '50%',
                    y: '50%',
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    x: `${10 + Math.random() * 80}%`,
                    y: `${5 + Math.random() * 90}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: 0.5 + Math.random() * 1,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                >
                  <Star className={`w-3 h-3 ${
                    ['text-yellow-400', 'text-emerald-400', 'text-purple-400', 'text-pink-400'][i % 4]
                  }`} fill="currentColor" />
                </motion.div>
              ))}

              <button
                onClick={() => {
                  setShowFinishModal(false);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all mt-2"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
