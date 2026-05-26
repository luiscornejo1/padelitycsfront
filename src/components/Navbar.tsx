import { useState } from 'react';
import { Trophy, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onNavigateHome: () => void;
  onStartOnboarding: () => void;
  onNavigateAmericanosLive: () => void;
  onNavigateAdmin?: () => void;
}

export default function Navbar({ onNavigateHome, onStartOnboarding, onNavigateAmericanosLive, onNavigateAdmin }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Left tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden lg:block text-[11px] font-bold text-white/70 tracking-[0.2em] uppercase"
        >
          PÁDEL EN TRUJILLO.
        </motion.p>

        {/* Center Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer group"
          onClick={onNavigateHome}
        >
          <div className="w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center group-hover:border-white transition-colors duration-300">
            <Trophy className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
          </div>
          <span
            className="text-[10px] font-bold text-white/60 tracking-[0.3em] uppercase group-hover:text-white transition-colors duration-300"
          >
            PADELITYCS
          </span>
        </motion.div>

        {/* Right nav */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex items-center gap-6"
        >
          <a
            href="#rankings"
            className="text-[11px] font-bold text-white/70 tracking-[0.15em] uppercase hover:text-white transition-colors duration-300"
          >
            Rankings
          </a>
          <a
            href="#noticias"
            className="text-[11px] font-bold text-white/70 tracking-[0.15em] uppercase hover:text-white transition-colors duration-300"
          >
            Noticias
          </a>
          <button
            onClick={onNavigateAmericanosLive}
            className="text-[11px] font-bold text-blue-400 tracking-[0.15em] uppercase hover:text-blue-300 transition-colors duration-300 flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            En Vivo
          </button>
          {onNavigateAdmin && (
            <button
              onClick={onNavigateAdmin}
              className="text-[11px] font-bold text-emerald-400 tracking-[0.15em] uppercase hover:text-emerald-300 transition-colors duration-300"
            >
              Soy Organizador
            </button>
          )}
          <button
            onClick={onStartOnboarding}
            className="text-[11px] font-bold text-white/70 tracking-[0.15em] uppercase hover:text-white transition-colors duration-300"
          >
            Registro
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[11px] font-bold text-white/70 tracking-[0.15em] uppercase hover:text-white transition-colors duration-300 ml-2"
          >
            MENÚ
          </button>
        </motion.nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile / Full Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 top-[72px] h-[calc(100vh-72px)] bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-y-auto"
          >
            <div className="px-6 py-8 space-y-5 text-center">
              <a
                href="#rankings"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white/80 hover:text-white font-bold text-[13px] tracking-[0.2em] uppercase py-2 transition-colors"
              >
                Rankings
              </a>
              <a
                href="#noticias"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white/80 hover:text-white font-bold text-[13px] tracking-[0.2em] uppercase py-2 transition-colors"
              >
                Noticias
              </a>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onNavigateAmericanosLive();
                }}
                className="block w-full text-blue-400 hover:text-blue-300 font-bold text-[13px] tracking-[0.2em] uppercase py-2 transition-colors flex justify-center items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Torneos en Vivo
              </button>
              {onNavigateAdmin && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateAdmin();
                  }}
                  className="block w-full text-emerald-400 hover:text-emerald-300 font-bold text-[13px] tracking-[0.2em] uppercase py-2 transition-colors"
                >
                  Soy Organizador
                </button>
              )}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onStartOnboarding();
                }}
                className="w-full border-2 border-white/60 text-white px-6 py-3 font-bold text-[13px] tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                Reclamar Perfil
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
