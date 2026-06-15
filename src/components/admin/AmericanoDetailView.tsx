import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Users, Trophy, LayoutGrid } from 'lucide-react';
import { useTournaments } from '../../context/TournamentContext';
import AmericanoLiveView from '../AmericanoLiveView';
import { fadeInUp } from '../../lib/animations';

interface AmericanoDetailViewProps {
  tournamentId: number | 'new';
  onBack: () => void;
  onTournamentCreated?: (id: number) => void;
}

export default function AmericanoDetailView({ tournamentId, onBack, onTournamentCreated }: AmericanoDetailViewProps) {
  const { 
    activeTournaments, 
    createTournament, 
    updateTournament,
    addInscriptionToTournament,
    removeInscriptionFromTournament 
  } = useTournaments();
  
  const isNew = tournamentId === 'new';
  const tournament = activeTournaments.find(t => t.id === tournamentId) || null;

  const [activeTab, setActiveTab] = useState<'config' | 'inscriptions' | 'live_groups' | 'brackets'>('config');

  const [name, setName] = useState(tournament?.name || '');
  const [format, setFormat] = useState(tournament?.format || 'americano');
  const [rotationRule, setRotationRule] = useState<'equitativo' | 'rey_de_cancha'>('equitativo');
  const [courts, setCourts] = useState(tournament?.courts || 4);
  const [pairs, setPairs] = useState(tournament?.pairs || 12);
  const [numGroups, setNumGroups] = useState(tournament?.numGroups || 4);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSave = () => {
    if (tournament && tournament.inscriptions && pairs < tournament.inscriptions.length) {
      alert(`No puedes reducir el límite a ${pairs} parejas porque ya hay ${tournament.inscriptions.length} parejas inscritas.`);
      return;
    }

    if (isNew) {
      const newId = createTournament(name || 'Nuevo Torneo', format as any, courts, pairs, [], [], rotationRule, numGroups);
      if (onTournamentCreated) {
        onTournamentCreated(newId);
      }
    } else if (tournament) {
      updateTournament({
        ...tournament,
        name,
        format,
        courts,
        pairs,
        numGroups,
        rotationRule
      });
      setActiveTab('inscriptions');
    }
  };

  const tabs = [
    { id: 'config', label: 'Configuración', icon: Settings },
    { id: 'inscriptions', label: 'Inscripciones', icon: Users, disabled: isNew },
    { id: 'live_groups', label: 'Fase de Grupos (En Vivo)', icon: Trophy, disabled: isNew },
    { id: 'brackets', label: 'Llaves (Brackets)', icon: LayoutGrid, disabled: isNew },
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isNew ? 'Nuevo Torneo Americano' : tournament?.name}
          </h2>
          <p className="text-sm text-slate-400">
            {isNew ? 'Configura los detalles iniciales de tu torneo.' : 'Centro de Control Total'}
          </p>
        </div>
      </div>

      <div className="bg-[#0F172A] p-2 rounded-xl border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex flex-wrap gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id as any)}
              disabled={isDisabled}
              className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : isDisabled 
                    ? 'text-slate-600 cursor-not-allowed opacity-50' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-[#0F172A] rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl"
      >
        {activeTab === 'config' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {isNew ? 'Configuración Inicial' : 'Detalles del Torneo'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Nombre del Torneo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Americano Nocturno"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400">Formato</label>
                  <select 
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="americano">Americano (Parejas Fijas)</option>
                    <option value="fase_de_grupos">Fase de Grupos (Mundial)</option>
                  </select>
                </div>
                <div>
                  {format === 'fase_de_grupos' ? (
                    <>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Número de Grupos</label>
                      <select 
                        value={numGroups}
                        onChange={(e) => setNumGroups(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                      >
                        <option value={2}>2 Grupos (Clasifican 4)</option>
                        <option value={4}>4 Grupos (Clasifican 8)</option>
                        <option value={8}>8 Grupos (Clasifican 16)</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Rotación</label>
                      <input 
                        type="text" 
                        value="Automático (Equitativo)"
                        disabled
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-500 outline-none cursor-not-allowed"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Número de Canchas</label>
                  <input 
                    type="number" 
                    value={courts}
                    onChange={(e) => setCourts(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Total de Parejas</label>
                  <input 
                    type="number" 
                    value={pairs}
                    onChange={(e) => setPairs(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {isNew ? 'Guardar y Continuar' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inscriptions' && !isNew && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Añadir Pareja</h3>
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Jugador 1</label>
                  <input 
                    type="text" 
                    id="new-p1"
                    placeholder="Nombre del Jugador 1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Jugador 2</label>
                  <input 
                    type="text" 
                    id="new-p2"
                    placeholder="Nombre del Jugador 2"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Categoría</label>
                  <select 
                    id="new-category"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="1era">1era Categoría</option>
                    <option value="2da">2da Categoría</option>
                    <option value="3ra">3ra Categoría</option>
                    <option value="4ta">4ta Categoría</option>
                    <option value="5ta">5ta Categoría</option>
                    <option value="6ta">6ta Categoría</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    if (tournament && tournament.inscriptions && tournament.inscriptions.length >= tournament.pairs) {
                      alert('Se ha alcanzado el límite de parejas para este torneo.');
                      return;
                    }
                    const p1 = (document.getElementById('new-p1') as HTMLInputElement).value;
                    const p2 = (document.getElementById('new-p2') as HTMLInputElement).value;
                    const cat = (document.getElementById('new-category') as HTMLSelectElement).value as any;
                    if (p1 && p2 && tournament) {
                      addInscriptionToTournament(tournament.id, p1, p2, cat);
                      (document.getElementById('new-p1') as HTMLInputElement).value = '';
                      (document.getElementById('new-p2') as HTMLInputElement).value = '';
                    }
                  }}
                  disabled={tournament && tournament.inscriptions && tournament.inscriptions.length >= tournament.pairs}
                  className={`w-full py-3 font-bold rounded-lg transition-colors mt-4 ${
                    tournament && tournament.inscriptions && tournament.inscriptions.length >= tournament.pairs
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {tournament && tournament.inscriptions && tournament.inscriptions.length >= tournament.pairs 
                    ? 'Límite Alcanzado' 
                    : 'Registrar Pareja'}
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Lista de Inscritos</h3>
                <span className="text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-full text-sm">
                  {tournament?.inscriptions?.length || 0} / {tournament?.pairs || 0} Parejas
                </span>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {tournament?.inscriptions?.map((pair: any) => (
                  <motion.div 
                    key={pair.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-medium">{pair.p1Name} & {pair.p2Name}</p>
                      <p className="text-xs text-slate-500 mt-1">{pair.category} Categoría</p>
                    </div>
                    <button 
                      onClick={() => removeInscriptionFromTournament(tournament.id, pair.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <span className="text-xs font-bold">Eliminar</span>
                    </button>
                  </motion.div>
                ))}
                
                {(!tournament?.inscriptions || tournament.inscriptions.length === 0) && (
                  <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
                    <p className="text-slate-500">No hay inscripciones registradas aún.</p>
                  </div>
                )}
              </div>
              
              {(!tournament?.fixture || tournament.fixture.length === 0) && tournament?.inscriptions && tournament.inscriptions.length > 0 && (
                <button 
                  onClick={() => {
                    import('../../lib/fixtureGenerator').then(({ generateAmericanoFixture, generateGroupStageFixture }) => {
                      let fixture;
                      if (tournament.format === 'fase_de_grupos') {
                        fixture = generateGroupStageFixture(
                          tournament.inscriptions || [],
                          tournament.numGroups || 4
                        );
                      } else {
                        fixture = generateAmericanoFixture(
                          tournament.inscriptions || [],
                          tournament.format as any,
                          tournament.courts,
                          tournament.pairs
                        );
                      }
                      updateTournament({ ...tournament, fixture, status: 'En Juego' });
                      setActiveTab('live_groups');
                    });
                  }}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
                >
                  Generar Fixture y Comenzar Torneo
                </button>
              )}

              {tournament?.fixture && tournament.fixture.length > 0 && (
                <button 
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transform hover:-translate-y-1"
                >
                  ⚠️ Forzar Regeneración de Fixture
                </button>
              )}
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-red-500">⚠️</span> ¿Estás completamente seguro?
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Regenerar el fixture borrará <strong className="text-red-400">TODOS los resultados actuales</strong> de la Fase de Grupos y recalculará los enfrentamientos. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    import('../../lib/fixtureGenerator').then(({ generateAmericanoFixture, generateGroupStageFixture }) => {
                      let fixture;
                      if (tournament?.format === 'fase_de_grupos') {
                        fixture = generateGroupStageFixture(
                          tournament?.inscriptions || [],
                          tournament?.numGroups || 4
                        );
                      } else {
                        fixture = generateAmericanoFixture(
                          tournament?.inscriptions || [],
                          tournament?.format as any,
                          tournament?.courts || 4,
                          tournament?.pairs || 12
                        );
                      }
                      updateTournament({ ...tournament!, fixture, status: 'En Juego' });
                      setShowConfirmModal(false);
                      setActiveTab('live_groups');
                    });
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Sí, Regenerar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'live_groups' && !isNew && (
          <div className="w-full -mt-10">
            <AmericanoLiveView 
              isEmbedded={true} 
              defaultTournamentId={tournament?.id} 
              defaultStage="groups"
              hideTabs={true}
            />
          </div>
        )}

        {activeTab === 'brackets' && !isNew && (
          <div className="w-full -mt-10">
            <AmericanoLiveView 
              isEmbedded={true} 
              defaultTournamentId={tournament?.id} 
              defaultStage="brackets"
              hideTabs={true}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
