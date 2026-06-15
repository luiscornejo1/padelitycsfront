import { motion } from 'framer-motion';
import { ArrowRight, Tv } from 'lucide-react';
import { staggerContainer, staggerItem } from '../lib/animations';

interface AmericanoSectionProps {
  onNavigateLive?: () => void;
  onNavigateAdmin?: () => void;
  onNavigatePlayerTv?: () => void;
}

const TOURNAMENTS = [
  {
    title: 'ANTWERP',
    dates: '19/08/2026 - 20/08/2026'
  },
  {
    title: 'GHENT',
    dates: '07/07/2026 - 12/07/2026'
  },
  {
    title: 'KNOKKE',
    dates: '08/08/2026 - 08/08/2026'
  },
  {
    title: 'WATERLOO',
    dates: '25/09/2026 - 26/09/2026'
  }
];

export default function AmericanoSection({ onNavigateAdmin, onNavigatePlayerTv }: AmericanoSectionProps) {
  return (
    <section id="americano" className="py-24 bg-transparent relative text-white">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Top Separator with Title */}
        <div className="flex flex-col md:flex-row items-center mb-20 px-6 gap-6">
          <div className="flex items-center flex-1 w-full">
            <div className="flex-1 h-[1px] bg-brand-border"></div>
            <h2 className="px-6 text-[11px] font-bold tracking-widest uppercase text-white whitespace-nowrap">
              PRÓXIMOS AMERICANOS O TORNEOS EN TRUJILLO
            </h2>
            <div className="flex-1 h-[1px] bg-brand-border"></div>
          </div>
          <button 
            onClick={onNavigatePlayerTv}
            className="w-full md:w-auto px-8 py-3 bg-[#E2FF3A] text-black font-black uppercase text-xs tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-[#d4f231] transition-all shadow-[0_0_15px_rgba(226,255,58,0.3)]"
          >
            <Tv className="w-4 h-4" /> Entrar a Padel TV
          </button>
        </div>

        {/* Tournament List */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-col px-6"
        >
          {TOURNAMENTS.map((tournament, index) => (
            <motion.div 
              key={index}
              variants={staggerItem}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between py-10 border-b border-brand-border hover:bg-transparent-dark/30 transition-colors"
            >
              {/* Left Side: Title & Dates */}
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8 mb-6 md:mb-0">
                <h3 className="font-playfair text-4xl md:text-6xl lg:text-[80px] font-semibold tracking-tight text-white uppercase">
                  {tournament.title}
                </h3>
                <span className="text-xs md:text-sm font-semibold tracking-wider text-white mb-1 md:mb-4">
                  {tournament.dates}
                </span>
              </div>

              {/* Right Side: Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button 
                  onClick={onNavigateAdmin}
                  className="w-full sm:w-auto px-8 py-3 text-[10px] font-bold tracking-widest uppercase border border-brand-dark text-white hover:bg-brand-dark hover:text-black transition-colors rounded-sm"
                >
                  INSCRIBIRSE
                </button>
                <button 
                  onClick={onNavigateAdmin}
                  className="w-full sm:w-auto px-8 py-3 text-[10px] font-bold tracking-widest uppercase bg-brand-green text-white hover:bg-brand-green-hover transition-colors rounded-sm border border-brand-green"
                >
                  BUSCAR PARTNER
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
