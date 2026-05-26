import { motion } from 'framer-motion';
import { Trophy, Users, Shuffle, ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../lib/animations';

interface AmericanoSectionProps {
  onNavigateLive?: () => void;
  onNavigateAdmin?: () => void;
}

export default function AmericanoSection({ onNavigateAdmin }: AmericanoSectionProps) {
  return (
    <section id="americano" className="py-24 px-6 bg-[#060c19] relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-14 flex flex-col items-center text-center gap-4"
        >
          <div className="flex items-center gap-3 text-blue-400 font-semibold tracking-[0.2em] uppercase text-sm mb-2">
            <Trophy className="w-5 h-5" />
            Torneos Automáticos
          </div>
          <h2 className="text-[36px] md:text-[48px] font-bold text-white tracking-tight">
            Nuestros Formatos
          </h2>
          <p className="text-slate-400 font-light max-w-xl text-[17px]">
            La plataforma soporta 3 formatos de juego diferentes, para que organices torneos según el nivel y tipo de competencia que prefieras.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {/* Card Americano */}
          <motion.div variants={staggerItem} className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Americano</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Inscripciones por parejas fijas. Juegan todos contra todos en fase de grupos y los mejores pasan a las llaves eliminatorias directas. Ideal para competencias de alto nivel.
            </p>
            <ul className="text-xs font-bold text-slate-500 uppercase tracking-widest flex flex-col gap-2">
              <li>• Parejas Fijas</li>
              <li>• Fase de Grupos</li>
              <li>• Eliminatorias (Brackets)</li>
            </ul>
          </motion.div>

          {/* Card Mexicano */}
          <motion.div variants={staggerItem} className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Mexicano</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              El famoso "Rey de Cancha" con sistema de ascensos y descensos. Cada cancha tiene 2 parejas. El ganador del set sube a la mejor cancha, y el perdedor baja de cancha.
            </p>
            <ul className="text-xs font-bold text-slate-500 uppercase tracking-widest flex flex-col gap-2">
              <li>• Parejas Fijas</li>
              <li>• Sin eliminatorias</li>
              <li>• Subidas y Bajadas</li>
            </ul>
          </motion.div>

          {/* Card Romano */}
          <motion.div variants={staggerItem} className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl hover:border-purple-500/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shuffle className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Romano</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Inscripciones individuales. El sistema toma a todos los jugadores y los empareja al azar para formar las parejas, luego se juega como el torneo Americano estándar.
            </p>
            <ul className="text-xs font-bold text-slate-500 uppercase tracking-widest flex flex-col gap-2">
              <li>• Inscripción Individual</li>
              <li>• Emparejamiento Aleatorio</li>
              <li>• Fase de Grupos + Brackets</li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center gap-4"
        >
          {onNavigateAdmin && (
            <motion.button
              onClick={onNavigateAdmin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold tracking-widest uppercase shadow-lg shadow-blue-900/20 transition-all"
            >
              Acceder al panel de administrador
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button 
            onClick={onNavigateAdmin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative overflow-hidden group px-6 py-3 mt-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative text-slate-400 group-hover:text-blue-400 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center gap-2">
              Prueba la función
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
