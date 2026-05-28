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
  round: number; // 1 to 10
  team1: [string, string]; // Lado A
  team2: [string, string]; // Lado B
  score?: { t1: number; t2: number };
  resting: string[]; // Length 1 for 5 players
  winnerSide?: 'A' | 'B';
  exitSide?: 'A' | 'B';
  playerExiting?: string;
  playerEntering?: string;
  selectionType?: 'auto' | 'manual';
  intercalated?: boolean;
}

interface MPLTournament {
  id: number;
  playerCount: number; // Always 5 for this strict rule set
  players: MPLPlayer[];
  matches: MPLMatch[];
  currentRound: number;
  pairPlayHistory: Record<string, number>; // "p1Id-p2Id" -> count
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

  const getPlayerName = (id: string | undefined) => {
    if (!id || !activeTournament) return '';
    return activeTournament.players.find(p => p.id === id)?.name || '';
  };

  // ===== MATCHMAKING & RULES ENGINE =====

  const getConsecutiveMatches = (playerId: string, matches: MPLMatch[]) => {
    let count = 0;
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      if (!m.score) continue;
      if (m.team1.includes(playerId) || m.team2.includes(playerId)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const getRestCount = (playerId: string, matches: MPLMatch[]) => {
    return matches.filter(m => m.score && m.resting.includes(playerId)).length;
  };

  const evaluateExitCandidates = (
    currentMatchIndex: number,
    winnerSide: 'A' | 'B',
    updatedMatches: MPLMatch[],
    pairHistory: Record<string, number>
  ) => {
    const currentMatch = updatedMatches[currentMatchIndex];
    let exitSide: 'A' | 'B';

    // Detectar si algún jugador en cancha tiene 4 partidos seguidos (DEBE descansar)
    const allOnCourt = [...currentMatch.team1, ...currentMatch.team2];
    const playersWith4 = allOnCourt.filter(pid => getConsecutiveMatches(pid, updatedMatches) >= 4);

    if (playersWith4.length > 0) {
      // REGLA DE 4 CONSECUTIVOS MANDA: El jugador con 4 seguidos DEBE salir.
      // Determinar en qué lado está ese jugador para forzar el exitSide.
      const forcedPlayer = playersWith4[0];
      if (currentMatch.team1.includes(forcedPlayer)) {
        exitSide = 'A';
      } else {
        exitSide = 'B';
      }
    } else {
      // Rondas 1-5 (o cuando nadie tiene 4 seguidos): Usar alternancia estricta
      if (currentMatchIndex === 0) {
        exitSide = winnerSide === 'A' ? 'B' : 'A';
      } else {
        const lastMatch = updatedMatches[currentMatchIndex - 1];
        exitSide = lastMatch.exitSide === 'A' ? 'B' : 'A';
      }
    }

    const candidates = exitSide === 'A' ? [...currentMatch.team1] : [...currentMatch.team2];
    const restingPlayer = currentMatch.resting[0]; // El que va a entrar

    const allHaveRestedOnce = activeTournament!.players.every(p => getRestCount(p.id, updatedMatches) > 0);

    let rejectionReasons: Record<string, string> = {};

    const validCandidates = candidates.filter(candId => {
      const consecutive = getConsecutiveMatches(candId, updatedMatches);
      const rests = getRestCount(candId, updatedMatches);

      const otherCand = candidates.find(c => c !== candId)!;
      const otherConsecutive = getConsecutiveMatches(otherCand, updatedMatches);
      const otherRests = getRestCount(otherCand, updatedMatches);

      // Prioridad 1: Si un jugador tiene 4 seguidos, DEBE ser él quien sale
      if (otherConsecutive >= 4 && consecutive < 4) {
        rejectionReasons[candId] = `${getPlayerName(otherCand)} tiene 4 seguidos y DEBE descansar.`;
        return false;
      }
      if (consecutive >= 4) {
        // Este jugador DEBE salir, así que es válido como candidato para salir
        return true;
      }

      // Prioridad 2: Ciclo de descansos (solo si no todos han descansado al menos una vez)
      if (!allHaveRestedOnce && rests > 0 && otherRests === 0) {
        rejectionReasons[candId] = `Ya descansó en este ciclo y ${getPlayerName(otherCand)} aún no.`;
        return false;
      }

      // Prioridad 3: Límite de parejas
      const futurePairKeyIfIStay = getPairKey(candId, restingPlayer);
      if ((pairHistory[futurePairKeyIfIStay] || 0) >= 2) {
        rejectionReasons[otherCand] = `Si sale ${getPlayerName(otherCand)}, se formaría pareja repetida (${getPlayerName(candId)} + ${getPlayerName(restingPlayer)}).`;
      }

      const futurePairKeyIfOtherStays = getPairKey(otherCand, restingPlayer);
      if ((pairHistory[futurePairKeyIfOtherStays] || 0) >= 2) {
        rejectionReasons[candId] = `Si te quedas, ${getPlayerName(otherCand)} formaría pareja repetida con ${getPlayerName(restingPlayer)}.`;
        return false;
      }

      return true;
    });

    if (validCandidates.length === 0) {
      // Fallback: Si todas las reglas chocan, priorizar 4 seguidos
      const with4 = candidates.filter(c => getConsecutiveMatches(c, updatedMatches) >= 4);
      if (with4.length > 0) return { exitSide, validCandidates: with4, rejectionReasons };
      return { exitSide, validCandidates: candidates, rejectionReasons };
    }

    return { exitSide, validCandidates, rejectionReasons };
  };

  // Generate First Match of a round
  const generateFirstMatch = (playerList: MPLPlayer[]): MPLMatch => {
    // Si queremos que SIEMPRE sea: A (1,2), B (3,4), Descansa: 5
    return {
      round: 1,
      team1: [playerList[0].id, playerList[1].id],
      team2: [playerList[2].id, playerList[3].id],
      resting: [playerList[4].id]
    };
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
    if (players.length !== 5) {
      alert(`Por favor registra exactamente 5 jugadores.`);
      return;
    }

    const firstMatch = generateFirstMatch(players);
    const newTourney: MPLTournament = {
      id: Date.now(),
      playerCount: 5,
      players,
      matches: [firstMatch],
      currentRound: 1,
      pairPlayHistory: {}
    };

    const k1 = getPairKey(firstMatch.team1[0], firstMatch.team1[1]);
    const k2 = getPairKey(firstMatch.team2[0], firstMatch.team2[1]);
    newTourney.pairPlayHistory[k1] = 1;
    newTourney.pairPlayHistory[k2] = 1;

    setActiveTournament(newTourney);
    setStage('active');
    saveState('active', players, 5, newTourney);
  };

  const [pendingBenchDecision, setPendingBenchDecision] = useState<{
    exitSide: 'A' | 'B';
    candidates: string[];
    validCandidates: string[];
    rejectionReasons: Record<string, string>;
    updatedMatches: MPLMatch[];
    winnerSide: 'A' | 'B';
    nextHistory: Record<string, number>;
  } | null>(null);

  const handleRegisterScore = () => {
    if (!activeTournament) return;
    const currentMatch = activeTournament.matches[activeTournament.matches.length - 1];
    
    const t1Score = parseInt(scoreT1);
    const t2Score = parseInt(scoreT2);

    if (isNaN(t1Score) || isNaN(t2Score) || t1Score < 0 || t2Score < 0) {
      setValidationError('Por favor ingresa un marcador válido (números positivos).');
      return;
    }

    if (t1Score === t2Score) {
      setValidationError('El partido no puede terminar en empate. Debe haber un ganador.');
      return;
    }

    setValidationError(null);

    const winnerSide = t1Score > t2Score ? 'A' : 'B';
    
    const updatedMatches = [...activeTournament.matches];
    updatedMatches[updatedMatches.length - 1] = {
      ...currentMatch,
      score: { t1: t1Score, t2: t2Score },
      winnerSide
    };

    const nextHistory = { ...activeTournament.pairPlayHistory };
    
    const { exitSide, validCandidates, rejectionReasons } = evaluateExitCandidates(
      updatedMatches.length - 1, 
      winnerSide, 
      updatedMatches, 
      nextHistory
    );

    const allCandidates = exitSide === 'A' ? [...currentMatch.team1] : [...currentMatch.team2];

    // Mostrar UI manual siempre, según pedido del usuario ("no asignes automaticamente deja que yo eliga en todas las rondas")
    setRotationAlert(null);
    setPendingBenchDecision({
      exitSide,
      candidates: allCandidates,
      validCandidates,
      rejectionReasons,
      updatedMatches,
      winnerSide,
      nextHistory
    });
  };

  const executeNextMatch = (
    exitingPlayerId: string, 
    exitSide: 'A' | 'B', 
    winnerSide: 'A' | 'B',
    selectionType: 'auto' | 'manual',
    updatedMatches: MPLMatch[],
    currentHistory: Record<string, number>
  ) => {
    if (!activeTournament) return;

    const currentMatch = updatedMatches[updatedMatches.length - 1];
    currentMatch.exitSide = exitSide;
    currentMatch.playerExiting = exitingPlayerId;
    currentMatch.playerEntering = currentMatch.resting[0];
    currentMatch.selectionType = selectionType;

    const roundFinished = updatedMatches.length >= 10;

    if (roundFinished) {
      const updatedTourney: MPLTournament = {
        ...activeTournament,
        matches: updatedMatches,
        pairPlayHistory: currentHistory
      };
      setActiveTournament(updatedTourney);
      setScoreT1('');
      setScoreT2('');
      setPendingBenchDecision(null);
      setStage('finished');
      setShowFinishModal(true);
      saveState('finished', activeTournament.players, 5, updatedTourney);
      return;
    }

    // Generate next match
    const nextRoundNumber = updatedMatches.length + 1;
    let nextTeam1: [string, string] = [...currentMatch.team1];
    let nextTeam2: [string, string] = [...currentMatch.team2];

    if (exitSide === 'A') {
      nextTeam1 = [nextTeam1.find(id => id !== exitingPlayerId)!, currentMatch.resting[0]] as [string, string];
    } else {
      nextTeam2 = [nextTeam2.find(id => id !== exitingPlayerId)!, currentMatch.resting[0]] as [string, string];
    }

    let intercalated = false;
    const k1Check = getPairKey(nextTeam1[0], nextTeam1[1]);
    const k2Check = getPairKey(nextTeam2[0], nextTeam2[1]);

    if ((currentHistory[k1Check] || 0) >= 2 || (currentHistory[k2Check] || 0) >= 2) {
      intercalated = true;
      const [p1, p2] = nextTeam1;
      const [p3, p4] = nextTeam2;

      const pairings = [
        { t1: [p1, p2], t2: [p3, p4] },
        { t1: [p1, p3], t2: [p2, p4] },
        { t1: [p1, p4], t2: [p2, p3] }
      ];

      let bestPairing = pairings[0];
      let maxScore = -999;

      for (const pairing of pairings) {
        const pk1 = getPairKey(pairing.t1[0], pairing.t1[1]);
        const pk2 = getPairKey(pairing.t2[0], pairing.t2[1]);
        const count1 = currentHistory[pk1] || 0;
        const count2 = currentHistory[pk2] || 0;

        let score = 0;
        if (count1 >= 2) score -= 100;
        if (count2 >= 2) score -= 100;
        
        if (count1 === 0) score += 10;
        if (count2 === 0) score += 10;

        if (pairing === pairings[0]) score += 5;

        if (score > maxScore) {
          maxScore = score;
          bestPairing = pairing;
        }
      }

      nextTeam1 = bestPairing.t1 as [string, string];
      nextTeam2 = bestPairing.t2 as [string, string];
    }

    const nextMatch: MPLMatch = {
      round: nextRoundNumber,
      team1: nextTeam1,
      team2: nextTeam2,
      resting: [exitingPlayerId],
      intercalated
    };

    const k1 = getPairKey(nextMatch.team1[0], nextMatch.team1[1]);
    const k2 = getPairKey(nextMatch.team2[0], nextMatch.team2[1]);
    currentHistory[k1] = (currentHistory[k1] || 0) + 1;
    currentHistory[k2] = (currentHistory[k2] || 0) + 1;

    const nextMatches = [...updatedMatches, nextMatch];

    const updatedTourney: MPLTournament = {
      ...activeTournament,
      matches: nextMatches,
      pairPlayHistory: currentHistory,
      currentRound: nextRoundNumber
    };

    setActiveTournament(updatedTourney);
    setScoreT1('');
    setScoreT2('');
    setPendingBenchDecision(null);
    saveState('active', activeTournament.players, 5, updatedTourney);
  };

  const handleFinishTournament = () => {
    if (!activeTournament) return;
    setStage('finished');
    setShowFinishModal(true);
    saveState('finished', activeTournament.players, 5, activeTournament);
  };

  // ===== COMPUTED VALUES =====
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
      // 1. Número de victorias
      if (b.wins !== a.wins) return b.wins - a.wins;
      // 2. Diferencia de puntos
      if (b.diff !== a.diff) return b.diff - a.diff;
      // 3. Puntos a favor
      if (b.pointsWon !== a.pointsWon) return b.pointsWon - a.pointsWon;
      // 4. Puntos en contra (menos es mejor)
      return a.pointsLost - b.pointsLost;
    });
  };

  const getTournamentStats = () => {
    if (!activeTournament) return { rests: {}, pairs: [] };
    const rests: Record<string, number> = {};
    const pairCounts: Record<string, number> = {};

    activeTournament.players.forEach(p => rests[p.id] = 0);

    activeTournament.matches.forEach(m => {
      if (m.score) {
        m.resting.forEach(id => rests[id]++);
        const k1 = getPairKey(m.team1[0], m.team1[1]);
        const k2 = getPairKey(m.team2[0], m.team2[1]);
        pairCounts[k1] = (pairCounts[k1] || 0) + 1;
        pairCounts[k2] = (pairCounts[k2] || 0) + 1;
      }
    });

    const pairs = Object.entries(pairCounts).map(([key, count]) => {
      const [id1, id2] = key.split('-');
      return { p1Name: getPlayerName(id1), p2Name: getPlayerName(id2), count };
    });

    return { rests, pairs };
  };

  const standings = getStandings();
  const currentMatch = activeTournament?.matches[activeTournament.matches.length - 1];
  const isRoundComplete = activeTournament ? activeTournament.matches.filter(m => m.score).length >= 10 : false;
  
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

            <div className="border-t border-slate-800/80 my-2 pt-6 flex flex-col items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center block mb-4">
                Formato Estricto Activo
              </label>
              
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-emerald-500/50 bg-emerald-600/10 shadow-lg shadow-emerald-950/20 w-full">
                <Users className="w-8 h-8 text-emerald-400 mb-3" />
                <span className="text-2xl font-black text-white">5 Jugadores</span>
                <span className="text-xs text-slate-400 mt-1">
                  1 Cancha (4 juegan, 1 descansa). Reglas de alternancia y ciclos de descanso automáticos (10 partidos).
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setStage('registration');
                saveState('registration', players, 5, activeTournament);
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
                  <p className="text-xs text-slate-500">Formato Estricto: 5 jugadores</p>
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
                    disabled={players.length >= 5}
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 disabled:opacity-40 focus:border-emerald-500 focus:outline-none rounded-xl py-3 px-4 text-white placeholder:text-slate-600 transition-all text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={players.length >= 5}
                  className="w-full bg-emerald-600/90 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Jugador
                </button>
              </form>
            </div>

            {/* List and Actions card */}
            <div className="w-full lg:w-7/12 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  Jugadores Registrados
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700/60">
                    {players.length} / 5
                  </span>
                </h3>
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
                disabled={players.length !== 5}
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
                    Mic Padel League
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-slate-400">
                      Ronda {activeTournament.matches.length} de 10
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {stage === 'active' && isRoundComplete && (
                  <button
                    onClick={handleFinishTournament}
                    className="flex-1 md:flex-none px-4 py-2 border border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Ver Podio
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

                {stage === 'active' && currentMatch && !isRoundComplete && (
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
                            Selección de Rotación
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Por la regla de alternancia, debe salir un jugador del <strong>Lado {pendingBenchDecision.exitSide}</strong>.
                            Elige cuál de los dos jugadores irá a la banca.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Candidatos a salir (Lado {pendingBenchDecision.exitSide}):
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          {pendingBenchDecision.candidates.map(playerId => {
                            const player = activeTournament.players.find(p => p.id === playerId);
                            const isValid = pendingBenchDecision.validCandidates.includes(playerId);
                            const reason = pendingBenchDecision.rejectionReasons[playerId];

                            return (
                              <button
                                key={playerId}
                                disabled={!isValid}
                                onClick={() => {
                                  executeNextMatch(
                                    playerId, 
                                    pendingBenchDecision.exitSide, 
                                    pendingBenchDecision.winnerSide, 
                                    'manual',
                                    pendingBenchDecision.updatedMatches,
                                    pendingBenchDecision.nextHistory
                                  );
                                }}
                                className={`border transition-all p-3 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden ${
                                  isValid
                                    ? 'bg-slate-950 border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 shadow-lg cursor-pointer group'
                                    : 'bg-slate-950/20 border-slate-800/30 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                {!isValid && reason && (
                                  <div className="absolute top-0 w-full bg-slate-800 text-slate-300 text-[8px] font-black py-0.5 text-center shadow-md">
                                    REGLA APLICADA
                                  </div>
                                )}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                                  isValid 
                                    ? 'mt-2 bg-slate-900 border-slate-700 text-slate-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:text-emerald-400'
                                    : 'mt-2 bg-slate-900 border-slate-800 text-slate-600'
                                }`}>
                                  <User className="w-5 h-5" />
                                </div>
                                <span className={`text-sm font-bold text-center ${isValid ? 'text-white group-hover:text-emerald-400' : 'text-slate-500'}`}>
                                  {player?.name}
                                </span>
                                {!isValid && reason && (
                                  <span className="text-[9px] text-slate-400 text-center leading-tight mt-1 px-1">
                                    {reason}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // --- NORMAL MATCH SCORE INPUT ---
                    <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                      
                      {/* Visual Arena representation */}
                      <div className="flex flex-col gap-4 relative z-10">
                        
                        {/* Team A Card */}
                        <div className="bg-slate-900/85 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/20 transition-all">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Lado A</span>
                            <div className="text-md font-bold text-white">
                              {getPlayerName(currentMatch.team1[0])}
                            </div>
                            <div className="text-md font-bold text-white">
                              {getPlayerName(currentMatch.team1[1])}
                            </div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={scoreT1}
                            onChange={(e) => setScoreT1(e.target.value)}
                            placeholder="0"
                            className="w-16 h-16 bg-slate-950/80 border border-slate-700/60 rounded-xl text-center text-3xl font-black text-white focus:outline-none focus:border-emerald-500 focus:bg-slate-950 transition-all placeholder:text-slate-800"
                          />
                        </div>

                        {/* VS Indicator */}
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 tracking-wider">
                            VS
                          </div>
                        </div>

                        {/* Team B Card */}
                        <div className="bg-slate-900/85 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/20 transition-all">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Lado B</span>
                            <div className="text-md font-bold text-white">
                              {getPlayerName(currentMatch.team2[0])}
                            </div>
                            <div className="text-md font-bold text-white">
                              {getPlayerName(currentMatch.team2[1])}
                            </div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={scoreT2}
                            onChange={(e) => setScoreT2(e.target.value)}
                            placeholder="0"
                            className="w-16 h-16 bg-slate-950/80 border border-slate-700/60 rounded-xl text-center text-3xl font-black text-white focus:outline-none focus:border-emerald-500 focus:bg-slate-950 transition-all placeholder:text-slate-800"
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
                        return (
                          <span
                            key={restingId}
                            className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            {getPlayerName(restingId)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* FINISHED STATE */}
                {isRoundComplete && !showFinishModal && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Torneo Finalizado</h4>
                      <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                        ¡Las 10 rondas se han completado! Revisa las posiciones y la tabla de rotaciones a la derecha.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: HISTORIAL Y ESTADÍSTICAS */}
              <div className="w-full lg:w-1/2 p-0 flex flex-col h-[700px]">
                
                {/* Tabs */}
                <div className="flex items-center border-b border-slate-800/80">
                  <div className="flex-1 text-center py-4 border-b-2 border-emerald-500 text-emerald-400 text-xs font-bold uppercase tracking-widest cursor-pointer bg-emerald-500/5">
                    Historial de Rondas
                  </div>
                  <div className="flex-1 text-center py-4 border-b-2 border-transparent text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-300 transition-colors cursor-pointer opacity-50">
                    Posiciones
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="flex flex-col gap-4">
                    {activeTournament.matches.filter(m => m.score).map((m, i) => (
                      <div key={i} className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                            Ronda {m.round}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                            {m.score?.t1} - {m.score?.t2}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Lado A</span>
                            <span className="text-white">{getPlayerName(m.team1[0])} / {getPlayerName(m.team1[1])}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Lado B</span>
                            <span className="text-white">{getPlayerName(m.team2[0])} / {getPlayerName(m.team2[1])}</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-2.5 mt-1 border border-slate-800/40">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Ganador:</span>
                            <span className="text-emerald-400 font-bold">Lado {m.winnerSide}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Lado de salida:</span>
                            <span className="text-amber-400 font-bold">Lado {m.exitSide}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Intercambio:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-red-400 font-bold line-through">{getPlayerName(m.playerExiting)}</span>
                              <RefreshCw className="w-3 h-3 text-slate-600" />
                              <span className="text-emerald-400 font-bold">{getPlayerName(m.playerEntering)}</span>
                            </div>
                          </div>
                          {m.intercalated && (
                            <div className="mt-2 text-[9px] text-amber-400 font-bold italic text-right">
                              Parejas intercaladas automáticamente (Límite 2 alcanzado)
                            </div>
                          )}
                          {m.selectionType && (
                            <div className="mt-1 text-[9px] text-slate-500 italic text-right">
                              Selección {m.selectionType === 'auto' ? 'Automática (Reglas)' : 'Manual'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {activeTournament.matches.filter(m => m.score).length === 0 && (
                      <div className="text-center text-slate-500 text-sm py-8 italic">
                        Juega la primera ronda para ver el historial.
                      </div>
                    )}
                  </div>
                </div>

                {/* STANDINGS RE-ADDED */}
                <div className="border-t border-slate-800/80 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Posiciones Individuales</h4>
                    </div>
                  </div>

                  <div className="bg-slate-950/30 rounded-2xl border border-slate-800/60 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[9px] uppercase tracking-widest text-slate-500 font-black">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-8">#</th>
                          <th className="py-2.5 px-2">Jugador</th>
                          <th className="py-2.5 px-2 text-center">PG</th>
                          <th className="py-2.5 px-2 text-center">Pts+</th>
                          <th className="py-2.5 px-3 text-center">Dif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((s, idx) => {
                          const isLeader = idx === 0;
                          return (
                            <tr 
                              key={s.id}
                              className={`border-b border-slate-900/50 hover:bg-slate-800/10 transition-colors ${
                                isLeader ? 'bg-emerald-500/[0.02]' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center">
                                {isLeader ? (
                                  <span className="w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center mx-auto text-[10px] font-black">
                                    1
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-500">
                                    {idx + 1}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-2">
                                <span className={`text-xs font-semibold ${isLeader ? 'text-emerald-300 font-bold' : 'text-slate-200'}`}>
                                  {s.name}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono font-black text-emerald-400 text-[11px]">
                                {s.wins}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono text-slate-300 text-[11px]">
                                {s.pointsWon}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-[11px]">
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
                </div>
              </div>
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
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowFinishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 rounded-3xl p-8 max-w-4xl w-full flex flex-col items-center gap-8 relative overflow-hidden shadow-2xl my-8"
            >
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-purple-500" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/[0.02] rounded-full blur-3xl" />

              <button
                onClick={() => setShowFinishModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center relative z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5, stiffness: 300 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-black text-white uppercase tracking-wider">
                  ¡Torneo Completado!
                </h3>
                <p className="text-slate-400 text-sm mt-2">Mic Padel League · 10 Rondas</p>
              </motion.div>

              {/* PODIUM */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-end justify-center gap-4 w-full max-w-md relative z-10"
              >
                {/* 2nd Place */}
                {standings.length >= 2 && (
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center text-slate-300 font-black text-lg mb-2 shadow-md">
                      2
                    </div>
                    <span className="text-xs font-bold text-slate-300 text-center mb-2 truncate w-full">{standings[1].name}</span>
                    <div className="w-full bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-xl h-20 flex items-center justify-center border border-slate-500/40">
                      <span className="text-white font-black text-lg">{standings[1].wins}V</span>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {standings.length >= 1 && (
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 border-2 border-yellow-300 flex items-center justify-center text-white font-black text-xl mb-2 shadow-lg shadow-yellow-500/30"
                    >
                      <Star className="w-6 h-6" />
                    </motion.div>
                    <span className="text-sm font-black text-yellow-400 text-center mb-2 truncate w-full">{standings[0].name}</span>
                    <div className="w-full bg-gradient-to-t from-yellow-600/80 to-yellow-500/60 rounded-t-xl h-28 flex items-center justify-center border border-yellow-500/40 relative">
                      <span className="text-white font-black text-2xl">{standings[0].wins}V</span>
                      <div className="absolute -top-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {standings.length >= 3 && (
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-900/60 border-2 border-amber-700/60 flex items-center justify-center text-amber-400 font-black text-lg mb-2 shadow-md">
                      3
                    </div>
                    <span className="text-xs font-bold text-slate-400 text-center mb-2 truncate w-full">{standings[2].name}</span>
                    <div className="w-full bg-gradient-to-t from-amber-900/50 to-amber-800/30 rounded-t-xl h-14 flex items-center justify-center border border-amber-700/30">
                      <span className="text-white font-black text-lg">{standings[2].wins}V</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* FULL STANDINGS TABLE */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="w-full relative z-10"
              >
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5" />
                  Tabla de Posiciones Final
                </h4>
                <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950/90 border-b border-slate-700/60">
                      <tr className="text-[9px] uppercase tracking-widest text-slate-500 font-black">
                        <th className="py-3 px-3 text-center w-8">#</th>
                        <th className="py-3 px-3">Jugador</th>
                        <th className="py-3 px-2 text-center">PJ</th>
                        <th className="py-3 px-2 text-center">V</th>
                        <th className="py-3 px-2 text-center">D</th>
                        <th className="py-3 px-2 text-center">PF</th>
                        <th className="py-3 px-2 text-center">PC</th>
                        <th className="py-3 px-3 text-center">DIF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((s, idx) => {
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                          <motion.tr
                            key={s.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.5 + idx * 0.15 }}
                            className={`border-b border-slate-800/40 transition-colors ${
                              idx === 0 ? 'bg-yellow-500/[0.04]' : idx === 1 ? 'bg-slate-500/[0.02]' : idx === 2 ? 'bg-amber-500/[0.02]' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              {idx < 3 ? (
                                <span className="text-base">{medals[idx]}</span>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-500">{idx + 1}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-sm font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-200' : idx === 2 ? 'text-amber-400' : 'text-slate-300'}`}>
                                {s.name}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center font-mono text-slate-400 text-xs">
                              {s.matchesPlayed}
                            </td>
                            <td className="py-3 px-2 text-center font-mono font-black text-emerald-400 text-sm">
                              {s.wins}
                            </td>
                            <td className="py-3 px-2 text-center font-mono text-red-400/80 text-xs">
                              {s.losses}
                            </td>
                            <td className="py-3 px-2 text-center font-mono text-sky-400 text-xs font-bold">
                              {s.pointsWon}
                            </td>
                            <td className="py-3 px-2 text-center font-mono text-rose-400/80 text-xs">
                              {s.pointsLost}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-black text-sm">
                              <span className={s.diff > 0 ? 'text-emerald-400' : s.diff < 0 ? 'text-red-400' : 'text-slate-500'}>
                                {s.diff > 0 ? `+${s.diff}` : s.diff}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Tiebreaker rules */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                  className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40"
                >
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-2">Criterios de desempate</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                    <span>1. Victorias</span>
                    <span>2. Diferencia de puntos</span>
                    <span>3. Puntos a favor</span>
                    <span>4. Puntos en contra (menor)</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* VERIFICATION */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.0 }}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10"
              >
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/50">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Descansos por Jugador</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(getTournamentStats().rests).map(([id, rests]) => (
                      <div key={id} className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${rests === 2 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {getPlayerName(id)}: {rests}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/50">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Parejas formadas (Máx 2)</span>
                  <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                    {getTournamentStats().pairs.map((p, i) => (
                      <div key={i} className={`text-[10px] px-2 py-1 rounded border flex justify-between ${p.count <= 2 ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <span>{p.p1Name} & {p.p2Name}</span>
                        <span className="font-bold">{p.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => setShowFinishModal(false)}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold uppercase tracking-wider py-4 rounded-xl transition-all mt-2 shadow-lg shadow-emerald-500/10"
              >
                Cerrar Resumen
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
