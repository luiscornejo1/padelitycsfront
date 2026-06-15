import { ChevronRight, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp } from '../lib/animations';
import { NEWS_MOCK } from '../data/mockData';

export default function NewsSection() {
  return (
    <section id="noticias" className="py-24 px-6 bg-transparent">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-14 flex flex-col items-center text-center gap-4"
        >
          <h2 className="text-[36px] md:text-[48px] font-bold text-white tracking-tight">Muro de la Fama</h2>
          <p className="text-white/40 font-light max-w-xl text-[18px]">
            Últimas noticias, resultados de torneos y ascensos destacados en la comunidad.
          </p>
        </motion.div>

        {/* News Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {NEWS_MOCK.map((news) => (
            <motion.article
              variants={staggerItem}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              key={news.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 border border-brand-border rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 group cursor-pointer flex flex-col hover:shadow-xl hover:shadow-brand-green-hover/10"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                
              </div>

              {/* Body */}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-brand-green uppercase tracking-[0.12em]">{news.date}</span>
                  <span className="text-[10px] uppercase font-bold tracking-[0.15em] border border-slate-700 text-white/40 px-2.5 py-1 rounded-md">
                    Noticia
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-white mb-3 leading-snug group-hover:text-white transition-colors">
                  {news.title}
                </h3>
                <p className="text-white/40 text-[14px] mb-6 line-clamp-3 flex-1 leading-relaxed font-light">
                  {news.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-brand-border/60">
                  <button className="text-white font-semibold flex items-center gap-2 text-[14px] opacity-70 group-hover:opacity-100 transition-opacity">
                    Leer más <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="text-slate-600 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
