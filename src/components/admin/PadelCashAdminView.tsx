import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Eye, ChevronRight,
  Search, History 
} from 'lucide-react';
import { useTournaments } from '../../context/TournamentContext';
import type { YapePaymentRequest, PadelCashUser } from '../../types/padelCashTypes';

export default function PadelCashAdminView() {
  const { 
    yapePayments, 
    padelCashUsers, 
    approveYapePayment, 
    rejectYapePayment
  } = useTournaments();

  const [activeTab, setActiveTab] = useState<'queue' | 'users' | 'history'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<YapePaymentRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null); // paymentId
  const [rejectionReason, setRejectionReason] = useState('');
  const [pointsAdjustUser, setPointsAdjustUser] = useState<PadelCashUser | null>(null);
  const [pointsAdjustValue, setPointsAdjustValue] = useState(10);

  // Filtrados
  const pendingPayments = yapePayments.filter(p => p.status === 'pending');
  const processedPayments = yapePayments.filter(p => p.status !== 'pending');
  
  const filteredUsers = padelCashUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery)
  );

  const handleApprove = (id: string) => {
    approveYapePayment(id);
    if (selectedPayment?.id === id) {
      setSelectedPayment(null);
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectDialog || !rejectionReason.trim()) return;

    rejectYapePayment(showRejectDialog, rejectionReason.trim());
    
    if (selectedPayment?.id === showRejectDialog) {
      setSelectedPayment(null);
    }
    
    setShowRejectDialog(null);
    setRejectionReason('');
  };

  // Ajustar puntos manualmente en el demo
  const handlePointsAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointsAdjustUser) return;

    pointsAdjustUser.points += pointsAdjustValue;
    // Si incrementa o reduce reservas, recalcular nivel para el demo
    localStorage.setItem('padelitycs_cash_users', JSON.stringify(padelCashUsers));
    setPointsAdjustUser(null);
  };

  return (
    <div className="flex flex-col gap-6 relative text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center gap-4">
            Gestor Padel-Cash
            {pendingPayments.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/50 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
                {pendingPayments.length} Pendientes
              </span>
            )}
          </h2>
          <p className="text-sm font-medium text-slate-400 mt-2">Validación de comprobantes Yape, auditoría de balances y cupones virtuales.</p>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-2xl flex gap-1 shadow-xl">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Cola de Pagos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Base de Socios
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {/* Main View Grid */}
      <AnimatePresence mode="wait">
        {activeTab === 'queue' && (
          <motion.div
            key="queue-tab-admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Lista de Pagos Pendientes */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Solicitudes en Espera</h3>

              {pendingPayments.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 bg-slate-900/20">
                  <Check className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                  <p className="font-semibold text-sm">¡Al día! No hay comprobantes pendientes de validación.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingPayments.map(p => (
                    <div 
                      key={p.id}
                      className={`p-4 bg-slate-900 border transition-all rounded-2xl flex items-center justify-between gap-4 cursor-pointer ${
                        selectedPayment?.id === p.id 
                          ? 'border-emerald-500 bg-slate-900/80 shadow-lg' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                      onClick={() => setSelectedPayment(p)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-bold text-xs">
                          {p.id}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white">{p.userName}</span>
                          <span className="text-[10px] text-slate-400">{p.bookingDetails.court}</span>
                          <span className="text-[9px] text-slate-500">{p.bookingDetails.date} @ {p.bookingDetails.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-400">S/ {p.bookingDetails.discountedPrice.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-500 block line-through">S/ {p.bookingDetails.originalPrice.toFixed(2)}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de Detalle / Validación del Yape */}
            <div className="lg:col-span-1">
              <div className="p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] shadow-2xl sticky top-24 flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase border-b border-slate-800/80 pb-4 flex items-center gap-2 relative z-10">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Auditoría Visual
                </h3>

                {selectedPayment ? (
                  <div className="flex flex-col gap-5 relative z-10">
                    {/* Yape Image Preview */}
                    <div className="relative border border-slate-700/50 rounded-2xl overflow-hidden aspect-[4/5] bg-slate-950 flex items-center justify-center p-2 group shadow-inner">
                      <img 
                        src={selectedPayment.screenshotUrl} 
                        alt="Yape Comprobante" 
                        className="max-h-full max-w-full object-contain rounded-xl" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="flex flex-col gap-3 bg-slate-950/60 backdrop-blur-sm p-5 rounded-2xl border border-slate-800/80 shadow-inner">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider">Cliente Emisor</span>
                        <span className="font-black text-white text-sm">{selectedPayment.userName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider">Monto Esperado</span>
                        <span className="font-black text-emerald-400 text-lg">S/ {selectedPayment.bookingDetails.discountedPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider">Operación</span>
                        <span className="font-bold text-slate-300 font-mono tracking-widest">{selectedPayment.id}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <button
                        onClick={() => setShowRejectDialog(selectedPayment.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                        <X className="w-4 h-4" /> Fraude / Error
                      </button>
                      <button
                        onClick={() => handleApprove(selectedPayment.id)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-3.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      >
                        <Check className="w-4 h-4" /> Validar Pago
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center text-slate-500">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300 mb-1">Ningún pago seleccionado</p>
                    <p className="text-xs">Selecciona un pago de la cola para visualizar y validar la captura del Yape.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users-tab-admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Buscador */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl max-w-md">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Buscar socio por nombre o celular..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-white outline-none w-full"
              />
            </div>

            {/* Listado Socios Table */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] overflow-hidden shadow-2xl relative">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Socio</th>
                      <th className="px-8 py-5">Celular</th>
                      <th className="px-8 py-5">Nivel (Histórico)</th>
                      <th className="px-8 py-5 text-center">Reservas Prepago</th>
                      <th className="px-8 py-5 text-right">Saldo Puntos</th>
                      <th className="px-8 py-5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-5 font-bold text-white group-hover:text-emerald-400 transition-colors">{u.name}</td>
                        <td className="px-8 py-5 text-slate-400 font-mono text-[11px]">{u.phone}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                            u.level === 'oro' 
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                              : u.level === 'plata'
                              ? 'bg-slate-400/10 text-slate-300 border-slate-400/25 shadow-[0_0_10px_rgba(148,163,184,0.1)]'
                              : 'bg-amber-700/10 text-amber-500 border-amber-600/25'
                          }`}>
                            {u.level}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center font-bold text-slate-200">{u.completedReservationsCount} reservas</td>
                        <td className="px-8 py-5 text-right font-black text-emerald-400 tracking-wider">{u.points} PTS</td>
                        <td className="px-8 py-5 text-center">
                          <button
                            onClick={() => setPointsAdjustUser(u)}
                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          >
                            Ajustar PTS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history-tab-admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-2">Historial de Validaciones</h3>
            
            {processedPayments.length === 0 ? (
              <div className="p-16 border border-dashed border-slate-800/60 rounded-[2rem] text-center text-slate-500 bg-slate-900/30 backdrop-blur-sm">
                <History className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                <p className="font-bold text-sm text-slate-400">No hay historial de pagos procesados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processedPayments.map(p => (
                  <div 
                    key={p.id}
                    className="p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] flex flex-col gap-4 shadow-xl hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-mono font-bold text-xs text-slate-400 shadow-inner group-hover:text-emerald-400 transition-colors">
                        {p.id.substring(0, 4)}...
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white">{p.userName}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{p.bookingDetails.court} ({p.bookingDetails.date})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-800/80 relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monto Final</span>
                        <span className="text-lg font-black text-white">S/ {p.bookingDetails.discountedPrice.toFixed(2)}</span>
                      </div>

                      {p.status === 'approved' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-4 py-2 rounded-xl tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5">
                          <Check className="w-3 h-3" /> Aprobado
                        </span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black px-4 py-2 rounded-xl tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center gap-1.5">
                            <X className="w-3 h-3" /> Rechazado
                          </span>
                          {p.rejectionReason && (
                            <span className="text-[9px] text-red-400/80 max-w-[160px] text-right mt-1.5 font-medium italic">
                              "{p.rejectionReason}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Rechazo Dialog */}
      <AnimatePresence>
        {showRejectDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectDialog(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-850 p-6 rounded-3xl w-full max-w-md relative z-10"
            >
              <h3 className="text-base font-bold text-white mb-4">Rechazar Comprobante</h3>
              <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Motivo del Rechazo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Imagen borrosa, Monto incorrecto..." 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 text-sm font-semibold text-white outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowRejectDialog(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Ajuste PTS Dialog */}
      <AnimatePresence>
        {pointsAdjustUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setPointsAdjustUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-850 p-6 rounded-3xl w-full max-w-md relative z-10"
            >
              <h3 className="text-base font-bold text-white mb-4">Ajustar Puntos Manualmente</h3>
              <p className="text-xs text-slate-400 mb-4">Socio: <strong className="text-white">{pointsAdjustUser.name}</strong> (Saldo actual: {pointsAdjustUser.points} PTS)</p>
              
              <form onSubmit={handlePointsAdjustSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Modificar puntos por:</label>
                  <input 
                    type="number" 
                    value={pointsAdjustValue}
                    onChange={(e) => setPointsAdjustValue(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 text-sm font-semibold text-white outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[9px] text-slate-500 mt-1">Usa números negativos para restar puntos.</span>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setPointsAdjustUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Aplicar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
