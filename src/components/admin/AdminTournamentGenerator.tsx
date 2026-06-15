import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Save, Calendar, Check, LayoutGrid, Users } from 'lucide-react';

import { fadeInUp, staggerContainer } from '../../lib/animations';
import { useTournaments } from '../../context/TournamentContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ManualRegistrationView from './ManualRegistrationView';
import InscriptionsView from './InscriptionsView';

interface Pair {
  id: number;      // Global ID
  localId: number; // ID 1 to 4 within their court
  player1: any;
  player2: any;
  teamElo: number;
}

interface CourtMatch {
  round: number;
  team1: Pair;
  team2: Pair;
}

interface CourtGroup {
  courtNumber: number;
  courtName: string;
  pairs: Pair[];
  matches: CourtMatch[];
}



export default function AdminTournamentGenerator() {
  const { registeredPairs, registeredPlayers, createTournament } = useTournaments();
  const [inscriptions] = useLocalStorage<any[]>('americano-inscriptions-v2', []);
  const confirmedPairs = inscriptions.filter(i => i.status === 'approved' && (i.p2Name || '').trim() !== '');
  const [activeTab, setActiveTab] = useState<'generator' | 'inscriptions' | 'communications'>('generator');
  const [selectedFormat, setSelectedFormat] = useState<'americano' | 'mexicano' | 'romano' | 'personalizado'>('americano');
  const [numCourts, setNumCourts] = useState<number>(2); // Default preset
  const [customPairs, setCustomPairs] = useState<number>(8); // Also represents 'players' for personalizado

  const [availablePairs, setAvailablePairs] = useState<Pair[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [fixture, setFixture] = useState<CourtGroup[] | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [rotationRule, setRotationRule] = useState<'equitativo' | 'rey_de_cancha'>('equitativo');

  // Sync custom values when preset buttons are clicked
  const handlePresetSelect = (n: number) => {
    setNumCourts(n);
    setCustomPairs(n * 4);
  };


  // Generate the pool of pairs when the number of pairs changes
  useEffect(() => {
    const totalPairsNeeded = customPairs;
    
    if (selectedFormat === 'romano') {
      // For Romano, we need 2x players
      const neededPlayers = totalPairsNeeded * 2;
      const availablePlayersList = [...registeredPlayers].slice(0, neededPlayers);
      
      // We will shuffle them in generateFixture, but for now we pair them up sequentially just to have 'availablePairs'
      const contextPairs: Pair[] = [];
      for (let i = 0; i < Math.floor(availablePlayersList.length / 2); i++) {
        const p1 = availablePlayersList[i * 2];
        const p2 = availablePlayersList[i * 2 + 1];
        contextPairs.push({
          id: 2000 + i,
          localId: 0,
          player1: { id: `ind-1-${i}`, name: p1.name, gender: 'Masculino', category: p1.category, elo: 1500, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
          player2: { id: `ind-2-${i}`, name: p2.name, gender: 'Masculino', category: p2.category, elo: 1500, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
          teamElo: 1500
        });
      }
      setAvailablePairs(contextPairs.slice(0, totalPairsNeeded));
    } else {
      // Tomamos SOLAMENTE las parejas registradas manualmente del Contexto
      const contextPairs: Pair[] = confirmedPairs.map((rp, index) => ({
        id: 1000 + index, // High ID to avoid collision
        localId: 0,
        player1: { id: `p1-${index}`, name: rp.p1Name, gender: 'Masculino', category: rp.category, elo: 1500, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
        player2: { id: `p2-${index}`, name: rp.p2Name, gender: 'Masculino', category: rp.category, elo: 1500, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
        teamElo: 1500 // Base ELO for manual pairs
      }));
      setAvailablePairs(contextPairs.slice(0, totalPairsNeeded));
    }
  }, [customPairs, confirmedPairs, registeredPlayers, selectedFormat]);

  const generateFixture = () => {
    setIsGenerating(true);
    setFixture(null);

    setTimeout(() => {
      // 1. Ordenar parejas por ELO o Aleatoriamente (Romano)
      let sortedPairs: Pair[] = [];
      
      if (selectedFormat === 'personalizado') {
        const shuffledPlayers = [...registeredPlayers].sort(() => Math.random() - 0.5).slice(0, customPairs);
        // Map individual players into a generic structure to pass to save. We'll store the individuals in availablePairs as a hack:
        // P1 will hold the player, P2 will be empty.
        const mappedPlayers: Pair[] = shuffledPlayers.map((p, i) => ({
          id: Date.now() + i,
          localId: 0,
          player1: { id: p.id, name: p.name, gender: 'Masculino', category: p.category, elo: 1500, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
          player2: { id: `empty-${i}`, name: '', gender: '', category: p.category, elo: 0, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
          teamElo: 1500
        }));
        setAvailablePairs(mappedPlayers);
      } else if (selectedFormat === 'romano') {
        // Mezclamos los JUGADORES INDIVIDUALES primero para formar parejas fijas
        const shuffledPlayers = [...registeredPlayers].sort(() => Math.random() - 0.5);
        for (let i = 0; i < customPairs; i++) {
          const p1 = shuffledPlayers[i * 2];
          const p2 = shuffledPlayers[i * 2 + 1];
          if (p1 && p2) {
            sortedPairs.push({
              id: 3000 + i,
              localId: 0,
              player1: { id: `rand-1-${i}`, name: p1.name, gender: 'Masculino', category: p1.category, elo: 1500, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
              player2: { id: `rand-2-${i}`, name: p2.name, gender: 'Masculino', category: p2.category, elo: 1500, points: 0, matchesPlayed: 0, winRate: 0, trend: 'stable' },
              teamElo: 1500
            });
          }
        }
        setAvailablePairs(sortedPairs);
      } else {
        sortedPairs = [...availablePairs].sort((a, b) => b.teamElo - a.teamElo);
      }
      
      const groups: CourtGroup[] = [];

      if (selectedFormat === 'personalizado') {
        // En personalizado, customPairs son jugadores individuales.
        // Hacemos 1 sola ronda inicial.
        const numMatches = Math.floor(customPairs / 4);
        const matches: CourtMatch[] = [];
        
        // availablePairs has the mapped players
        const players = [...registeredPlayers].sort(() => Math.random() - 0.5).slice(0, customPairs);
        
        for (let m = 0; m < numMatches; m++) {
          const p1 = players[m * 4];
          const p2 = players[m * 4 + 1];
          const p3 = players[m * 4 + 2];
          const p4 = players[m * 4 + 3];
          
          matches.push({
            round: 1,
            team1: {
              id: Date.now() + m*2, localId: 1, teamElo: 1500,
              player1: { id: p1.id, name: p1.name, category: 'N/A', elo: 1500 },
              player2: { id: p2.id, name: p2.name, category: 'N/A', elo: 1500 }
            },
            team2: {
              id: Date.now() + m*2 + 1, localId: 2, teamElo: 1500,
              player1: { id: p3.id, name: p3.name, category: 'N/A', elo: 1500 },
              player2: { id: p4.id, name: p4.name, category: 'N/A', elo: 1500 }
            }
          });
        }
        
        groups.push({
          courtNumber: 1,
          courtName: `Ronda 1`,
          pairs: [], // No fixed pairs in this format
          matches
        });
        
      } else if (selectedFormat === 'mexicano') {
        // Mexicano: 2 pairs per court. courts = groups
        const courts = Math.floor(customPairs / 2);
        for (let c = 0; c < courts; c++) {
          const p1 = sortedPairs[c * 2];
          const p2 = sortedPairs[c * 2 + 1];
          if (!p1 || !p2) break;
          
          groups.push({
            courtNumber: c + 1,
            courtName: `Cancha ${c + 1} ${c === 0 ? '(Podio)' : c === courts - 1 ? '(Pozo)' : ''}`,
            pairs: [{...p1, localId: 1}, {...p2, localId: 2}],
            matches: [{
              round: 1,
              team1: {...p1, localId: 1},
              team2: {...p2, localId: 2}
            }]
          });
        }
      } else {
        // Americano & Romano
        const pairsPerGroup = Math.ceil(customPairs / numCourts);
      
      for (let c = 0; c < numCourts; c++) {
        const courtPairs = sortedPairs.slice(c * pairsPerGroup, c * pairsPerGroup + pairsPerGroup).map((p, idx) => ({
          ...p,
          localId: idx + 1
        }));

        const m = courtPairs;
        const matches: CourtMatch[] = [];

        // ── Proper Round-Robin using ghost/bye for odd N ──────────────────
        // Guarantees every pair plays every other pair exactly once per cycle.
        // Repeats cycles until each pair has played ≥ guaranteedMatches times.
        //
        // How it works:
        //   1. If N is odd, add a ghost (bye) making it N+1 (even).
        //   2. Fix seat 0, rotate seats 1..N-1 each round. 
        //      In each round pair seat k with seat (N-1-k).
        //      Any match involving the ghost is skipped (= bye round for that pair).
        //   3. One full cycle → each real pair plays exactly N-1 opponents once.
        //   4. Repeat the cycle (reshuffling rotation start) until every pair
        //      has at least `guaranteedMatches` games. Rounds get new numbers.

        const buildOneRoundRobinCycle = (teams: typeof m, roundOffset: number): CourtMatch[] => {
          const cycleMatches: CourtMatch[] = [];
          const N = teams.length % 2 === 0 ? teams.length : teams.length + 1; // force even
          // seats 0..teams.length-1 are real; seat teams.length is ghost (bye)
          const seats = Array.from({ length: N }, (_, i) => i);

          for (let round = 0; round < N - 1; round++) {
            for (let k = 0; k < N / 2; k++) {
              const a = seats[k];
              const b = seats[N - 1 - k];
              const teamA = teams[a];
              const teamB = teams[b];
              // skip if either slot is ghost (index >= teams.length)
              if (teamA && teamB && a < teams.length && b < teams.length) {
                cycleMatches.push({ round: roundOffset + round + 1, team1: teamA, team2: teamB });
              }
            }
            // Rotate seats[1..N-1]: last element goes to position 1
            const last = seats[N - 1];
            for (let i = N - 1; i > 1; i--) seats[i] = seats[i - 1];
            seats[1] = last;
          }
          return cycleMatches;
        };

        if (m.length >= 2) {
          // matches per pair in one cycle = m.length - 1
          const matchesPerPairPerCycle = m.length - 1;
          const MIN_MATCHES_PER_PAIR = 3; // always guarantee at least 3 matches per pair
          const cyclesNeeded = Math.ceil(MIN_MATCHES_PER_PAIR / matchesPerPairPerCycle);

          for (let cycle = 0; cycle < cyclesNeeded; cycle++) {
            // Shuffle the order of pairs slightly each cycle (except cycle 0) 
            // so the repeat matchups happen in different order, keeping it fresh.
            // Cycle 0: use original order. Cycle 1+: rotate starting position.
            let cycleTeams = [...m];
            if (cycle > 0) {
              // shift by `cycle` positions to vary matchup order
              cycleTeams = [...m.slice(cycle % m.length), ...m.slice(0, cycle % m.length)];
            }
            const roundOffset = cycle * (m.length % 2 === 0 ? m.length - 1 : m.length);
            const cycleMatches = buildOneRoundRobinCycle(cycleTeams, roundOffset);
            matches.push(...cycleMatches);
          }
        }


        groups.push({
          courtNumber: c + 1,
          courtName: `Cancha ${c + 1} (Grupo ${String.fromCharCode(65 + c)})`,
          pairs: courtPairs,
          matches,
        });
      }
    }

      setFixture(groups);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSave = () => {
    setIsSaved(true);
    
    const participants = selectedFormat === 'personalizado' 
      ? availablePairs.map(p => ({
          id: p.id.toString(),
          name: p.player1.name,
          category: p.player1.category,
          date: 'Reciente'
        }))
      : availablePairs.map(p => ({
          id: p.id.toString(),
          p1Name: p.player1.name,
          p2Name: p.player2.name,
          category: p.player1.category,
          date: 'Reciente'
        }));

    createTournament(
      `${selectedFormat.charAt(0).toUpperCase() + selectedFormat.slice(1)} de ${selectedFormat === 'mexicano' ? Math.floor(customPairs/2) + ' Canchas' : selectedFormat === 'personalizado' ? customPairs + ' Jugadores' : numCourts + ' Canchas'}`, 
      selectedFormat,
      selectedFormat === 'mexicano' ? Math.floor(customPairs/2) : selectedFormat === 'personalizado' ? Math.floor(customPairs/4) : numCourts, 
      customPairs, 
      participants, 
      fixture || undefined,
      selectedFormat === 'personalizado' ? rotationRule : undefined
    );
    
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <section className="py-8 px-6 bg-transparent relative">
      <div className="mx-auto w-full relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-8 flex flex-col gap-2"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shuffle className="w-8 h-8 text-brand-green" />
            Gestor de Torneos Express
          </h2>
          <p className="text-slate-400 font-light text-sm">
            Administra inscripciones, genera fixtures al instante y envía comunicaciones para torneos de un día.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0F172A] p-1.5 rounded-2xl w-full max-w-2xl mx-auto mb-8 border border-slate-800/30 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('inscriptions')}
            className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all rounded-xl flex items-center justify-center gap-2 ${
              activeTab === 'inscriptions' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Inscripciones
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all rounded-xl flex items-center justify-center gap-2 ${
              activeTab === 'generator' ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            Generador
          </button>
        </div>


        {/* Tab Content: Inscriptions */}
        {activeTab === 'inscriptions' && (
          <motion.div
            key="inscriptions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <InscriptionsView />
          </motion.div>
        )}



        {/* Tab Content: Generator */}
        {activeTab === 'generator' && (
          <>
            {/* Configuration Controls (Shown when not viewing fixture) */}
        {!fixture && !isGenerating && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center max-w-3xl mx-auto w-full"
          >
            {/* Format Selector Tabs */}
            <div className="flex bg-[#0F172A] p-1.5 rounded-2xl w-full mb-6 border border-slate-800/30 backdrop-blur-sm">
              <button
                onClick={() => setSelectedFormat('americano')}
                className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all rounded-xl ${
                  selectedFormat === 'americano' ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                Americano
              </button>
              <button
                onClick={() => setSelectedFormat('mexicano')}
                className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all rounded-xl ${
                  selectedFormat === 'mexicano' ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                Mexicano
              </button>
              <button
                onClick={() => setSelectedFormat('romano')}
                className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all rounded-xl ${
                  selectedFormat === 'romano' ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                Romano
              </button>
            </div>

            <div className="bg-[#0F172A] border border-slate-800/30 p-8 rounded-3xl w-full flex flex-col items-center gap-8 mb-8 backdrop-blur-sm">
              {/* Context Hint */}
              <div className="w-full text-center text-slate-400 text-sm mb-4">
                {selectedFormat === 'americano' && 'Parejas fijas. Juegan todos contra todos en fase de grupos y los mejores pasan a las llaves eliminatorias.'}
                {selectedFormat === 'mexicano' && 'Rey de Cancha (Subidas y Bajadas). 2 parejas por cancha. El ganador sube de cancha, el perdedor baja.'}
                {selectedFormat === 'romano' && 'Parejas aleatorias formadas al instante. Luego se juega en formato de grupos todos contra todos.'}
                {selectedFormat === 'personalizado' && 'Americano Individual. Juegas con diferentes compañeros cada ronda. La tabla de posiciones es por individuo.'}
              </div>

              {selectedFormat === 'mexicano' ? (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex flex-col md:flex-row justify-center w-full gap-4 px-8 py-6 bg-[#0B1120] border border-slate-700/40 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        min="2"
                        value={Math.floor(customPairs / 2)}
                        onChange={(e) => setCustomPairs((parseInt(e.target.value) || 2) * 2)}
                        className="w-20 text-center text-4xl font-black text-white bg-transparent outline-none border-b-2 border-transparent hover:border-slate-800/30 focus:border-brand-green transition-colors"
                      />
                      <span className="text-[12px] uppercase tracking-widest text-slate-500 font-bold mt-2">Canchas Disponibles</span>
                      <span className="text-[10px] text-brand-green mt-1">({customPairs} parejas en total)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3 w-full">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      Plantillas Rápidas (Canchas)
                    </span>
                    <div className="flex bg-slate-950 p-1.5 rounded-2xl w-full">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => handlePresetSelect(n)}
                          className={`flex-1 py-3 text-sm font-bold tracking-widest transition-all rounded-xl ${
                            numCourts === n
                              ? 'bg-brand-dark text-white shadow-lg shadow-brand-green-hover/50'
                              : 'text-slate-500 hover:text-white hover:bg-[#0B1120]'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between w-full gap-4 px-8 py-6 bg-[#0B1120] border border-slate-700/40 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="flex flex-col items-center flex-1">
                      <input
                        type="number"
                        min="2"
                        value={customPairs}
                        onChange={(e) => setCustomPairs(parseInt(e.target.value) || 2)}
                        className="w-16 text-center text-3xl font-black text-white bg-transparent outline-none border-b-2 border-transparent hover:border-slate-800/30 focus:border-brand-green transition-colors"
                      />
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
                        {selectedFormat === 'personalizado' ? 'Jugadores' : 'Parejas'}
                      </span>
                    </div>
                    {selectedFormat !== 'personalizado' && (
                       <>
                         <div className="flex flex-col items-center flex-1">
                           <input
                             type="number"
                             min="1"
                             value={numCourts}
                             onChange={(e) => setNumCourts(parseInt(e.target.value) || 1)}
                             className="w-16 text-center text-3xl font-black text-white bg-transparent outline-none border-b-2 border-transparent hover:border-slate-800/30 focus:border-brand-green transition-colors"
                           />
                           <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1 text-center">Canchas<br/>(Grupos)</span>
                         </div>
                         <div className="flex flex-col items-center flex-1">
                           {(() => {
                             const pairsPerGroup = Math.ceil(customPairs / numCourts);
                             const matchesPerPairPerCycle = Math.max(1, pairsPerGroup - 1);
                             const cycles = Math.ceil(3 / matchesPerPairPerCycle);
                             const actualMatches = cycles * matchesPerPairPerCycle;
                             return (
                               <>
                                 <span className="text-3xl font-black text-white">{actualMatches}</span>
                                 <span className="text-[10px] uppercase tracking-widest text-brand-green font-bold mt-1 text-center">Partidos<br/>por Pareja</span>
                                 <span className="text-[9px] text-slate-600 mt-1">{pairsPerGroup} p/cancha</span>
                               </>
                             );
                           })()}
                         </div>
                       </>
                     )}
                  </div>
                  {selectedFormat === 'personalizado' && (
                    <div className="flex flex-col w-full px-6 py-4 bg-[#0B1120] border border-slate-800/30 rounded-2xl gap-2 mt-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Regla de Rotación</span>
                      <select 
                        value={rotationRule}
                        onChange={(e) => setRotationRule(e.target.value as 'equitativo' | 'rey_de_cancha')}
                        className="bg-slate-950 border border-slate-700/50 text-white rounded-lg p-2 text-sm outline-none focus:border-brand-green"
                      >
                        <option value="equitativo">Equitativo (Aleatorio priorizando descansados)</option>
                        <option value="rey_de_cancha" disabled={customPairs !== 6}>Rey de Cancha (Ganador se queda, Perdedor sale) - Requiere 6 Jugadores</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              {selectedFormat === 'personalizado' ? (
                registeredPlayers.length < customPairs && (
                  <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
                    Atención: Necesitas {customPairs} jugadores individuales para este formato, pero solo tienes {registeredPlayers.length} registrados. ¡Usa el panel de abajo para inscribir a los jugadores faltantes!
                  </div>
                )
              ) : selectedFormat === 'romano' ? (
                registeredPlayers.length < customPairs * 2 && (
                  <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
                    Atención: Necesitas {customPairs * 2} jugadores individuales para este formato, pero solo tienes {registeredPlayers.length} registrados. ¡Usa el panel de abajo para inscribir a los jugadores faltantes!
                  </div>
                )
              ) : (
                confirmedPairs.length < customPairs && (
                  <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
                    Atención: Necesitas {customPairs} parejas para este formato, pero solo tienes {confirmedPairs.length} registradas. ¡Usa el panel de abajo para inscribir a las parejas faltantes!
                  </div>
                )
              )}

              <div className="w-full mt-4 mb-4 border-t border-slate-800/40 pt-4">
                <ManualRegistrationView isEmbedded />
              </div>

              <motion.button
                onClick={generateFixture}
                disabled={selectedFormat === 'personalizado' ? registeredPlayers.length < customPairs : selectedFormat === 'romano' ? registeredPlayers.length < customPairs * 2 : confirmedPairs.length < customPairs}
                whileHover={{ scale: (selectedFormat === 'personalizado' ? registeredPlayers.length < customPairs : selectedFormat === 'romano' ? registeredPlayers.length < customPairs * 2 : confirmedPairs.length < customPairs) ? 1 : 1.02 }}
                whileTap={{ scale: (selectedFormat === 'personalizado' ? registeredPlayers.length < customPairs : selectedFormat === 'romano' ? registeredPlayers.length < customPairs * 2 : confirmedPairs.length < customPairs) ? 1 : 0.98 }}
                className={`w-full relative px-8 py-4 font-bold tracking-[0.15em] uppercase text-sm overflow-hidden flex items-center justify-center gap-3 rounded-xl transition-all ${
                  (selectedFormat === 'personalizado' ? registeredPlayers.length < customPairs : selectedFormat === 'romano' ? registeredPlayers.length < customPairs * 2 : confirmedPairs.length < customPairs)
                    ? 'bg-[#0B1120] text-slate-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-slate-200'
                }`}
              >
                <Shuffle className="w-5 h-5" />
                <span>Generar Fixture en Vivo</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-brand-green/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-light text-lg animate-pulse">
              Distribuyendo {customPairs} parejas en {numCourts} grupos...
            </p>
          </div>
        )}

        {fixture && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 w-full"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setFixture(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold tracking-wide transition-colors"
              >
                ← VOLVER A EDITAR
              </button>
              
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaved}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors shrink-0 ${
                  isSaved 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                  : 'bg-white text-black hover:bg-slate-200'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaved ? 'GUARDADO' : 'GUARDAR FIXTURE'}
              </motion.button>
            </div>

            {/* Fixture Grid (Horizontal scroll on mobile) */}
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
              {fixture.map((group) => (
                <div 
                  key={group.courtNumber} 
                  className="flex-shrink-0 w-[90vw] md:w-[400px] snap-start bg-[#0B1120] border border-slate-800/30 rounded-3xl overflow-hidden flex flex-col"
                >
                  {/* Court Header */}
                  <div className="bg-[#0F172A] px-6 py-5 border-b border-slate-800/30 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-brand-green" />
                      {group.courtName}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/30">
                      Nivel Similar
                    </span>
                  </div>

                  <div className="p-6 flex flex-col gap-8 flex-1">
                    {/* Teams Table */}
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-12 text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 px-2">
                        <div className="col-span-2 text-center">Nº</div>
                        <div className="col-span-7">Pareja</div>
                        <div className="col-span-3 text-right">ELO Prom</div>
                      </div>
                      
                      {group.pairs.map((pair) => (
                        <div key={pair.id} className="grid grid-cols-12 items-center bg-[#0B1120] rounded-xl p-2.5 border border-transparent shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-800/50 hover:bg-[#0F172A] transition-colors">
                          <div className="col-span-2 flex justify-center">
                            <span className="w-6 h-6 rounded-md bg-brand-green/10 text-brand-green font-black text-xs flex items-center justify-center">
                              {pair.localId}
                            </span>
                          </div>
                          <div className="col-span-7 flex flex-col">
                            <span className="text-sm font-medium text-slate-200 line-clamp-1">{pair.player1.name}</span>
                            <span className="text-sm font-medium text-slate-200 line-clamp-1">{pair.player2.name}</span>
                          </div>
                          <div className="col-span-3 text-right pr-2">
                            <span className="text-xs font-mono font-bold text-slate-400">{pair.teamElo}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Matches List */}
                    <div className="flex flex-col gap-3 relative">
                      {/* Section Title */}
                      <div className="flex items-center gap-4 mb-2">
                        <div className="h-[1px] flex-1 bg-[#0B1120]" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
                          Partidos ({group.matches.length})
                        </span>
                        <div className="h-[1px] flex-1 bg-[#0B1120]" />
                      </div>

                      {group.matches.map((match) => (
                        <div key={match.round} className="flex items-stretch bg-[#0B1120]/40 rounded-xl border border-slate-800/30 overflow-hidden hover:border-slate-700/50 transition-colors group/match">
                          <div className="w-10 bg-[#0B1120] flex items-center justify-center border-r border-slate-800/30 shrink-0">
                            <span className="text-[10px] font-black text-slate-500 group-hover/match:text-brand-green transition-colors">
                              R{match.round}
                            </span>
                          </div>
                          <div className="flex-1 flex items-center justify-between p-3">
                            {/* Team 1 */}
                            <div className="flex items-center gap-3 w-[40%]">
                              <span className="w-6 h-6 shrink-0 rounded bg-[#0B1120] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                {match.team1.localId}
                              </span>
                              <div className="flex flex-col w-full">
                                <span className="text-[11px] font-medium text-white line-clamp-1">{match.team1.player1.name.split(' ')[0]}</span>
                                <span className="text-[11px] font-medium text-white line-clamp-1">{match.team1.player2.name.split(' ')[0]}</span>
                              </div>
                            </div>

                            {/* VS */}
                            <div className="shrink-0 flex items-center justify-center w-[20%]">
                              <span className="text-[9px] font-black tracking-widest text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/30">VS</span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex items-center justify-end gap-3 w-[40%] text-right">
                              <div className="flex flex-col w-full">
                                <span className="text-[11px] font-medium text-white line-clamp-1">{match.team2.player1.name.split(' ')[0]}</span>
                                <span className="text-[11px] font-medium text-white line-clamp-1">{match.team2.player2.name.split(' ')[0]}</span>
                              </div>
                              <span className="w-6 h-6 shrink-0 rounded bg-[#0B1120] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                {match.team2.localId}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        </>
        )}
      </div>
    </section>
  );
}
