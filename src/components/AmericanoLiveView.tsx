import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, Crown, Skull, ArrowUpCircle, Check, ChevronRight, Trash2, QrCode, Tv, Swords } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { fadeInUp, staggerContainer, staggerItem } from '../lib/animations';
import BracketGenerator from './BracketGenerator';
import { getOverallClassified, getStandingsByGroup } from '../lib/standingsLogic';

import { useTournaments } from '../context/TournamentContext';

interface AmericanoLiveViewProps {
  isEmbedded?: boolean;
  defaultTournamentId?: number;
  defaultStage?: 'groups' | 'brackets';
  hideTabs?: boolean;
}

export default function AmericanoLiveView({ 
  isEmbedded = false,
  defaultTournamentId,
  defaultStage,
  hideTabs = false
}: AmericanoLiveViewProps) {
  const { activeTournaments, updateBracketResult, deleteTournament, confirmBracketPhase } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | null>(defaultTournamentId || null);
  const [stage, setStage] = useState<'groups' | 'brackets' | 'standings' | 'bracket_config'>('groups');
  const [configBracketSize, setConfigBracketSize] = useState<number>(8);
  const [selectedForBracket, setSelectedForBracket] = useState<Set<string>>(new Set());
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Ref para escaneo de torneo local
  const host = typeof window !== 'undefined' ? window.location.host : '';
  const networkHost = host.includes('localhost') ? host.replace('localhost', '192.168.100.48') : host;
  const currentUrl = `${window.location.protocol}//${networkHost}/?view=player-tv&id=${selectedTournament}`;
  
  useEffect(() => {
    if (defaultTournamentId) setSelectedTournament(defaultTournamentId);
  }, [defaultTournamentId]);

  useEffect(() => {
    if (defaultStage) setStage(defaultStage);
  }, [defaultStage]);

  const handleSelectTournament = (id: number) => {
    setSelectedTournament(id);
    setStage('groups'); // Reset to groups when selecting
  };

  // Render the list of tournaments
  if (!selectedTournament) {
    return (
      <div className={`${isEmbedded ? 'py-10' : 'pt-28 pb-20'} px-6 min-h-[85vh] container mx-auto max-w-5xl relative`}>
        {!isEmbedded && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />}
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-12 flex flex-col gap-2 relative z-10"
        >
          <div className="flex items-center gap-3 text-brand-green font-semibold tracking-[0.2em] uppercase text-sm mb-2">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
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
            <div className="col-span-full p-8 text-center text-slate-500 border border-slate-800/60 rounded-2xl bg-[#0F172A]">
              No hay torneos activos en este momento.
            </div>
          ) : (
            activeTournaments.map(t => (
              <motion.div
                key={t.id}
                variants={staggerItem}
                onClick={() => handleSelectTournament(t.id)}
                className="bg-[#0F172A] border border-slate-800/60 rounded-3xl p-6 cursor-pointer hover:bg-[#0F172A] hover:border-slate-700 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-brand-green" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-green transition-colors">{t.name}</h3>
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

                <div className="flex gap-6 border-t border-slate-800/60 pt-4">
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

  // Removed internal getStandings and getOverallClassified
  const classifiedPairs = getOverallClassified(activeT);
  const groupedStandings = getStandingsByGroup(activeT);

  const handleWinnerSelect = (matchId: string, winnerId: string) => {
    if (activeT) {
      updateBracketResult(activeT.id, matchId, winnerId);
    }
  };

  const handleNavigateToBrackets = () => {
    if (!activeT?.fixture) return;

    let allPlayed = true;
    for (const group of activeT.fixture) {
      for (let i = 0; i < group.matches.length; i++) {
        const matchId = `g${group.courtNumber}_m${i}`;
        if (activeT.matchScores?.[matchId] === undefined) {
          allPlayed = false;
          break;
        }
      }
      if (!allPlayed) break;
    }

    if (!allPlayed) {
      alert("Aún hay partidos sin resultado. Por favor, asegúrate de ingresar los resultados de todos los partidos antes de generar los brackets finales.");
      return;
    }

    setStage('bracket_config');
  };

  const handleConfirmBracketPhase = () => {
    if (!activeT) return;
    
    // Get selected participants
    const selectedParticipants = classifiedPairs.filter((p: any) => selectedForBracket.has(p.id.toString()));
    
    // Randomize them
    const shuffled = [...selectedParticipants].sort(() => Math.random() - 0.5);
    
    confirmBracketPhase(activeT.id, configBracketSize, shuffled);
    setStage('brackets');
  };

  const handleNextRoundAmericanoClasico = () => {
    if (!activeT || !activeT.fixture) return;
    const currentRound = activeT.currentRound || 1;
    const totalRounds = activeT.fixture[0]?.matches?.length || 1;
    if (currentRound < totalRounds) {
      updateTournament({
        ...activeT,
        currentRound: currentRound + 1
      });
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
        const restingPlayers = individualStandings.filter((p: any) => !playingIds.has(p.id.toString()));
        const winningPlayers = individualStandings.filter((p: any) => winnerIds.includes(p.id.toString()));
        
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
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedTournament(null)}
              className="text-slate-400 hover:text-white text-sm font-semibold tracking-wide transition-colors"
            >
              ← VOLVER
            </button>
            <div className="w-[1px] h-6 bg-[#0B1120]" />
            <h2 className="text-xl font-bold text-white tracking-tight">{activeT?.name}</h2>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              EN VIVO
            </span>
            <button
              onClick={() => setShowQRModal(true)}
              className="ml-2 px-3 py-1.5 bg-[#E2FF3A] hover:bg-[#d4f231] text-black rounded-lg text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4" /> Padel TV QR
            </button>
          </div>

          {activeT?.format !== 'mexicano' && !hideTabs && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setStage('groups')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all ${
                  stage === 'groups' ? 'bg-[#0B1120] text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fase Grupos
              </button>
              <button 
                onClick={() => handleNavigateToBrackets()}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all ${
                  stage === 'brackets' ? 'bg-brand-green text-white shadow-lg shadow-brand-green-hover/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Brackets Finales
              </button>
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#060c19]/90 backdrop-blur-md"
                onClick={() => setShowQRModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-md bg-[#111418] border border-[#2A3441] rounded-2xl p-8 flex flex-col items-center shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-[#E2FF3A]"><Tv className="w-6 h-6" /></div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">PADEL TV</h3>
                </div>
                
                <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(226,255,58,0.15)]">
                  <QRCodeSVG 
                    value={currentUrl}
                    size={250}
                    bgColor={"#ffffff"}
                    fgColor={"#0B1120"}
                    level={"Q"}
                    includeMargin={false}
                  />
                </div>

                <p className="text-slate-400 text-sm text-center mb-6">
                  Escanea este código con tu celular para abrir la vista del torneo en tiempo real.
                </p>

                <div className="w-full bg-[#1A222C] p-3 rounded-lg border border-[#2A3441] mb-6 flex items-center justify-between">
                  <span className="text-xs text-slate-500 truncate mr-2 font-mono">{currentUrl}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(currentUrl)}
                    className="text-[#E2FF3A] text-[10px] font-bold uppercase tracking-widest hover:underline whitespace-nowrap"
                  >
                    Copiar
                  </button>
                </div>

                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full py-3 bg-[#2A3441] hover:bg-[#323E4D] text-white font-bold text-xs tracking-widest uppercase rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm font-bold tracking-widest uppercase mb-4">
                  Ronda Actual: {activeT.currentRound}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Rey de Cancha (Subidas y Bajadas)</h3>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  {isEmbedded ? 'Ingresa los resultados y pulsa Siguiente Ronda. Los ganadores subirán de cancha y los perdedores bajarán automáticamente.' : 'Sigue en vivo la rotación de las parejas en cada cancha.'}
                </p>
              </div>

              {/* Mexicano Courts */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-6xl mb-12">
                {activeT.fixture?.map((group: any, cIdx: number) => {
                  const matchIdx = (activeT.currentRound || 1) - 1;
                  const match = group.matches.find((m: any) => m.round === activeT.currentRound);
                  const matchId = `g${group.courtNumber}_m${matchIdx}`;
                  const score = activeT.matchScores?.[matchId] || { t1: 0, t2: 0 };
                  const isPodio = cIdx === 0;
                  const isPozo = cIdx === (activeT.fixture?.length || 0) - 1;

                  if (!match) return null;

                  return (
                    <div key={group.courtNumber} className={`bg-[#0F172A] border rounded-3xl p-6 flex flex-col relative overflow-hidden ${isPodio ? 'border-yellow-500/30' : isPozo ? 'border-red-500/30' : 'border-slate-800/60'}`}>
                      {isPodio && <div className="absolute top-0 right-0 p-4 opacity-10"><Crown className="w-24 h-24 text-yellow-500" /></div>}
                      {isPozo && <div className="absolute top-0 right-0 p-4 opacity-10"><Skull className="w-24 h-24 text-red-500" /></div>}
                      
                      <h4 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 ${isPodio ? 'text-yellow-500' : isPozo ? 'text-red-500' : 'text-brand-green'}`}>
                        {isPodio ? <Crown className="w-4 h-4" /> : isPozo ? <Skull className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        {group.courtName}
                      </h4>
                      
                      <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                           <div className="flex flex-col w-[35%]">
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team1.player1.name.split(' ')[0]}</span>
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team1.player2.name.split(' ')[0]}</span>
                           </div>
                           <div className="flex flex-col items-center gap-1">
                              {isEmbedded ? (
                                <input 
                                  type="number" min="0" 
                                  value={activeT.matchScores?.[matchId] !== undefined ? score.t1 : ''}
                                  onChange={(e) => updateMatchScore(activeT.id, matchId, parseInt(e.target.value)||0, score.t2)}
                                  placeholder="0"
                                  className="w-14 h-12 text-center text-xl bg-[#0F172A] border border-slate-700 rounded-lg text-white font-black focus:border-brand-green outline-none transition-colors"
                                />
                              ) : (
                                <span className="text-3xl font-black text-white w-14 text-center">{activeT.matchScores?.[matchId] !== undefined ? score.t1 : '-'}</span>
                              )}
                              {score.t1 > score.t2 && <ArrowUpCircle className="w-4 h-4 text-emerald-500" />}
                           </div>
                        </div>

                        <div className="flex items-center justify-center -my-3 z-10">
                           <span className="bg-[#0F172A] text-[10px] font-black tracking-widest text-slate-500 px-3 py-1 rounded-full border border-slate-800/60">VS</span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                           <div className="flex flex-col w-[35%]">
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team2.player1.name.split(' ')[0]}</span>
                              <span className="text-xs font-bold text-white line-clamp-1">{match.team2.player2.name.split(' ')[0]}</span>
                           </div>
                           <div className="flex flex-col items-center gap-1">
                              {isEmbedded ? (
                                <input 
                                  type="number" min="0" 
                                  value={activeT.matchScores?.[matchId] !== undefined ? score.t2 : ''}
                                  onChange={(e) => updateMatchScore(activeT.id, matchId, score.t1, parseInt(e.target.value)||0)}
                                  placeholder="0"
                                  className="w-14 h-12 text-center text-xl bg-[#0F172A] border border-slate-700 rounded-lg text-white font-black focus:border-brand-green outline-none transition-colors"
                                />
                              ) : (
                                <span className="text-3xl font-black text-white w-14 text-center">{activeT.matchScores?.[matchId] !== undefined ? score.t2 : '-'}</span>
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
                  <div className="flex-1 bg-[#0F172A] border border-slate-800/60 rounded-3xl p-6 flex flex-col gap-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-green"/> Historial de Partidos</h3>
                    <div className="flex flex-col gap-8">
                      {activeT.fixture.map((group: any) => {
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
                                {group.courtName} - {activeT?.format === 'americano' ? 'Ronda ' + (activeT.currentRound || 1) : group.matches.length + ' Partidos'}
                              </h4>
                              {restingPlayersText && (
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-2">
                                  {restingPlayersText}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-3">
                              {(() => {
                                let matchesToRender = group.matches;
                                if (activeT?.format === 'americano') {
                                  const cRound = activeT.currentRound || 1;
                                  matchesToRender = group.matches.filter((_: any, idx: number) => idx === cRound - 1);
                                }
                                
                                return matchesToRender.map((m: any, matchIndexInArray: number) => {
                                  const actualIndex = activeT?.format === 'americano' ? (activeT.currentRound || 1) - 1 : matchIndexInArray;
                                  const matchId = `g${group.courtNumber}_m${actualIndex}`;
                                const score = activeT?.matchScores?.[matchId] || { t1: 0, t2: 0 };
                                const hasBeenPlayed = activeT?.matchScores?.[matchId] !== undefined;
                                
                                return (
                                  <div key={actualIndex} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                                    <div className="flex items-center gap-3 w-[35%]">
                                      <span className="w-6 h-6 shrink-0 rounded bg-[#0B1120] text-xs font-bold flex items-center justify-center text-slate-400">{m.team1.localId}</span>
                                      <div className="flex flex-col">
                                        <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{m.team1.player1.name.split(' ')[0]}</span>
                                        <span className="text-[11px] font-medium text-slate-300 line-clamp-1">{m.team1.player2.name.split(' ')[0]}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-[30%] justify-center">
                                      {isEmbedded ? (
                                        <input 
                                          type="number" min="0" 
                                          value={hasBeenPlayed ? score.t1 : ''}
                                          onChange={(e) => updateMatchScore(activeT.id, matchId, parseInt(e.target.value)||0, score.t2)}
                                          placeholder="0"
                                          className="w-12 h-10 text-center bg-[#0F172A] border border-slate-700 rounded-lg text-white font-bold focus:border-brand-green outline-none transition-colors"
                                        />
                                      ) : (
                                        <span className="text-xl font-black text-white w-10 text-center">{hasBeenPlayed ? score.t1 : '-'}</span>
                                      )}
                                      <span className="text-slate-600 font-black">-</span>
                                      {isEmbedded ? (
                                        <input 
                                          type="number" min="0" 
                                          value={hasBeenPlayed ? score.t2 : ''}
                                          onChange={(e) => updateMatchScore(activeT.id, matchId, score.t1, parseInt(e.target.value)||0)}
                                          placeholder="0"
                                          className="w-12 h-10 text-center bg-[#0F172A] border border-slate-700 rounded-lg text-white font-bold focus:border-brand-green outline-none transition-colors"
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
                                      <span className="w-6 h-6 shrink-0 rounded bg-[#0B1120] text-xs font-bold flex items-center justify-center text-slate-400">{m.team2.localId}</span>
                                    </div>
                                  </div>
                                );
                              })})()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isEmbedded && activeT.format === 'personalizado' && (
                      <div className="flex justify-center mt-6 pt-6 border-t border-slate-800/60">
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
                    <div className="bg-[#0F172A] border border-slate-800/60 rounded-3xl p-6 sticky top-24">
                      <h4 className="text-sm font-bold text-brand-green uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Trophy className="w-4 h-4" /> Posiciones
                      </h4>
                      <div className="flex flex-col gap-2">
                         {classifiedPairs.map((team: any, idx: number) => (
                            <div key={team.id} className={`flex items-center justify-between p-3 rounded-lg border ${idx < 2 ? 'bg-brand-green-hover/10 border-brand-green/20' : 'bg-[#0F172A] border-slate-800/60'}`}>
                              <div className="flex items-center gap-3">
                                <span className={`font-black text-lg ${idx < 2 ? 'text-emerald-400' : 'text-slate-600'}`}>{idx + 1}</span>
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-white line-clamp-1">{activeT?.format === 'personalizado' ? team.name : team.name}</span>
                                   <span className="text-[10px] text-slate-500">{team.matchesPlayed || 0} Partidos Jugados</span>
                                </div>
                              </div>
                              <span className="text-lg font-black text-brand-green">{team.points || 0} <span className="text-[10px] text-slate-500 uppercase">{activeT?.format === 'personalizado' ? 'sets' : 'pts'}</span></span>
                            </div>
                         ))}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-[#0F172A] border border-slate-800/60 rounded-3xl p-8 w-full max-w-4xl mb-8">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> Parejas Clasificadas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classifiedPairs.map((pair: any) => (
                      <div key={pair.id} className="bg-slate-950 border border-slate-800/60 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center font-black text-brand-green">
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

              {isEmbedded && activeT?.format === 'americano' && (activeT.currentRound || 1) < (activeT.fixture?.[0]?.matches?.length || 1) && (
                <motion.button
                  onClick={handleNextRoundAmericanoClasico}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.15em] uppercase text-sm rounded-xl overflow-hidden flex items-center gap-3 mb-4"
                >
                  <Swords className="w-5 h-5" />
                  Siguiente Ronda
                </motion.button>
              )}

              {isEmbedded && (activeT?.format !== 'americano' || (activeT.currentRound || 1) >= (activeT.fixture?.[0]?.matches?.length || 1)) && (
                <motion.button
                  onClick={() => handleNavigateToBrackets()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.15em] uppercase text-sm rounded-xl overflow-hidden flex items-center gap-3"
                >
                  <Swords className="w-5 h-5" />
                  Cerrar Fase y Generar Brackets
                </motion.button>
              )}
            </motion.div>
          ) : stage === 'bracket_config' ? (
            <motion.div
              key="bracket_config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col max-w-4xl mx-auto w-full"
            >
              <div className="bg-[#1C232D] border border-[#2A3441] rounded-2xl p-6 shadow-xl mb-6">
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">
                  Configurar Fase Final
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Selecciona a los jugadores que pasarán a la llave eliminatoria. El sistema los mezclará aleatoriamente en el bracket.
                </p>

                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tamaño del Bracket</label>
                  <select 
                    value={configBracketSize}
                    onChange={(e) => setConfigBracketSize(Number(e.target.value))}
                    className="w-full bg-[#0F172A] border border-[#2A3441] rounded-lg p-3 text-white focus:outline-none focus:border-[#E2FF3A]"
                  >
                    <option value={4}>Semifinales (Hasta 4 parejas)</option>
                    <option value={8}>Cuartos de Final (Hasta 8 parejas)</option>
                  </select>
                </div>

                <div className="space-y-6">
                  {groupedStandings.map((group: any) => (
                    <div key={group.courtNumber} className="border border-[#2A3441] rounded-xl overflow-hidden">
                      <div className="bg-[#151A20] px-4 py-2 border-b border-[#2A3441]">
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">{group.courtName}</h4>
                      </div>
                      <div className="divide-y divide-[#2A3441]">
                        {group.standings.map((pair: any, idx: number) => {
                          const isSelected = selectedForBracket.has(pair.id.toString());
                          return (
                            <label key={pair.id} className={`flex items-center gap-4 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-[#E2FF3A]/5' : 'hover:bg-[#2A3441]/50'}`}>
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded border-[#2A3441] bg-[#0F172A] text-[#E2FF3A] focus:ring-[#E2FF3A]"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newSet = new Set(selectedForBracket);
                                  if (e.target.checked) newSet.add(pair.id.toString());
                                  else newSet.delete(pair.id.toString());
                                  setSelectedForBracket(newSet);
                                }}
                              />
                              <div className="flex-1">
                                <span className={`font-bold block ${isSelected ? 'text-white' : 'text-slate-300'}`}>{pair.name}</span>
                                <span className="text-xs text-slate-500">Pts: {pair.points} | En contra: {pair.gamesAgainst || 0}</span>
                              </div>
                              <div className="text-[10px] font-black text-slate-600 bg-[#0F172A] px-2 py-1 rounded">
                                #{idx + 1}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button 
                    onClick={() => setStage('groups')}
                    className="px-6 py-3 text-slate-400 font-bold uppercase tracking-wider text-sm hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmBracketPhase}
                    disabled={selectedForBracket.size === 0}
                    className="px-6 py-3 bg-[#E2FF3A] text-black font-black uppercase tracking-wider text-sm rounded-lg hover:bg-[#d4f522] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar y Generar ({selectedForBracket.size}/{configBracketSize})
                  </button>
                </div>
              </div>
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
                <div className="mb-4 bg-brand-green/10 text-brand-green text-xs font-bold px-4 py-2 rounded-lg border border-brand-green/20 text-center flex items-center justify-between gap-8">
                  <span>Modo Admin: Haz clic en las parejas para avanzarlas de ronda</span>
                  <button onClick={() => setStage('bracket_config')} className="underline">Reconfigurar</button>
                </div>
              )}
              <BracketGenerator 
                participants={activeT?.bracketParticipants || []} 
                size={activeT?.bracketSize || 8}
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
