import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { fadeInUp } from '../../lib/animations';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigateHome }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      // Very basic mock validation
      if (email && password) {
        onLoginSuccess();
      } else {
        setError('Por favor, ingresa correo y contraseña.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-dark/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header/Logo */}
      <div className="p-8 relative z-10">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center bg-slate-800 group-hover:border-slate-600 transition-colors">
            <Trophy className="w-4 h-4 text-brand-gray group-hover:text-brand-dark transition-colors" />
          </div>
          <span className="text-[10px] font-bold text-brand-gray tracking-[0.3em] uppercase group-hover:text-brand-dark transition-colors">
            Volver al inicio
          </span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="w-full max-w-md"
        >
          <div className="bg-[#0A101D]/80 backdrop-blur-xl border border-brand-border rounded-3xl p-8 shadow-2xl shadow-black/50">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-brand-dark mb-2">Acceso a Clubes</h1>
              <p className="text-sm text-brand-gray text-center">
                Ingresa tus credenciales de organizador para gestionar tus torneos e inscripciones.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@club.com"
                    className="w-full bg-slate-800/50 border border-brand-border-strong rounded-xl py-3 pl-11 pr-4 text-brand-dark placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between pl-1 pr-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Contraseña
                  </label>
                  <a href="#" className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-brand-border-strong rounded-xl py-3 pl-11 pr-4 text-brand-dark placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-xs font-semibold bg-red-500/10 px-4 py-2 rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-brand-dark font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Ingresar al Panel
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-brand-border text-center">
              <p className="text-xs text-slate-500">
                ¿Aún no tienes cuenta para tu club?{' '}
                <a href="#" className="text-emerald-400 hover:text-emerald-300 font-bold">
                  Contacta a soporte
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
