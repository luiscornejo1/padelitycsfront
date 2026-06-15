import { useState } from 'react';
import { Trophy, Users, Settings, Target, ChevronRight, Download, Share2, CreditCard, CheckCircle2, XCircle, Activity, Calendar, X, Eye, MessageSquare, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BracketGenerator from '../BracketGenerator';

type TabType = 'config' | 'inscriptions' | 'groups' | 'brackets' | 'communications';

export default function MajorTournamentView() {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const [selectedCategory, setSelectedCategory] = useState('3ra');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fixtureGenerated, setFixtureGenerated] = useState(false);
  const [showMatchesModal, setShowMatchesModal] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'convocatoria' | 'cupos' | 'fixture' | 'cobro'>('convocatoria');

  const categories = ['2da', '3ra', '4ta', '5ta', 'Damas A', 'Damas B'];

  const handleGenerateFixture = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setFixtureGenerated(true);
    }, 2500);
  };

  const MatchModal = () => {
    if (!showMatchesModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060c19]/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
        >
          <div className="bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-slate-700">
            <h3 className="text-lg font-bold">Partidos - Grupo {showMatchesModal}</h3>
            <button onClick={() => setShowMatchesModal(null)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((match) => (
              <div key={match} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                <div className="flex-1 text-right font-medium">Pareja Local {match}</div>
                <div className="flex gap-2">
                  <input type="number" placeholder="0" className="w-12 h-12 bg-slate-900 border border-slate-600 rounded text-center text-lg font-bold outline-none focus:border-emerald-500" />
                  <span className="text-2xl text-slate-500">-</span>
                  <input type="number" placeholder="0" className="w-12 h-12 bg-slate-900 border border-slate-600 rounded text-center text-lg font-bold outline-none focus:border-emerald-500" />
                </div>
                <div className="flex-1 text-left font-medium">Pareja Visita {match}</div>
              </div>
            ))}
            <div className="flex justify-end pt-4">
              <button onClick={() => setShowMatchesModal(null)} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg font-bold transition-all">
                Guardar Resultados
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-[#060c19] min-h-full text-white relative">
      <MatchModal />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Torneo Mayor: Copa Aniversario
          </h2>
          <p className="text-slate-400 mt-1">Gestión avanzada: Finanzas, Grupos y Cuadros Eliminatorios.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Compartir Link
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button onClick={() => setActiveTab('config')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Settings className="w-4 h-4" /> Configuración
        </button>
        <button onClick={() => setActiveTab('inscriptions')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'inscriptions' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <CreditCard className="w-4 h-4" /> Inscripciones y Pagos
        </button>
        <button onClick={() => setActiveTab('groups')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'groups' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Users className="w-4 h-4" /> Fase de Grupos
        </button>
        <button onClick={() => setActiveTab('brackets')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'brackets' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <Target className="w-4 h-4" /> Cuadro Principal
        </button>
        <button onClick={() => setActiveTab('communications')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'communications' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          <MessageSquare className="w-4 h-4" /> Comunicaciones
        </button>
      </div>

      {/* Categories Filter */}
      {activeTab !== 'config' && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
              Categoría {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        
        {/* CONFIGURATION */}
        {activeTab === 'config' && (
          <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" /> Parámetros Generales
              </h3>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Nombre del Torneo</label>
                <input type="text" defaultValue="Copa Aniversario Urban" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Costo Inscripción (S/)</label>
                  <input type="number" defaultValue="100" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Puntos para Ranking</label>
                  <input type="number" defaultValue="1000" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Cierre de Inscripción</label>
                  <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 text-white color-scheme-dark" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Sede / Club</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500">
                    <option>Urban Padel Club</option>
                    <option>Padel Pro Center</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Reglas y Formato
              </h3>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Reglas de Puntuación</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500">
                  <option>Punto de Oro en iguales</option>
                  <option>Ventaja tradicional</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Formato de Sets (Grupos)</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500">
                  <option>1 Set a 9 juegos (Pro-set)</option>
                  <option>Mejor de 3 sets (Super tie-break)</option>
                  <option>Mejor de 3 sets completos</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Premios (1er y 2do Puesto)</label>
                <textarea rows={3} placeholder="Ej: Efectivo S/1000 + Palas Siux..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 resize-none"></textarea>
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20">
                Guardar Configuración
              </button>
            </div>
          </motion.div>
        )}

        {/* INSCRIPTIONS & PAYMENTS */}
        {activeTab === 'inscriptions' && (
          <motion.div key="inscriptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h3 className="font-bold text-lg">Control de Pagos - Categoría {selectedCategory}</h3>
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">12 Pre-inscritos</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4">Pareja</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4 text-center">Método</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {[
                      { id: 1, p1: 'L. Cornejo', p2: 'M. Santos', date: 'Hace 2 horas', method: 'Yape', status: 'pending' },
                      { id: 2, p1: 'C. Ruiz', p2: 'F. Torres', date: 'Ayer', method: 'Transferencia', status: 'approved' },
                      { id: 3, p1: 'D. Blanco', p2: 'S. Ramos', date: 'Hace 5 horas', method: 'Plin', status: 'pending' },
                    ].map((row) => (
                      <tr key={row.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium">{row.p1} / {row.p2}</td>
                        <td className="px-6 py-4 text-slate-400">{row.date}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded border border-slate-700 text-xs">{row.method}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {row.status === 'pending' ? (
                            <span className="text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">Por Aprobar</span>
                          ) : (
                            <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">Aprobado</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300" title="Ver Comprobante">
                              <Eye className="w-4 h-4" />
                            </button>
                            {row.status === 'pending' && (
                              <>
                                <button className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition-colors">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* GROUPS */}
        {activeTab === 'groups' && (
          <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Grupos - Categoría {selectedCategory}</h3>
              <button 
                onClick={handleGenerateFixture}
                disabled={isGenerating || fixtureGenerated}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Target className="w-4 h-4" /></motion.div> Aplicando Snake...</>
                ) : fixtureGenerated ? (
                  <><CheckCircle2 className="w-4 h-4" /> Fixture Creado</>
                ) : (
                  'Generar Fixture'
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['A', 'B'].map((groupName) => (
                <div key={groupName} className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-lg">Grupo {groupName}</h4>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">2 Clasifican</span>
                  </div>
                  <div className="overflow-x-auto min-h-[140px]">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 uppercase bg-slate-900/80">
                        <tr>
                          <th className="px-4 py-3">Pareja</th>
                          <th className="px-3 py-3 text-center">PJ</th>
                          <th className="px-3 py-3 text-center">PG</th>
                          <th className="px-3 py-3 text-center">PP</th>
                          <th className="px-3 py-3 text-center text-emerald-400">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {fixtureGenerated ? (
                          <>
                            <tr className="hover:bg-slate-800/20">
                              <td className="px-4 py-3 font-medium">{groupName === 'A' ? 'L. Cornejo / M. Santos' : 'C. Ruiz / F. Torres'}</td>
                              <td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center font-bold text-emerald-400">0</td>
                            </tr>
                            <tr className="hover:bg-slate-800/20">
                              <td className="px-4 py-3 font-medium">{groupName === 'A' ? 'J. Perez / R. Gomez' : 'D. Blanco / S. Ramos'}</td>
                              <td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center font-bold text-emerald-400">0</td>
                            </tr>
                            <tr className="hover:bg-slate-800/20">
                              <td className="px-4 py-3 font-medium">{groupName === 'A' ? 'A. Silva / P. Costa' : 'H. Medina / G. Cruz'}</td>
                              <td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center">0</td><td className="px-3 py-3 text-center font-bold text-emerald-400">0</td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                              Esperando sorteo de fixture...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {fixtureGenerated && (
                    <div className="p-3 bg-slate-900 border-t border-slate-800">
                      <button onClick={() => setShowMatchesModal(groupName)} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors">
                        Ver partidos <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* BRACKETS */}
        {activeTab === 'brackets' && (
          <motion.div key="brackets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Cuadro Principal (Eliminatorias) - {selectedCategory}</h3>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Llaves
              </button>
            </div>
            
            <div className="bg-slate-900/30 p-4 md:p-8 rounded-2xl border border-slate-800 overflow-x-auto">
              <div className="min-w-[800px]">
                <BracketGenerator 
                  participants={[
                    { id: '1', name: 'L. Cornejo / M. Santos', seed: '1' },
                    { id: '2', name: 'C. Ruiz / F. Torres', seed: '2' },
                    { id: '3', name: 'J. Perez / R. Gomez', seed: '3' },
                    { id: '4', name: 'D. Blanco / S. Ramos', seed: '4' }
                  ]}
                  bracketResults={{ 's1': '1', 's2': '2', 'f': '1' }}
                  isAdmin={true}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* COMMUNICATIONS */}
        {activeTab === 'communications' && (
          <motion.div key="communications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 space-y-4">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" /> Plantillas Automáticas
              </h3>
              
              <button onClick={() => setSelectedTemplate('convocatoria')} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate === 'convocatoria' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'}`}>
                <div className="font-bold mb-1">📢 Convocatoria Inicial</div>
                <div className="text-xs opacity-70">Anuncio para invitar a inscribirse.</div>
              </button>
              
              <button onClick={() => setSelectedTemplate('cupos')} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate === 'cupos' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'}`}>
                <div className="font-bold mb-1">⏳ Actualización de Cupos</div>
                <div className="text-xs opacity-70">Lista de inscritos y cupos restantes.</div>
              </button>
              
              <button onClick={() => setSelectedTemplate('fixture')} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate === 'fixture' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'}`}>
                <div className="font-bold mb-1">📅 Publicación de Fixture</div>
                <div className="text-xs opacity-70">Grupos y horarios del primer partido.</div>
              </button>
              
              <button onClick={() => setSelectedTemplate('cobro')} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate === 'cobro' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'}`}>
                <div className="font-bold mb-1">💰 Recordatorio de Pago</div>
                <div className="text-xs opacity-70">Mensaje directo para cobrar pendientes.</div>
              </button>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <div className="bg-[#efeae2] p-6 rounded-2xl border border-slate-800 min-h-[500px] relative flex flex-col" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain', backgroundBlendMode: 'overlay' }}>
                <div className="bg-white p-4 rounded-xl rounded-tl-none shadow-sm max-w-[85%] text-slate-800 whitespace-pre-wrap font-sans text-[15px] leading-relaxed relative">
                  {selectedTemplate === 'convocatoria' && (
                    <>
                      🎾 *COPA ANIVERSARIO URBAN* 🎾{'\n'}
                      ¿Listo para demostrar que eres el mejor en la cancha? 🏆{'\n\n'}
                      ⚡ *Categoría*: {selectedCategory}{'\n'}
                      📅 *Fecha*: Sábado 24 y Domingo 25{'\n'}
                      📍 *Sede*: Urban Padel Club{'\n\n'}
                      💰 *Inscripción*: S/ 100 por persona{'\n\n'}
                      🏆 *PREMIOS*{'\n'}
                      🥇 *1ER PUESTO*{'\n'}
                      • S/ 1000 en efectivo 💸{'\n'}
                      • 2 Palas Siux Diablo 🦇{'\n\n'}
                      🥈 *2DO PUESTO*{'\n'}
                      • S/ 300 en efectivo 💸{'\n'}
                      • 2 Indumentarias Completas 👕{'\n\n'}
                      💥 Cupos limitados. ¡Asegura tu lugar respondiendo este mensaje! 👇
                    </>
                  )}
                  {selectedTemplate === 'cupos' && (
                    <>
                      🚨 *ACTUALIZACIÓN DE CUPOS - {selectedCategory}* 🚨{'\n'}
                      La Copa Aniversario Urban se está llenando rápido. ¡No te quedes fuera!{'\n\n'}
                      *Inscritos Confirmados:* ✅{'\n'}
                      1. L. Cornejo / M. Santos{'\n'}
                      2. C. Ruiz / F. Torres{'\n'}
                      3. J. Perez / R. Gomez{'\n'}
                      4. D. Blanco / S. Ramos{'\n'}
                      5. A. Silva / P. Costa{'\n'}
                      6. H. Medina / G. Cruz{'\n\n'}
                      ⚠️ *¡SOLO QUEDAN 2 CUPOS!* ⚠️{'\n'}
                      Escríbenos al privado para separar tu cupo con Yape/Plin.
                    </>
                  )}
                  {selectedTemplate === 'fixture' && (
                    <>
                      🔥 *FIXTURE OFICIAL - {selectedCategory}* 🔥{'\n'}
                      Todo listo para la Fase de Grupos. Por favor llegar 15 min antes de su partido.{'\n\n'}
                      📊 *GRUPO A*{'\n'}
                      • L. Cornejo / M. Santos{'\n'}
                      • J. Perez / R. Gomez{'\n'}
                      • A. Silva / P. Costa{'\n'}
                      🕒 *Primer partido*: Sábado 09:00 AM (Cancha 1){'\n\n'}
                      📊 *GRUPO B*{'\n'}
                      • C. Ruiz / F. Torres{'\n'}
                      • D. Blanco / S. Ramos{'\n'}
                      • H. Medina / G. Cruz{'\n'}
                      🕒 *Primer partido*: Sábado 10:30 AM (Cancha 2){'\n\n'}
                      ¡Mucho éxito a todos! 🎾💥
                    </>
                  )}
                  {selectedTemplate === 'cobro' && (
                    <>
                      Hola 👋! Te escribimos de la organización de la *Copa Aniversario Urban*.{'\n\n'}
                      Vemos que tu pre-inscripción en la categoría *{selectedCategory}* está registrada, pero aún tenemos tu pago como *Pendiente*. ⏱️{'\n\n'}
                      Para asegurar tu lugar en el cuadro y no ceder el cupo a la lista de espera, por favor envíanos la captura de tu Yape/Plin (S/ 100 por persona) a este número lo antes posible.{'\n\n'}
                      ¡Nos vemos en la cancha! 🎾
                    </>
                  )}
                  <div className="text-[10px] text-slate-400 text-right mt-1">10:45 AM</div>
                </div>

                <div className="mt-auto pt-6 flex justify-end">
                  <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <Copy className="w-5 h-5" /> Copiar Mensaje
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
