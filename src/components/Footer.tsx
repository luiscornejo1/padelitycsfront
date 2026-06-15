import { Trophy, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../lib/animations';

interface FooterProps {
  onNavigateHome: () => void;
}

export default function Footer({ onNavigateHome }: FooterProps) {
  return (
    <footer className="bg-brand-cream text-brand-dark py-20 px-6 border-t border-brand-border">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-4 gap-12"
        >
          {/* Brand */}
          <div className="space-y-5 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-dark flex items-center justify-center shadow-lg shadow-brand-dark/20">
                <Trophy className="w-[18px] h-[18px] text-brand-dark" />
              </div>
              <span className="font-bold text-[20px] tracking-tight text-brand-dark">Padelitycs</span>
            </div>
            <p className="text-slate-500 text-[14px] max-w-sm leading-relaxed font-light">
              El sistema oficial de clasificación para jugadores de pádel. Sube de categoría y demuestra tu verdadero
              nivel en la pista.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-semibold text-[14px] mb-2 text-brand-dark">Navegación</h4>
            <a
              href="#rankings"
              onClick={onNavigateHome}
              className="text-slate-500 hover:text-brand-dark transition-colors text-[14px] w-fit font-light"
            >
              Ver Rankings
            </a>
            <a href="#noticias" className="text-slate-500 hover:text-brand-dark transition-colors text-[14px] w-fit font-light">
              Noticias
            </a>
            <a href="#" className="text-slate-500 hover:text-brand-dark transition-colors text-[14px] w-fit font-light">
              Reglamento ELO
            </a>
            <a href="#" className="text-slate-500 hover:text-brand-dark transition-colors text-[14px] w-fit font-light">
              Términos y Privacidad
            </a>
          </div>

          {/* Contact */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-semibold text-[14px] mb-2 text-brand-dark">Contacto</h4>
            <a
              href="mailto:contacto@padelitycs.com"
              className="flex items-center gap-3 text-slate-500 hover:text-brand-dark transition-colors text-[14px] w-fit font-light"
            >
              <Mail className="w-4 h-4" />
              contacto@padelitycs.com
            </a>
            <a
              href="tel:+51999999999"
              className="flex items-center gap-3 text-slate-500 hover:text-brand-dark transition-colors text-[14px] w-fit font-light"
            >
              <Phone className="w-4 h-4" />
              +51 999 999 999
            </a>
            <a
              href="https://instagram.com/padelitycs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-slate-500 hover:text-brand-dark transition-colors text-[14px] w-fit font-light"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              @padelitycs
            </a>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-600 font-light">
            © {new Date().getFullYear()} Padelitycs. Todos los derechos reservados.
          </p>
          <p className="text-[13px] text-slate-600 font-light">Diseñado para la excelencia en la pista.</p>
        </div>
      </div>
    </footer>
  );
}
