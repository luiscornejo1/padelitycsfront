import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, Check, ChevronRight, Swords, Trash2, ArrowUpCircle, Crown, Skull } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../lib/animations';
import BracketGenerator from './BracketGenerator';

import { useTournaments } from '../context/TournamentContext';

interface AmericanoLiveViewProps {
  isEmbedded?: boolean;
}

export default function AmericanoLiveView({ isEmbedded = false }: AmericanoLiveViewProps) {
  const { activeTournaments, updateBracketResult, deleteTournament } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [stage, setStage] = useState<'groups' | 'brackets'>('groups');

  const handleSelectTournament = (id: number) => {
    setSelectedTournament(id);
    setStage('groups'); // Reset to groups when selecting
  };

  // Render the list of tournaments
  if (!selectedTournament) {
    return (
      <div className={`${isEmbedded ? 'py-10' : 'pt-28 pb-20'} px-6 min-h-[85vh] container mx-auto max-w-5xl relative`}>
        {!isEmbedded && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />}
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-12 flex flex-col gap-2 relative z-10"
        >
          <div className="flex items-center gap-3 text-blue-400 font-semibold tracking-[0.2em] uppercase text-sm mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Panel de Administrador
          </div>
          <h2 className="text-[36px] md:text-[48px] font-bold text-white tracking-tight">
            Torneos en Vivo
          </h2>
          <p className="text-slate-400 font-light max-w-xl text-[17px]">
            Selecciona un torneo en curso para gestionar los resultados, finalizar la fase de grupos y generar las llaves eliminatorias (Brackets).
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10"
        >
          {activeTournaments.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/30">
              No hay torneos activos en este momento.
            </div>
          ) : (
            activeTournaments.map(t => (
              <motion.div
                key={t.id}
                variants={staggerItem}
                onClick={() => handleSelectTournament(t.id)}
                className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 cursor-pointer hover:bg-slate-800/60 hover:border-slate-700 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{t.name}</h3>
                      <span className="text-xs font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {t.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEmbedded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('¿Estás seguro de eliminar este torneo?')) {
                            deleteTournament(t.id);
                          }
                        }}
                        className="text-red-500/50 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar torneo"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>

                <div className="flex gap-6 border-t border-slate-800 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Canchas</span>
                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {t.courts}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Parejas</span>
                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Users className="w-4 h-4" /> {Array.isArray(t.pairs) ? t.pairs.length : t.pairs}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Tiempo</span>
                    <span className="text-sm font-mono text-slate-300">{t.timeElapsed}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    );
  }

  // Bracket/Tournament view
  const activeT = activeTournaments.find(t => t.id === selectedTournament);
  
  const { updateMatchScore, updateTournament } = useTournaments();

  // Helper to calculate standings
  const getStandings = (group: any, matchScores: Record<string, {t1:number, t2:number}> = {}) => {
    const standings = group.pairs.map((p: any) => ({
      ...p,
      points: 0,
      matchesPlayed: 0
    }));

    group.matches.forEach((m: any, matchIdx: number) => {
      const matchId = `g${group.courtNumber}_m${matchIdx}`;
      const score = matchScores[matchId];
      if (score) {
        const t1 = standings.find((s: any) => s.id === m.team1.id);
        const t2 = standings.find((s: any) => s.id === m.team2.id);
        if (t1) {
          t1.points += score.t1;
          t1.matchesPlayed += (score.t1 > 0 || score.t2 > 0) ? 1 : 0;
        }
        if (t2) {
          t2.points += score.t2;
          t2.matchesPlayed += (score.t1 > 0 || score.t2 > 0) ? 1 : 0;
        }
      }
    });

    return standings.sort((a: any, b: any) => b.points - a.points);
  };

  const getOverallClassified = () => {
    if (!activeT) return [];
    
    // Backward compatibility for legacy tournaments where participants was stored in pairs
    const participantsList = activeT.participants || (Array.isArray(activeT.pairs) ? activeT.pairs : []);

    if (!activeT.fixture) return participantsList.slice(0, 8).map((p: any, idx: number) => ({
      id: p.id, name: p.name || `${p.p1Name?.split(' ')[0] || 'Jugador'} / ${p.p2Name?.split(' ')[0] || 'Jugador'}`, seed: `${idx + 1}`, court: 'Manual', points: 0, matchesPlayed: 0
    }));

    if (activeT.format === 'personalizado') {
      const individualStandings = participantsList.map((p: any) => ({
        id: p.id,
        name: p.name,
        points: 0,
        matchesPlayed: 0
      }));

      activeT.fixture.forEach(group => {
        group.matches.forEach((m: any, matchIdx: number) => {
          const matchId = `g${group.courtNumber}_m${matchIdx}`;
          const score = activeT.matchScores?.[matchId];
          if (score && (score.t1 > 0 || score.t2 > 0)) {
            // Determinar ganadores del set
            const team1Won = score.t1 > score.t2;
            const team2Won = score.t2 > score.t1;
            
            [m.team1.player1, m.team1.player2].forEach(player => {
              const standing = individualStandings.find((s: any) => s.id === player.id.replace('ind-', ''));
              if (standing) {
                if (team1Won) standing.points += 1;
                standing.matchesPlayed += 1;
              }
            });
            [m.team2.player1, m.team2.player2].forEach(player => {
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
    
    let allPairs: any[] = [];
    activeT.fixture.forEach(group => {
      const standings = getStandings(group, activeT.matchScores);
      allPairs = [...allPairs, ...standings.map((s: any) => ({...s, groupName: group.courtName}))];
    });
    
    allPairs.sort((a, b) => b.points - a.points);
    
    const count = allPairs.length > 4 ? 8 : 4;
    return allPairs.slice(0, count).map((p, idx) => ({
      id: p.id.toString(),
      name: `${p.player1.name.split(' ')[0]} / ${p.player2.name.split(' ')[0]}`,
      seed: `${idx + 1}`,
      court: p.groupName,
      points: p.points,
      matchesPlayed: p.matchesPlayed
    }));
  };

  const classifiedPairs = getOverallClassified();

  const handleWinnerSelect = (matchId: string, winnerId: string) => {
    if (activeT) {
      updateBracketResult(activeT.id, matchId, winnerId);
    }
  };

  const handleNextRoundMexicano = () => {
    if (!activeT || !activeT.fixture) return;

    const round = activeT.currentRound || 1;
    const newFixture = JSON.parse(JSON.stringify(activeT.fixture));
    
    const winners: any[] = [];
    const losers: any[] = [];

    // Determine winners/losers for current round
    for (let i = 0; i < newFixture.length; i++) {
      const group = newFixture[i];
      const match = group.matches.find((m: any) => m.round === round);
      if (!match) continue;

      const matchId = `g${group.courtNumber}_m${round - 1}`;
      const score = activeT.matchScores?.[matchId] || { t1: 0, t2: 0 };
      
      if (score.t1 >= score.t2) {
        winners.push(match.team1);
        losers.push(match.team2);
      } else {
        winners.push(match.team2);
        losers.push(match.team1);
      }
    }

    // Now re-assign to courts
    const numCourts = newFixture.length;
    for (let c = 0; c < numCourts; c++) {
      let team1, team2;

      if (c === 0) {
        // Podio: Winner stays, Court 2 winner moves up
        team1 = winners[0];
        team2 = winners[1] || losers[0]; // fallback if only 1 court
      } else if (c === numCourts - 1) {
        // Pozo: Loser stays, Court N-1 loser moves down
        team1 = losers[c - 1]; 
        team2 = losers[c]; 
      } else {
        // Middle courts: Loser from above moves down, Winner from below moves up
        team1 = losers[c - 1];
        team2 = winners[c + 1];
      }

      newFixture[c].matches.push({
        round: round + 1,
        team1,
        team2
      });
    }

    updateTournament({
      ...activeT,
      fixture: newFixture,
      currentRound: round + 1
    });
  };

  const handleNextRoundPersonalizado = () => {
    if (!activeT || !activeT.fixture) return;

    const round = activeT.fixture.length + 1;
    const newFixture = JSON.parse(JSON.stringify(activeT.fixture));
    const individualStandings = classifiedPairs; 

    let selectedPlayers: any[] = [];
    const numMatches = Math.floor(individualStandings.length / 4);

    if (activeT.rotationRule === 'rey_de_cancha' && activeT.fixture.length > 0) {
      // Regla: Ganador se queda, perdedores salen, descansados entran (especial para 6 jugadores / 1 cancha)
      const lastRound = activeT.fixture[activeT.fixture.length - 1];
      const lastMatch = lastRound.matches[0];
      
      if (lastMatch) {
        const matchId = `g${lastRound.courtNumber}_m0`;
        const score = activeT.matchScores?.[matchId] || { t1: 0, t2: 0 };
        
        let winnerIds: string[] = [];
        if (score.t1 >= score.t2) {
          winnerIds = [lastMatch.team1.player1.id, lastMatch.team1.player2.id];
        } else {
          winnerIds = [lastMatch.team2.player1.id, lastMatch.team2.player2.id];
        }
        
        // Limpiamos los 'ind-' de los ganadores para buscarlos
        winnerIds = winnerIds.map(id => id.replace('ind-', ''));
        
        const playingIds = new Set([
          lastMatch.team1.player1.id.replace('ind-', ''),
          lastMatch.team1.player2.id.replace('ind-', ''),
          lastMatch.team2.player1.id.replace('ind-', ''),
          lastMatch.team2.player2.id.replace('ind-', '')
        ]);
        
        // Encontrar a los que descansaron
        const restingPlayers = individualStandings.filter(p => !playingIds.has(p.id.toString()));
        const winningPlayers = individualStandings.filter(p => winnerIds.includes(p.id.toString()));
        
        selectedPlayers = [...winningPlayers, ...restingPlayers];
      } else {
        // Fallback si no hay partido previo
        const sortedPlayers = [...individualStandings].sort((a, b) => {
          if (a.matchesPlayed === b.matchesPlayed) return Math.random() - 0.5;
          return a.matchesPlayed - b.matchesPlayed;
        });
        selectedPlayers = sortedPlayers.slice(0, numMatches * 4);
      }
    } else {
      // Regla: Equitativo (prioriza descansados, luego aleatorio)
      const sortedPlayers = [...individualStandings].sort((a, b) => {
        if (a.matchesPlayed === b.matchesPlayed) return Math.random() - 0.5;
        return a.matchesPlayed - b.matchesPlayed;
      });
      selectedPlayers = sortedPlayers.slice(0, numMatches * 4);
    }
    
    // Shuffle selected to randomize partners
    selectedPlayers.sort(() => Math.random() - 0.5);

    const matches = [];
    for (let m = 0; m < numMatches; m++) {
      const p1 = selectedPlayers[m * 4];
      const p2 = selectedPlayers[m * 4 + 1];
      const p3 = selectedPlayers[m * 4 + 2];
      const p4 = selectedPlayers[m * 4 + 3];
      
      matches.push({
        round,
        team1: {
          id: Date.now() + m*2, localId: 1, teamElo: 1500,
          player1: { id: `ind-${p1.id}`, name: p1.name, category: 'N/A', elo: 1500 },
          player2: { id: `ind-${p2.id}`, name: p2.name, category: 'N/A', elo: 1500 }
        },
        team2: {
          id: Date.now() + m*2 + 1, localId: 2, teamElo: 1500,
          player1: { id: `ind-${p3.id}`, name: p3.name, category: 'N/A', elo: 1500 },
          player2: { id: `ind-${p4.id}`, name: p4.name, category: 'N/A', elo: 1500 }
        }
      });
    }

    newFixture.push({
      courtNumber: round,
      courtName: `Ronda ${round}`,
      pairs: [],
      matches
    });

    updateTournament({
      ...activeT,
      fixture: newFixture
    });
  };

  return (
    <div className={`${isEmbedded ? 'py-10' : 'pt-28 pb-20'} px-6 min-h-[85vh] relative`}>
      <div className="container mx-auto max-w-7xl">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedTournament(null)}
              className="text-slate-400 hover:text-white text-sm font-semibold tracking-wide transition-colors"
            >
              ← VOLVER
            </button>
            <div className="w-[1px] h-6 bg-slate-800" />
            <h2 className="text-xl font-bold text-white tracking-tight">{activeT?.name}</h2>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              EN VIVO
            </span>
          </div>

          {activeT?.format !== 'mexicano' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setStage('groups')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all ${
                  stage === 'groups' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fase Grupos
              </button>
              <button 
                onClick={() => setStage('brackets')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all ${
                  stage === 'brackets' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Brackets Finales
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeT?.format === 'mexicano' ? (
            <motion.div
              key="mexicano"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-widest uppercase mb-4">
                  Ronda Actual: {activeT.currentRound}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Rey de Cancha (Subidas y Bajadas)</h3>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  {isEmbedded ? 'Ingresa los resultados y pulsa Siguiente Ronda. Los ganadores subirán de cancha y los perdedores bajarán automáticamente.' : 'Sigue en vivo la rotación de las parejas en cada cancha.'}
                </p>
              </div>

              {/* Mexicano Courts */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-6xl mb-12">
                {activeT.fixture?.map((group, cIdx) => {
                  const matchIdx = (activeT.currentRound || 1) - 1;
                  const match = group.matches.find((m: any) => m.round === activeT.currentRound);
                  const matchId = `g${group.courtNumber}_m${matchIdx}`;
                  const score = activeT.matchScores?.[matchId] || { t1: 0, t2: 0 };
                  const isPodio = cIdx === 0;
                  const isPozo = cIdx === (activeT.fixture?.length || 0) - 1;

                  if (!match) return null;

                  return (
                    <div key={group.courtNumber} className={`bg-slate-900/60 border rounded-3xl p-6 flex flex-col relative overflow-hidden ${isPodio ? 'border-yellow-500/30' : isPozo ? 'border-red-500/30' : 'border-slate-800'}`}>
                      {isPodio && <div className="absolute top-0 right-0 p-4 opacity-10"><Crown className="w-24 h-24 text-yellow-500" /></div>}
                      {isPozo && <div className="absolute top-0 right-0 p-4 opacity-10"><Skull className="w-24 h-24 text-red-500" /></div>}
                      
                      <h4 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 ${isPodio ? 'text-yellow-500' : isPozo ? 'text-red-500' : 'text-blue-400'}`}>
                        {isPodio ? <Crown className="w-4 h-4" /> : isPozo ? <Skull className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        {group.courtName}
                      </h4>
                      
                      <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                           <div className="flex flex-col w-[35%]">
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team1.player1.name.split(' ')[0]}</span>
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team1.player2.name.split(' ')[0]}</span>
                           </div>
                           <div className="flex flex-col items-center gap-1">
                              {isEmbedded ? (
                                <input 
                                  type="number" min="0" 
                                  value={score.t1 === 0 && score.t2 === 0 ? '' : score.t1}
                                  onChange={(e) => updateMatchScore(activeT.id, matchId, parseInt(e.target.value)||0, score.t2)}
                                  placeholder="0"
                                  className="w-14 h-12 text-center text-xl bg-slate-900 border border-slate-700 rounded-lg text-white font-black focus:border-blue-500 outline-none transition-colors"
                                />
                              ) : (
                                <span className="text-3xl font-black text-white w-14 text-center">{score.t1}</span>
                              )}
                              {score.t1 > score.t2 && <ArrowUpCircle className="w-4 h-4 text-emerald-500" />}
                           </div>
                        </div>

                        <div className="flex items-center justify-center -my-3 z-10">
                           <span className="bg-slate-900 text-[10px] font-black tracking-widest text-slate-500 px-3 py-1 rounded-full border border-slate-800">VS</span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                           <div className="flex flex-col w-[35%]">
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team2.player1.name.split(' ')[0]}</span>
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team2.player2.name.split(' ')[0]}</span>
                           </div>
                           <div className="flex flex-col items-center gap-1">
                              {isEmbedded ? (
                                <input 
                                  type="number" min="0" 
                                  value={score.t1 === 0 && score.t2 === 0 ? '' : score.t2}
                                  onChange={(e) => updateMatchScore(activeT.id, matchId, score.t1, parseInt(e.target.value)||0)}
                                  placeholder="0"
                                  className="w-14 h-12 text-center text-xl bg-slate-900 border border-slate-700 rounded-lg text-white font-black focus:border-blue-500 outline-none transition-colors"
                                />
                              ) : (
                                <span className="text-3xl font-black text-white w-14 text-center">{score.t2}</span>
                              )}
                              {score.t2 > score.t1 && <ArrowUpCircle className="w-4 h-4 text-emerald-500" />}
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isEmbedded && (
                <motion.button
                  onClick={handleNextRoundMexicano}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.15em] uppercase text-sm rounded-xl overflow-hidden flex items-center gap-3"
                >
                  <Swords className="w-5 h-5" />
                  Siguiente Ronda (Rotar)
                </motion.button>
              )}
            </motion.div>
          ) : stage === 'groups' ? (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Resultados y Clasificación</h3>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  {isEmbedded ? 'Ingresa los resultados de los partidos. La tabla de posiciones se actualizará automáticamente sumando los puntos.' : 'Sigue en vivo los resultados de la fase de grupos.'}
                </p>
              </div>

              {/* Dynamic Fixture Groups */}
              {activeT?.fixture ? (
                <div className="flex flex-col xl:flex-row gap-8 w-full max-w-6xl mb-12">
                  
                  {/* Partidos Consolidados (Panel Izquierdo) */}
                  <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400"/> Historial de Partidos</h3>
                    <div className="flex flex-col gap-8">
                      {activeT.fixture.map((group) => {
                        let restingPlayersText = "";
                        if (activeT?.format === 'personalizado') {
                          const playingIds = new Set<string>();
                          group.matches.forEach((m: any) => {
                            playingIds.add(m.team1.player1.id.replace('ind-', ''));
                            playingIds.add(m.team1.player2.id.replace('ind-', ''));
                            playingIds.add(m.team2.player1.id.replace('ind-', ''));
                            playingIds.add(m.team2.player2.id.replace('ind-', ''));
                          });
                          
                          const participantsList = activeT.participants || [];
                          const resting = participantsList.filter((p: any) => !playingIds.has(p.id.toString()));
                          if (resting.length > 0) {
                            restingPlayersText = `Descansan: ${resting.map((p: any) => p.name?.split(' ')[0] || 'Jugador').join(' - ')}`;
                          }
                        }
                        
                        return (
                          <div key={group.courtNumber} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                {group.courtName} - {group.matches.length} {group.matches.length === 1 ? 'Partido' : 'Partidos'}
                              </h4>
                              {restingPlayersText && (
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-2">
                                  {restingPlayersText}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-3">
                              {group.matches.map((m: any, idx: number) => {
                                const matchId = `g${group.courtNumber}_m${idx}`;
                                const score = activeT?.matchScores?.[matchId] || { t1: 0, t2: 0 };
                                
                                return (
                                  <div key={idx} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3 w-[35%]">
                                      <span className="w-6 h-6 shrink-0 rounded bg-slate-800 text-xs font-bold flex items-center justify-center text-slate-400">{m.team1.localId}</span>
                                      <div className="flex flex-col">
                                        <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{m.team1.player1.name.split(' ')[0]}</span>
                                        <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{m.team1.player2.name.split(' ')[0]}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-[30%] justify-center">
                                      {isEmbedded ? (
                                        <input 
                                          type="number" min="0" 
                                          value={score.t1 === 0 && score.t2 === 0 ? '' : score.t1}
                                          onChange={(e) => updateMatchScore(activeT.id, matchId, parseInt(e.target.value)||0, score.t2)}
                                          placeholder="0"
                                          className="w-12 h-10 text-center bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:border-blue-500 outline-none transition-colors"
                                        />
                                      ) : (
                                        <span className="text-xl font-black text-white w-10 text-center">{score.t1}</span>
                                      )}
                                      <span className="text-slate-600 font-black">-</span>
                                      {isEmbedded ? (
                                        <input 
                                          type="number" min="0" 
                                          value={score.t1 === 0 && score.t2 === 0 ? '' : score.t2}
                                          onChange={(e) => updateMatchScore(activeT.id, matchId, score.t1, parseInt(e.target.value)||0)}
                                          placeholder="0"
                                          className="w-12 h-10 text-center bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:border-blue-500 outline-none transition-colors"
                                        />
                                      ) : (
                                        <span className="text-xl font-black text-white w-10 text-center">{score.t2}</span>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-end gap-3 w-[35%] text-right">
                                      <div className="flex flex-col">
                                        <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{m.team2.player1.name.split(' ')[0]}</span>
                                        <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{m.team2.player2.name.split(' ')[0]}</span>
                                      </div>
                                      <span className="w-6 h-6 shrink-0 rounded bg-slate-800 text-xs font-bold flex items-center justify-center text-slate-400">{m.team2.localId}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isEmbedded && activeT.format === 'personalizado' && (
                      <div className="flex justify-center mt-6 pt-6 border-t border-slate-800">
                        <motion.button
                          onClick={handleNextRoundPersonalizado}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-4 bg-white text-black font-bold tracking-[0.15em] uppercase text-sm rounded-xl overflow-hidden flex items-center gap-3"
                        >
                          <Swords className="w-5 h-5" />
                          Generar Siguiente Partido
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Standings Column (Global) */}
                  <div className="w-full xl:w-80 flex flex-col gap-4">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sticky top-24">
                      <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Trophy className="w-4 h-4" /> Posiciones
                      </h4>
                      <div className="flex flex-col gap-2">
                         {classifiedPairs.map((team: any, idx: number) => (
                            <div key={team.id} className={`flex items-center justify-between p-3 rounded-lg border ${idx < 2 ? 'bg-blue-900/10 border-blue-500/20' : 'bg-slate-900 border-slate-800'}`}>
                              <div className="flex items-center gap-3">
                                <span className={`font-black text-lg ${idx < 2 ? 'text-emerald-400' : 'text-slate-600'}`}>{idx + 1}</span>
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-white line-clamp-1">{activeT?.format === 'personalizado' ? team.name : team.name}</span>
                                   <span className="text-[10px] text-slate-500">{team.matchesPlayed || 0} Partidos Jugados</span>
                                </div>
                              </div>
                              <span className="text-lg font-black text-blue-400">{team.points || 0} <span className="text-[10px] text-slate-500 uppercase">{activeT?.format === 'personalizado' ? 'sets' : 'pts'}</span></span>
                            </div>
                         ))}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 w-full max-w-4xl mb-8">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> Parejas Clasificadas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classifiedPairs.map((pair) => (
                      <div key={pair.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center font-black text-blue-400">
                          {pair.seed}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-bold text-white">{pair.name}</span>
                          <span className="text-xs text-slate-500 font-mono">Puntos: 15 - {pair.court}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEmbedded && (
                <motion.button
                  onClick={() => setStage('brackets')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.15em] uppercase text-sm rounded-xl overflow-hidden flex items-center gap-3"
                >
                  <Swords className="w-5 h-5" />
                  Cerrar Fase y Generar Brackets
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="brackets"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {isEmbedded && (
                <div className="mb-4 bg-blue-500/10 text-blue-400 text-xs font-bold px-4 py-2 rounded-lg border border-blue-500/20 text-center">
                  Modo Admin: Haz clic en las parejas para avanzarlas de ronda
                </div>
              )}
              <BracketGenerator 
                participants={classifiedPairs} 
                bracketResults={activeT?.bracketResults}
                onWinnerSelect={handleWinnerSelect}
                isAdmin={isEmbedded}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
