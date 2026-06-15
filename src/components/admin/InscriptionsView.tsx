import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Users, AlertCircle, Plus, User, Trash2, UserPlus } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Inscription {
  id: string;
  p1Name: string;
  p2Name: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'reserved';
}

const MOCK_INSCRIPTIONS: Inscription[] = [
  { id: 'INS-001', p1Name: 'Carlos Mendoza', p2Name: 'Luis Silva', category: '3ra', date: 'Hace 10 min', status: 'pending' },
  { id: 'INS-002', p1Name: 'Ana Ruiz', p2Name: 'María Torres', category: '4ta', date: 'Hace 25 min', status: 'pending' },
  { id: 'INS-003', p1Name: 'Jorge Vega', p2Name: 'Fernando Ríos', category: '2da', date: 'Hace 2 horas', status: 'approved' },
];

export default function InscriptionsView() {
  const [inscriptions, setInscriptions] = useLocalStorage<Inscription[]>('americano-inscriptions-v2', MOCK_INSCRIPTIONS);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newInscription, setNewInscription] = useState({ p1Name: '', p2Name: '', category: '4ta' });
  const [hasPaid, setHasPaid] = useState(false);
  
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [newPartnerName, setNewPartnerName] = useState<string>('');

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInscription.p1Name) return;

    const newItem: Inscription = {
      id: `INS-${Date.now()}`,
      p1Name: newInscription.p1Name,
      p2Name: newInscription.p2Name.trim() || '',
      category: newInscription.category,
      date: 'Justo ahora',
      status: hasPaid ? 'approved' : 'pending'
    };

    setInscriptions(prev => [newItem, ...prev]);
    setIsAddingNew(false);
    setNewInscription({ p1Name: '', p2Name: '', category: '4ta' });
    setHasPaid(false);
  };

  const togglePaymentStatus = (id: string, currentStatus: string) => {
    setInscriptions(prev => prev.map(ins => {
      if (ins.id === id) {
        return { ...ins, status: currentStatus === 'approved' ? 'pending' : 'approved' };
      }
      return ins;
    }));
  };

  const handleDelete = (id: string) => {
    setInscriptions(prev => prev.filter(ins => ins.id !== id));
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !editingPartnerId) return;
    
    setInscriptions(prev => prev.map(ins => {
      if (ins.id === editingPartnerId) {
        return {
          ...ins,
          p2Name: newPartnerName.trim(),
          status: 'pending' // Al agregar pareja, se marca como deuda para que lo revisen
        };
      }
      return ins;
    }));
    
    setEditingPartnerId(null);
    setNewPartnerName('');
  };

  const pendingCount = inscriptions.filter(i => i.status === 'pending').length;
  const confirmedPairsCount = inscriptions.filter(i => i.status === 'approved' && i.p2Name.trim() !== '').length;

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          Lista de Jugadores
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> {confirmedPairsCount} Parejas Confirmadas
          </span>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {pendingCount} con Deuda
            </span>
          )}
        </h2>
        <button 
          onClick={() => setIsAddingNew(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Pareja/Jugador
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {inscriptions.map((ins) => (
            <motion.div 
              key={ins.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F172A] border border-slate-800/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-5 min-w-[250px]">
                <div className="w-12 h-12 rounded-xl bg-[#0B1120] flex items-center justify-center shadow-inner border border-slate-800/50 group-hover:border-slate-700 transition-colors">
                  {ins.p2Name ? <Users className="w-5 h-5 text-slate-400" /> : <User className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">{ins.p1Name}</span>
                  {ins.p2Name ? (
                    <span className="text-base font-bold text-white">{ins.p2Name}</span>
                  ) : (
                    <span className="text-xs font-semibold text-yellow-500 italic mt-0.5 flex items-center gap-1">
                      Buscando pareja...
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">{ins.date}</span>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-12 w-full md:w-auto">
                <div className="flex flex-col md:items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Categoría</span>
                  <span className="text-sm font-black bg-[#0B1120] text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800/50">
                    {ins.category}
                  </span>
                </div>

                <div className="flex flex-col md:items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Estado</span>
                  {ins.status === 'pending' || ins.status === 'reserved' ? (
                    <span className="text-orange-400 text-xs font-bold bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Debe
                    </span>
                  ) : (
                    <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Check className="w-3.5 h-3.5" /> Pagado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-800/50 md:border-none">
                <button 
                  onClick={() => togglePaymentStatus(ins.id, ins.status)}
                  className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${
                    ins.status === 'approved' 
                    ? 'bg-[#0B1120] text-slate-400 hover:text-white border border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/50' 
                    : 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-500 border border-emerald-500/20 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  }`}
                  title={ins.status === 'approved' ? "Marcar como deuda" : "Marcar como pagado"}
                >
                  {ins.status === 'approved' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {ins.status === 'approved' ? "Desmarcar" : "Cobrar"}
                </button>

                {!ins.p2Name && (
                  <button 
                    onClick={() => {
                      setEditingPartnerId(ins.id);
                      setNewPartnerName('');
                    }}
                    className="p-2.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.1)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    title="Agregar Pareja"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}

                <button 
                  onClick={() => handleDelete(ins.id)}
                  className="p-2.5 bg-[#0B1120] border border-slate-800/50 text-slate-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 rounded-xl transition-all"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Add New Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1120] border border-slate-800/30 p-6 rounded-3xl w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nuevo Registro</h3>
              <button 
                onClick={() => setIsAddingNew(false)}
                className="p-2 bg-[#0B1120] text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNew} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jugador 1</label>
                <input 
                  type="text" 
                  required
                  value={newInscription.p1Name}
                  onChange={e => setNewInscription({...newInscription, p1Name: e.target.value})}
                  className="bg-slate-950 border border-slate-800/30 text-white px-4 py-3 rounded-xl focus:border-brand-green outline-none transition-colors" 
                  placeholder="Nombre principal"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jugador 2 (Pareja)</label>
                <input 
                  type="text" 
                  value={newInscription.p2Name}
                  onChange={e => setNewInscription({...newInscription, p2Name: e.target.value})}
                  className="bg-slate-950 border border-slate-800/30 text-white px-4 py-3 rounded-xl focus:border-brand-green outline-none transition-colors" 
                  placeholder="Dejar vacío si busca pareja"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría</label>
                <select 
                  value={newInscription.category}
                  onChange={e => setNewInscription({...newInscription, category: e.target.value})}
                  className="bg-slate-950 border border-slate-800/30 text-white px-4 py-3 rounded-xl focus:border-brand-green outline-none transition-colors"
                >
                  <option value="2da">2da Categoría</option>
                  <option value="3ra">3ra Categoría</option>
                  <option value="4ta">4ta Categoría</option>
                  <option value="5ta">5ta Categoría</option>
                  <option value="6ta">6ta Categoría</option>
                </select>
              </div>
              
              <div className="mt-2 bg-[#0B1120]/80 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between cursor-pointer hover:bg-[#0B1120] transition-colors" onClick={() => setHasPaid(!hasPaid)}>
                <span className="text-sm font-bold text-white">¿Ya pagaron la inscripción?</span>
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${hasPaid ? 'bg-emerald-500 border-emerald-500' : 'bg-[#0B1120] border-slate-600'}`}>
                  {hasPaid && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-brand-dark hover:bg-brand-green text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
              >
                Agregar a la Lista
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: Agregar Pareja */}
      <AnimatePresence>
        {editingPartnerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B1120] border border-slate-800/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingPartnerId(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-[#0B1120]/80 hover:bg-[#0B1120] rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Agregar Pareja
              </h3>

              <form onSubmit={handleAddPartner} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre del Jugador 2</label>
                  <input 
                    type="text" 
                    value={newPartnerName}
                    onChange={e => setNewPartnerName(e.target.value)}
                    className="bg-slate-950 border border-slate-800/30 text-white px-4 py-3 rounded-xl focus:border-indigo-500 outline-none transition-colors" 
                    placeholder="Ej: Martín Silva"
                    required
                    autoFocus
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Confirmar Pareja
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
