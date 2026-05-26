import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, Users, AlertCircle } from 'lucide-react';

interface Inscription {
  id: string;
  p1Name: string;
  p2Name: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentRef: string;
}

const MOCK_INSCRIPTIONS: Inscription[] = [
  { id: 'INS-001', p1Name: 'Carlos Mendoza', p2Name: 'Luis Silva', category: '3ra', date: 'Hace 10 min', status: 'pending', paymentRef: 'YAPE-987123' },
  { id: 'INS-002', p1Name: 'Ana Ruiz', p2Name: 'María Torres', category: '4ta', date: 'Hace 25 min', status: 'pending', paymentRef: 'PLIN-456789' },
  { id: 'INS-003', p1Name: 'Jorge Vega', p2Name: 'Fernando Ríos', category: '2da', date: 'Hace 2 horas', status: 'approved', paymentRef: 'YAPE-112233' },
];

export default function InscriptionsView() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>(MOCK_INSCRIPTIONS);
  const [selectedReceipt, setSelectedReceipt] = useState<Inscription | null>(null);

  const handleApprove = (id: string) => {
    setInscriptions(prev => prev.map(ins => ins.id === id ? { ...ins, status: 'approved' } : ins));
    if (selectedReceipt?.id === id) setSelectedReceipt(null);
  };

  const handleReject = (id: string) => {
    setInscriptions(prev => prev.map(ins => ins.id === id ? { ...ins, status: 'rejected' } : ins));
    if (selectedReceipt?.id === id) setSelectedReceipt(null);
  };

  const pendingCount = inscriptions.filter(i => i.status === 'pending').length;

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          Solicitudes de Inscripción
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {pendingCount} Nuevas
            </span>
          )}
        </h2>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase tracking-widest text-slate-400 font-bold">
            <tr>
              <th className="p-4">Pareja</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Pago Ref.</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {inscriptions.map((ins) => (
                <motion.tr 
                  key={ins.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{ins.p1Name}</span>
                        <span className="text-sm font-bold text-white">{ins.p2Name}</span>
                        <span className="text-[10px] text-slate-500">{ins.date}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded">
                      {ins.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-400">
                    {ins.paymentRef}
                  </td>
                  <td className="p-4">
                    {ins.status === 'pending' && <span className="text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded flex items-center gap-1 w-max"><AlertCircle className="w-3 h-3" /> Pendiente</span>}
                    {ins.status === 'approved' && <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1 w-max"><Check className="w-3 h-3" /> Aprobado</span>}
                    {ins.status === 'rejected' && <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded flex items-center gap-1 w-max"><X className="w-3 h-3" /> Rechazado</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedReceipt(ins)}
                        className="p-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors tooltip"
                        title="Ver comprobante"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {ins.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(ins.id)}
                            className="p-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(ins.id)}
                            className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                            title="Rechazar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Modal Comprobante */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={() => setSelectedReceipt(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Comprobante de Pago</h3>
                  <p className="text-sm text-slate-400">Ref: <span className="font-mono text-white">{selectedReceipt.paymentRef}</span></p>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="text-slate-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Fake Yape Receipt */}
              <div className="w-full aspect-[9/16] bg-purple-600 rounded-xl mb-6 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                {selectedReceipt.paymentRef.includes('YAPE') ? (
                  <div className="flex flex-col items-center text-white">
                    <span className="text-5xl font-black mb-2">S/ 60.00</span>
                    <span className="text-sm opacity-80">Pago realizado con éxito</span>
                    <span className="text-xs font-mono opacity-60 mt-4">{selectedReceipt.date}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-white bg-teal-500 w-full h-full justify-center">
                    <span className="text-5xl font-black mb-2">S/ 60.00</span>
                    <span className="text-sm opacity-80">Plin exitoso</span>
                  </div>
                )}
              </div>

              {selectedReceipt.status === 'pending' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleReject(selectedReceipt.id)}
                    className="flex-1 py-3 font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                  >
                    Rechazar
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedReceipt.id)}
                    className="flex-1 py-3 font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Aprobar Inscripción
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
