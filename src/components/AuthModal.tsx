import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, Mail, Phone, Eye, EyeOff, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthView = 'main' | 'email-login' | 'email-register' | 'phone' | 'phone-otp';

interface AuthModalProps {
  onClose?: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithPhone, verifyOtp } = useAuth();

  const [view, setView] = useState<AuthView>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const clearMessages = () => { setError(null); setSuccessMsg(null); };

  const handleGoogle = async () => {
    clearMessages();
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) setError(error);
    else onClose?.();
    setIsLoading(false);
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const { error } = await signUpWithEmail(email, password, fullName);
    if (error) setError(error);
    else setSuccessMsg('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
    setIsLoading(false);
  };

  const handlePhoneSend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+51${phone}`;
    const { error } = await signInWithPhone(formattedPhone);
    if (error) setError(error);
    else setView('phone-otp');
    setIsLoading(false);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+51${phone}`;
    const { error } = await verifyOtp(formattedPhone, otp);
    if (error) setError(error);
    else onClose?.();
    setIsLoading(false);
  };

  const inputClass = `w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3.5 text-sm
    text-white font-medium outline-none transition-all
    focus:border-emerald-500/60 focus:bg-slate-800 placeholder:text-slate-500`;

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative">
      <button 
        onClick={onClose}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 font-semibold text-sm transition-colors z-50"
      >
        ← Volver a la página principal
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700
            flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PADELITYCS</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Tu plataforma de pádel en Trujillo</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-8 shadow-2xl">
          <AnimatePresence mode="wait">

            {/* ── MAIN VIEW ── */}
            {view === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-lg font-black text-white mb-2">Iniciar sesión</h2>

                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6
                    bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-2xl
                    transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-5 h-5 text-blue-500" />}
                  Continuar con Google
                </button>

                {/* Email */}
                <button
                  onClick={() => { clearMessages(); setView('email-login'); }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6
                    bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60
                    text-white font-bold text-sm rounded-2xl transition-all"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  Continuar con Email
                </button>

                {/* SMS */}
                <button
                  onClick={() => { clearMessages(); setView('phone'); }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6
                    bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60
                    text-white font-bold text-sm rounded-2xl transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Continuar con SMS (Celular)
                </button>

                <div className="text-center mt-2">
                  <p className="text-[11px] text-slate-500">
                    Al continuar, aceptas nuestros términos y política de privacidad.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── EMAIL LOGIN ── */}
            {view === 'email-login' && (
              <motion.div
                key="email-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setView('main')} className="text-slate-500 hover:text-white text-sm">← Atrás</button>
                  <h2 className="text-lg font-black text-white">Accede con Email</h2>
                </div>

                <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                  <input type="email" placeholder="correo@ejemplo.com" value={email}
                    onChange={e => setEmail(e.target.value)} className={inputClass} required />
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className={`${inputClass} pr-12`} required />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600
                      hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm
                      rounded-2xl flex items-center justify-center gap-2 transition-all
                      shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] disabled:opacity-60">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Ingresar <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <button onClick={() => { clearMessages(); setView('email-register'); }}
                  className="text-center text-sm text-emerald-400 hover:text-emerald-300 font-semibold">
                  ¿No tienes cuenta? Regístrate →
                </button>
              </motion.div>
            )}

            {/* ── EMAIL REGISTER ── */}
            {view === 'email-register' && (
              <motion.div
                key="email-register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setView('email-login')} className="text-slate-500 hover:text-white text-sm">← Atrás</button>
                  <h2 className="text-lg font-black text-white">Crear cuenta</h2>
                </div>

                {successMsg ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm font-medium text-center">
                    {successMsg}
                  </div>
                ) : (
                  <form onSubmit={handleEmailRegister} className="flex flex-col gap-3">
                    <input type="text" placeholder="Tu nombre completo" value={fullName}
                      onChange={e => setFullName(e.target.value)} className={inputClass} required />
                    <input type="email" placeholder="correo@ejemplo.com" value={email}
                      onChange={e => setEmail(e.target.value)} className={inputClass} required />
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña (mín. 6 caracteres)"
                        value={password} onChange={e => setPassword(e.target.value)}
                        className={`${inputClass} pr-12`} required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

                    <button type="submit" disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600
                        hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm
                        rounded-2xl flex items-center justify-center gap-2 transition-all
                        shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] disabled:opacity-60">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Crear cuenta <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* ── PHONE ── */}
            {view === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setView('main')} className="text-slate-500 hover:text-white text-sm">← Atrás</button>
                  <h2 className="text-lg font-black text-white">Tu número de celular</h2>
                </div>

                <form onSubmit={handlePhoneSend} className="flex flex-col gap-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">+51</span>
                    <input type="tel" placeholder="999 888 777" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      className={`${inputClass} pl-14`} required maxLength={9} />
                  </div>
                  <p className="text-[11px] text-slate-500">Recibirás un código SMS en tu celular peruano.</p>

                  {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

                  <button type="submit" disabled={isLoading || phone.length < 9}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600
                      hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm
                      rounded-2xl flex items-center justify-center gap-2 transition-all
                      shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] disabled:opacity-60">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Phone className="w-4 h-4" /> Enviar código</>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── OTP ── */}
            {view === 'phone-otp' && (
              <motion.div
                key="phone-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setView('phone')} className="text-slate-500 hover:text-white text-sm">← Atrás</button>
                  <h2 className="text-lg font-black text-white">Código de verificación</h2>
                </div>
                <p className="text-sm text-slate-400">Ingresa el código que te enviamos al <span className="text-white font-bold">+51 {phone}</span></p>

                <form onSubmit={handleOtpVerify} className="flex flex-col gap-3">
                  <input type="text" placeholder="123456" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`}
                    maxLength={6} required />

                  {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

                  <button type="submit" disabled={isLoading || otp.length < 6}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600
                      hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm
                      rounded-2xl flex items-center justify-center gap-2 transition-all
                      shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] disabled:opacity-60">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verificar <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
