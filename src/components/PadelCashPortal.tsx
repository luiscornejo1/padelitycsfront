import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Award, Gift, ArrowRight, Upload, CheckCircle2, 
  XCircle, Clock, Check, Sparkles 
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import type { YapeBookingDetails } from '../types/padelCashTypes';

export default function PadelCashPortal() {
  const { 
    currentPadelUser, 
    yapePayments, 
    submitYapePayment, 
    claimPointsCoupon,
    cancelPaidBooking,
    padelCashUsers,
    setCurrentPadelUserById
  } = useTournaments();

  const [activeTab, setActiveTab] = useState<'profile' | 'reserve' | 'history'>('profile');
  const [selectedCourt, setSelectedCourt] = useState('Cancha 1 (Panorámica)');
  const [selectedDate, setSelectedDate] = useState('2026-06-17');
  const [selectedTime, setSelectedTime] = useState('19:00 - 20:30');
  const [useCouponCode, setUseCouponCode] = useState('');
  const [yapeFileMock, setYapeFileMock] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeCouponValue, setActiveCouponValue] = useState(0);

  if (!currentPadelUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Clock className="w-12 h-12 mb-4 animate-spin text-emerald-500" />
        <p className="font-semibold text-lg">Cargando Portal Padel-Cash...</p>
      </div>
    );
  }

  // Precios base
  const BASE_PRICE = 80; // Costo por 90 minutos de juego
  const ANTICIPATED_DISCOUNT = 0.10; // 10% descuento por pago anticipado

  // Descuento por nivel
  const getLevelDiscount = (level: 'bronce' | 'plata' | 'oro') => {
    if (level === 'oro') return 0.10; // 10%
    if (level === 'plata') return 0.05; // 5%
    return 0;
  };

  const levelDiscount = getLevelDiscount(currentPadelUser.level);
  
  // Cálculo de precio descontado final
  const priceAnticipated = BASE_PRICE * (1 - ANTICIPATED_DISCOUNT);
  const priceFinal = priceAnticipated * (1 - levelDiscount) - activeCouponValue;
  const finalPriceCapped = Math.max(0, priceFinal);

  // Niveles Config
  const levelInfo = {
    bronce: { 
      label: 'Bronce', 
      color: 'from-amber-700 to-amber-900 border-amber-500/30 text-amber-300', 
      nextLimit: 10,
      discountText: '0% Adicional'
    },
    plata: { 
      label: 'Plata', 
      color: 'from-slate-500 to-slate-800 border-slate-400/30 text-slate-200', 
      nextLimit: 25,
      discountText: '5% Adicional'
    },
    oro: { 
      label: 'Oro', 
      color: 'from-yellow-500 to-amber-600 border-yellow-400/30 text-yellow-100', 
      nextLimit: 999,
      discountText: '10% Adicional'
    }
  };

  const currentLevelConfig = levelInfo[currentPadelUser.level];
  const progressPercent = Math.min(100, (currentPadelUser.completedReservationsCount / currentLevelConfig.nextLimit) * 100);

  // Simulación de comprobante de Yape generado al instante
  const handleGenerateDemoReceipt = () => {
    const operation = Math.floor(100000 + Math.random() * 900000);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Yape Purple/Green Background
      const grad = ctx.createLinearGradient(0, 0, 0, 800);
      grad.addColorStop(0, '#1f1635');
      grad.addColorStop(0.5, '#733792');
      grad.addColorStop(1, '#00d3aa');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 800);

      // Card Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(40, 150, 320, 500, 24);
      ctx.fill();

      // Check Icon
      ctx.fillStyle = '#00d3aa';
      ctx.beginPath();
      ctx.arc(200, 220, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText('✓', 185, 233);

      // Receipt info
      ctx.fillStyle = '#1f1635';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('¡Yapeaste!', 200, 300);

      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`S/ ${finalPriceCapped.toFixed(2)}`, 200, 360);

      ctx.fillStyle = '#666666';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Para: PADELITYCS CLUB`, 200, 410);
      ctx.fillText(`Fecha: ${new Date().toLocaleDateString()}`, 200, 440);
      ctx.fillText(`Operación: ${operation}`, 200, 470);

      ctx.fillStyle = '#733792';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Cliente: ${currentPadelUser.name}`, 200, 520);
    }
    const dataUrl = canvas.toDataURL();
    setYapeFileMock(dataUrl);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yapeFileMock) return;

    const details: YapeBookingDetails = {
      court: selectedCourt,
      date: selectedDate,
      time: selectedTime,
      originalPrice: BASE_PRICE,
      discountedPrice: finalPriceCapped
    };

    submitYapePayment(currentPadelUser.id, details, yapeFileMock);
    
    // Si se aplicó un cupón, marcarlo como usado localmente en el submit
    if (useCouponCode) {
      currentPadelUser.coupons = currentPadelUser.coupons.map(c => 
        c.code === useCouponCode ? { ...c, isUsed: true } : c
      );
    }

    setBookingSuccess(true);
    setYapeFileMock(null);
    setUseCouponCode('');
    setActiveCouponValue(0);

    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab('history');
    }, 2500);
  };

  const applyCoupon = (code: string) => {
    const coupon = currentPadelUser.coupons.find(c => c.code === code && !c.isUsed);
    if (coupon) {
      setUseCouponCode(code);
      setActiveCouponValue(coupon.value);
    } else {
      alert('Cupón no válido o ya utilizado.');
    }
  };

  // Filtrar pagos de Yape correspondientes al usuario actual
  const userPayments = yapePayments.filter(p => p.userId === currentPadelUser.id);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-[100px] pb-12">
      {/* Selector de Sesión de Usuario (Para simulación del Demo) */}
      <div className="mb-6 p-4 bg-slate-900/60 border border-slate-700/50 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-400">Simulación del Socio Activo:</span>
        </div>
        <div className="flex items-center gap-3">
          {padelCashUsers.map(u => (
            <button
              key={u.id}
              onClick={() => setCurrentPadelUserById(u.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPadelUser.id === u.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {u.name} ({u.level.toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center relative z-10 shadow-xl shadow-black/50">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Portal Padel-Cash</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Tus reservas prepagadas, recompensas y estatus VIP en un solo lugar.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 gap-8 mb-8 relative">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 text-sm font-bold tracking-wider uppercase transition-all duration-300 relative flex items-center gap-2 ${
            activeTab === 'profile' ? 'text-emerald-400 font-black' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          Mi Fidelidad
          {activeTab === 'profile' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('reserve')}
          className={`pb-4 text-sm font-bold tracking-wider uppercase transition-all duration-300 relative flex items-center gap-2 ${
            activeTab === 'reserve' ? 'text-emerald-400 font-black' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Reservar & Yapear
          {activeTab === 'reserve' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-sm font-bold tracking-wider uppercase transition-all duration-300 relative flex items-center gap-2 ${
            activeTab === 'history' ? 'text-emerald-400 font-black' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          Mis Comprobantes
          {userPayments.filter(p => p.status === 'pending').length > 0 && (
            <span className="absolute top-0 right-[-12px] w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
          {activeTab === 'history' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Fidelidad Card */}
            <div className={`p-6 rounded-3xl bg-gradient-to-br ${currentLevelConfig.color} border flex flex-col gap-6 shadow-2xl relative overflow-hidden`}>
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
              
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-75">Socio del Club</span>
                  <span className="text-xl font-bold text-white mt-1">{currentPadelUser.name}</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-end justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-75">Nivel actual</span>
                  <span className="text-3xl font-black mt-1 uppercase tracking-tight">{currentLevelConfig.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-75">Descuento Permanente</span>
                  <p className="text-lg font-black">{currentLevelConfig.discountText}</p>
                </div>
              </div>

              {currentPadelUser.level !== 'oro' && (
                <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Progreso al siguiente nivel ({currentPadelUser.level === 'bronce' ? 'Plata' : 'Oro'})</span>
                    <span>{currentPadelUser.completedReservationsCount} / {currentLevelConfig.nextLimit} reservas</span>
                  </div>
                  <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progressPercent}%` }} 
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-white rounded-full" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Puntos y Recompensas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Puntos box */}
              <div className="p-8 rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Saldo de Puntos</h3>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{currentPadelUser.points}</span>
                    <span className="text-sm text-slate-500 font-black tracking-widest">PTS</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 font-medium leading-relaxed">Ganas <strong className="text-emerald-400">10 puntos</strong> por cada reserva pagada anticipadamente.</p>
                </div>
                <button
                  disabled={currentPadelUser.points < 100}
                  onClick={() => claimPointsCoupon(currentPadelUser.id)}
                  className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    currentPadelUser.points >= 100
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  Canjear Cupón de S/ 50 (100 PTS)
                </button>
              </div>

              {/* Cupones box */}
              <div className="p-8 rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 flex flex-col gap-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Mis Cupones</h3>
                </div>
                
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                  {currentPadelUser.coupons.filter(c => !c.isUsed).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-6 border border-dashed border-slate-700/50 rounded-2xl bg-slate-900/50">
                      <Gift className="w-8 h-8 mb-3 text-slate-700" />
                      <p className="text-xs font-medium">No tienes cupones disponibles.</p>
                      <span className="text-[10px] mt-1 text-slate-600">Canjea tus puntos para obtener uno.</span>
                    </div>
                  ) : (
                    currentPadelUser.coupons.filter(c => !c.isUsed).map(c => (
                      <div 
                        key={c.code}
                        className="p-4 bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors rounded-xl flex items-center justify-between relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
                        <div className="flex flex-col pl-2">
                          <span className="text-sm font-black tracking-widest text-emerald-400">{c.code}</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">
                            {c.type === 'credit_virtual' ? 'Crédito Virtual' : 'Descuento Yape'}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-75 text-slate-500">Valor</span>
                          <span className="text-lg font-black text-white mt-0.5">S/ {c.value}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reserve' && (
          <motion.div
            key="reserve-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-6"
          >
            {/* Formulario */}
            <form onSubmit={handleBookingSubmit} className="md:col-span-3 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] flex flex-col gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Simulador de Reserva
                </h3>
                
                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seleccionar Cancha</label>
                  <select 
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm font-semibold text-white outline-none focus:border-emerald-500/50 focus:bg-slate-800 transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    <option>Cancha 1 (Panorámica)</option>
                    <option>Cancha 2 (Vidrio)</option>
                    <option>Cancha 3 (Estándar)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm font-semibold text-white outline-none focus:border-emerald-500/50 focus:bg-slate-800 transition-all cursor-pointer" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Horario</label>
                    <select 
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm font-semibold text-white outline-none focus:border-emerald-500/50 focus:bg-slate-800 transition-all cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option>17:30 - 19:00</option>
                      <option>19:00 - 20:30</option>
                      <option>20:30 - 22:00</option>
                    </select>
                  </div>
                </div>

                {/* Cupones disponibles */}
                {currentPadelUser.coupons.filter(c => !c.isUsed).length > 0 && (
                  <div className="flex flex-col gap-2 mb-6">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aplicar Cupón</label>
                    <div className="flex gap-3">
                      <select
                        value={useCouponCode}
                        onChange={(e) => applyCoupon(e.target.value)}
                        className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm font-semibold text-emerald-400 outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2310B981%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                      >
                        <option value="" className="text-slate-400">Selecciona un cupón...</option>
                        {currentPadelUser.coupons.filter(c => !c.isUsed).map(c => (
                          <option key={c.code} value={c.code}>
                            {c.code} (S/ {c.value})
                          </option>
                        ))}
                      </select>
                      {useCouponCode && (
                        <button 
                          type="button"
                          onClick={() => {
                            setUseCouponCode('');
                            setActiveCouponValue(0);
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 rounded-xl text-xs font-bold transition-all"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Subir Comprobante Ficticio */}
                <div className="flex flex-col gap-2 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprobante Yape (Simulado)</label>
                  {!yapeFileMock ? (
                    <button
                      type="button"
                      onClick={handleGenerateDemoReceipt}
                      className="w-full border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white mb-1">Haz clic para generar comprobante</p>
                        <p className="text-xs text-slate-500">Monto: S/ {finalPriceCapped.toFixed(2)}</p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <div>
                          <p className="text-sm font-bold text-white">Comprobante adjuntado</p>
                          <p className="text-xs text-emerald-400 font-medium">yape_receipt.jpg</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setYapeFileMock(null)}
                        className="text-slate-400 hover:text-white transition-colors p-2"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!yapeFileMock}
                  className={`w-full mt-8 py-4 rounded-xl text-sm font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2 ${
                    yapeFileMock 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] hover:-translate-y-0.5' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  Confirmar y Subir Reserva
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Resumen Sidebar */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="p-8 rounded-[2rem] bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-800 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-sm font-black text-white tracking-widest uppercase mb-6 flex items-center justify-between">
                  Resumen
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-[10px]">+10 PTS</span>
                </h3>
                
                <div className="flex flex-col gap-4 text-sm font-medium">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Precio Regular (90m)</span>
                    <span className="font-semibold">S/ {BASE_PRICE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Abono Adelantado (Yape)</span>
                    <span className="font-semibold">-10%</span>
                  </div>
                  {levelDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>Descuento {currentLevelConfig.label}</span>
                      <span className="font-semibold">-{(levelDiscount * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {activeCouponValue > 0 && (
                    <div className="flex justify-between items-center text-amber-400">
                      <span>Cupón de Descuento</span>
                      <span className="font-semibold">- S/ {activeCouponValue.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="h-px bg-slate-700 w-full my-2" />
                  
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 font-bold tracking-wider uppercase text-xs">Total a Pagar</span>
                    <span className="text-3xl font-black text-white">S/ {finalPriceCapped.toFixed(2)}</span>
                  </div>
                </div>

                <AnimatePresence>
                  {bookingSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex flex-col items-center justify-center text-center gap-2"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <p className="text-sm font-bold text-emerald-100">¡Reserva enviada con éxito!</p>
                      <p className="text-[10px] text-emerald-400/80">Validación del admin en proceso...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info Instructions */}
              <div className="p-6 bg-[#1f1635]/25 border border-purple-500/10 rounded-3xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Instrucciones de Pago
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  1. Escanea el código QR de Yape del club en mostrador (o transfiere al celular <strong>998 776 554</strong>).<br />
                  2. Monto a pagar: <strong>S/ {finalPriceCapped.toFixed(2)}</strong>.<br />
                  3. Toma una captura y súbela en el formulario.<br />
                  4. ¡Ganas <strong>10 PTS</strong> y subes en el ranking al validarse!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase">Mis Comprobantes Subidos</h3>

            {userPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-3xl text-slate-500">
                <Clock className="w-10 h-10 mb-2 text-slate-700" />
                <p className="text-xs">No has realizado pagos por Yape aún.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {userPayments.map(p => (
                  <div 
                    key={p.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-bold text-xs text-slate-300">
                        {p.id}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{p.bookingDetails.court}</span>
                        <span className="text-[10px] text-slate-400">{p.bookingDetails.date} @ {p.bookingDetails.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-white">S/ {p.bookingDetails.discountedPrice.toFixed(2)}</span>
                        <span className="text-[9px] text-slate-500 line-through">S/ {p.bookingDetails.originalPrice.toFixed(2)}</span>
                      </div>

                      {/* Status badge */}
                      {p.status === 'pending' && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Pendiente
                        </span>
                      )}
                      {p.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                          </span>
                          <button
                            onClick={() => cancelPaidBooking(p.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-1 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      {p.status === 'rejected' && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Rechazado
                          </span>
                          {p.rejectionReason && (
                            <span className="text-[9px] text-red-300/80 max-w-[150px] text-right">
                              Motivo: {p.rejectionReason}
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
    </div>
  );
}
