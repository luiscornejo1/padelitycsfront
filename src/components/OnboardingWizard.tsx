import { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, SHOTS } from '../data/mockData';

interface OnboardingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<'Drive' | 'Revés'>('Drive');

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-brand-green-hover/10 backdrop-blur-xl relative"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-800">
        <motion.div
          className="h-full bg-brand-green shadow-lg shadow-brand-green/50"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="p-10">
        <button
          onClick={onCancel}
          className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors text-[14px] font-medium"
        >
          Cerrar
        </button>

        <AnimatePresence mode="wait">
          {/* STEP 1: Personal Data */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-[28px] font-bold text-white mb-2 tracking-tight">Tus Datos Personales</h2>
              <p className="text-slate-400 text-[14px] mb-8 font-light">
                Para empezar, necesitamos conocerte un poco más.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Mendoza"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+51 999 999 999"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 175"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Sport Profile */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-[28px] font-bold text-white mb-2 tracking-tight">Perfil Deportivo</h2>
              <p className="text-slate-400 text-[14px] mb-8 font-light">
                Cuéntanos sobre tu estilo de juego en la pista.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                      Género
                    </label>
                    <select className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white focus:border-brand-green focus:outline-none appearance-none cursor-pointer">
                      <option>Masculino</option>
                      <option>Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                      Categoría
                    </label>
                    <select className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white focus:border-brand-green focus:outline-none appearance-none cursor-pointer">
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                      Posición
                    </label>
                    <div className="flex gap-2">
                      {(['Drive', 'Revés'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setPosition(pos)}
                          className={`flex-1 py-4 rounded-xl font-semibold text-[14px] transition-all duration-300 border ${
                            position === pos
                              ? 'bg-brand-green text-white border-brand-green shadow-lg shadow-brand-green/30'
                              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                      Mejor Golpe
                    </label>
                    <select className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white focus:border-brand-green focus:outline-none appearance-none cursor-pointer">
                      {SHOTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Evidence */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-[28px] font-bold text-white mb-2 tracking-tight">Verifica tu Nivel</h2>
              <p className="text-slate-400 text-[14px] mb-8 font-light">
                Sube una prueba de tu categoría para validación oficial (ej: Trofeo, ranking anterior).
              </p>

              <div className="border-2 border-dashed border-slate-700 hover:border-brand-green/60 transition-colors duration-300 bg-slate-800/30 rounded-2xl p-14 flex flex-col items-center justify-center text-center cursor-pointer group">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:border-brand-green/50 group-hover:scale-110 transition-all duration-300">
                  <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-brand-green transition-colors" />
                </div>
                <h3 className="text-white font-semibold text-[16px] mb-2">Haz clic para subir imagen</h3>
                <p className="text-slate-500 text-[13px] tracking-wide">PNG, JPG hasta 5MB</p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-brand-green/15 border border-brand-green/30 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-green/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-[28px] font-bold text-white mb-4 tracking-tight">¡Solicitud Enviada!</h2>
              <p className="text-slate-400 max-w-sm mx-auto mb-10 font-light leading-relaxed">
                Tus datos y evidencia están en revisión. Un administrador validará tu ELO inicial muy pronto.
              </p>
              <button
                onClick={onComplete}
                className="w-full bg-brand-green hover:bg-brand-green text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-brand-green/30"
              >
                Volver al Inicio
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex gap-4 mt-10 pt-8 border-t border-slate-800">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-4 font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Atrás
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex-1 bg-brand-green hover:bg-brand-green text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-brand-green/30"
            >
              {step === 3 ? 'Finalizar Registro' : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
