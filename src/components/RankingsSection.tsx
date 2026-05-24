import { Trophy, ChevronRight, TrendingUp, TrendingDown, Minus, User, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp } from '../lib/animations';
import type { Gender, Category, Player } from '../data/mockData';
import { CATEGORIES, MOCK_DATA } from '../data/mockData';

interface RankingsSectionProps {
  gender: Gender;
  setGender: (g: Gender) => void;
  view: 'overview' | 'detail';
  setView: (v: 'overview' | 'detail') => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  onStartOnboarding: () => void;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-400" />;
  return <Minus className="w-3.5 h-3.5 text-white/50" />;
};

export default function RankingsSection({
  gender,
  setGender,
  view,
  setView,
  selectedCategory,
  setSelectedCategory,
  onStartOnboarding,
}: RankingsSectionProps) {
  const currentData = MOCK_DATA[gender];

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setView('detail');
    document.getElementById('rankings')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="rankings" className="relative py-24 px-6 min-h-[800px] overflow-hidden">
      {/* Cinematic Court Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top Half Green */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#4B6D5B]" />
        {/* Bottom Half Red */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#AC3C38]" />
        
        {/* White T Lines */}
        {/* Horizontal Service Line */}
        <div className="absolute top-1/2 left-0 right-0 h-3 bg-white/70 shadow-[0_0_15px_rgba(255,255,255,0.4)] -translate-y-1/2" />
        {/* Vertical Center Line */}
        <div className="absolute top-1/2 bottom-0 left-1/2 w-3 bg-white/70 shadow-[0_0_15px_rgba(255,255,255,0.4)] -translate-x-1/2" />

        {/* Darkening Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          {view === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <h2 className="text-[36px] md:text-[48px] font-bold text-white mb-2 tracking-tight drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Clasificación General
                  </h2>
                  <p className="text-white/70 font-light text-[18px]">Los mejores jugadores de la ciudad</p>
                </motion.div>

                {/* Gender Toggle */}
                <div className="inline-flex bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10">
                  {(['Masculino', 'Femenino'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`relative px-7 py-2.5 rounded-lg text-[14px] font-bold tracking-[0.1em] uppercase transition-colors duration-300 ${
                        gender === g ? 'text-white' : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      {gender === g && (
                        <motion.div
                          layoutId="genderPill"
                          className="absolute inset-0 bg-[#4B6D5B] rounded-lg shadow-lg"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10">{g}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Cards Grid */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {CATEGORIES.map((cat) => {
                  const top5 = currentData[cat].slice(0, 5);
                  return (
                    <motion.div
                      key={cat}
                      variants={staggerItem}
                      whileHover={{ y: -4, transition: { duration: 0.3 } }}
                      className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-[#4B6D5B]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4B6D5B]/20"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#4B6D5B]/20 flex items-center justify-center border border-[#4B6D5B]/40">
                            <Trophy className="w-4 h-4 text-[#4B6D5B]" />
                          </div>
                          <h3 className="text-[16px] font-bold text-white tracking-wide">{cat} Categoría</h3>
                        </div>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em]">Top 5</span>
                      </div>

                      {/* Players List */}
                      <div className="p-5">
                        <ul className="space-y-4">
                          {top5.map((player, index) => (
                            <li key={player.id} className="flex items-center gap-3 group cursor-default">
                              <span
                                className={`text-[13px] font-bold w-5 text-center ${
                                  index === 0
                                    ? 'text-[#AC3C38]'
                                    : index === 1
                                    ? 'text-[#4B6D5B]'
                                    : 'text-white/40'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="flex-1 text-white/80 font-medium text-[14px] truncate group-hover:text-white transition-colors">
                                {player.name}
                              </span>
                              <span className="text-[14px] font-bold text-white mr-1">{player.elo}</span>
                              <TrendIcon trend={player.trend} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 pb-5">
                        <button
                          onClick={() => handleSelectCategory(cat)}
                          className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#4B6D5B] text-white/70 hover:text-white text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-[#4B6D5B] hover:shadow-lg hover:shadow-[#4B6D5B]/30"
                        >
                          Ver ranking completo
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          ) : (
            /* DETAIL VIEW */
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-10 flex items-center gap-5">
                <button
                  onClick={() => setView('overview')}
                  className="p-3 bg-black/50 backdrop-blur-md border border-white/10 hover:bg-[#4B6D5B] hover:border-[#4B6D5B] text-white/70 hover:text-white rounded-xl transition-all duration-300 shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-[36px] font-bold text-white tracking-tight flex items-center gap-4 drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {selectedCategory} Categoría
                    <span className="text-[11px] font-bold tracking-[0.1em] text-white px-3 py-1.5 border border-white/20 rounded-lg bg-black/40 uppercase">
                      {gender}
                    </span>
                  </h2>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-black/40 text-white/50 text-[11px] uppercase tracking-[0.12em] border-b border-white/10">
                        <th className="p-5 font-bold w-20 text-center">Pos</th>
                        <th className="p-5 font-bold">Jugador</th>
                        <th className="p-5 font-bold text-right">ELO</th>
                        <th className="p-5 font-bold text-right">Win Rate</th>
                        <th className="p-5 font-bold text-right">Partidos</th>
                        <th className="p-5 font-bold text-center">Lado</th>
                        <th className="p-5 font-bold">Mejor Golpe</th>
                        <th className="p-5 font-bold text-center">Contacto</th>
                        <th className="p-5 font-bold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentData[selectedCategory as Category]?.map((player: Player, index: number) => (
                        <tr key={player.id} className="hover:bg-white/5 transition-colors duration-200 group">
                          <td className="p-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {index < 3 ? (
                                <span
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-[13px] ${
                                    index === 0
                                      ? 'bg-[#AC3C38] text-white shadow-lg shadow-[#AC3C38]/40'
                                      : index === 1
                                      ? 'bg-[#4B6D5B] text-white shadow-lg shadow-[#4B6D5B]/40'
                                      : 'bg-black/50 text-white/70 border border-white/20'
                                  }`}
                                >
                                  {index + 1}
                                </span>
                              ) : (
                                <span className="text-white/40 font-bold text-[14px]">{index + 1}</span>
                              )}
                              <TrendIcon trend={player.trend} />
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                <User className="w-4 h-4 text-white/50 group-hover:text-[#4B6D5B] transition-colors" />
                              </div>
                              <span className="font-bold text-white/90 group-hover:text-white transition-colors tracking-wide">
                                {player.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <span className="font-bold text-white text-[17px]">{player.elo}</span>
                          </td>
                          <td className="p-5 text-right">
                            <span
                              className={`text-[12px] font-bold px-2.5 py-1 rounded-md tracking-wider ${
                                player.winRate >= 70
                                  ? 'text-[#4B6D5B] bg-[#4B6D5B]/10 border border-[#4B6D5B]/20'
                                  : player.winRate >= 55
                                  ? 'text-white/70 bg-white/5 border border-white/10'
                                  : 'text-white/40 bg-black/30'
                              }`}
                            >
                              {player.winRate}%
                            </span>
                          </td>
                          <td className="p-5 text-right text-white/60 font-medium text-[14px]">
                            {player.matches}
                          </td>
                          <td className="p-5 text-center text-white/70 text-[14px] font-medium">{player.side}</td>
                          <td className="p-5 text-white/70 text-[14px]">{player.bestShot}</td>
                          <td className="p-5 text-center">
                            <a
                              href={`https://wa.me/51999999999?text=${encodeURIComponent(
                                `Hola ${player.name}, te vi en Padelitycs y me gustaría invitarte a jugar un partido!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#4B6D5B]/10 text-[#4B6D5B] hover:bg-[#4B6D5B] hover:text-white transition-all duration-300 border border-[#4B6D5B]/20"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </td>
                          <td className="p-5">
                            <button
                              onClick={onStartOnboarding}
                              className="text-[10px] font-bold text-white/70 hover:text-white hover:bg-[#AC3C38] px-4 py-2 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20 hover:border-[#AC3C38] uppercase tracking-[0.1em]"
                            >
                              Reclamar
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
        </AnimatePresence>
      </div>
    </section>
  );
}
