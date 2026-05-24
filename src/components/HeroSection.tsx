import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../lib/animations';

interface HeroSectionProps {
  onStartOnboarding: () => void;
}

export default function HeroSection({ onStartOnboarding }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays on mount
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://images.unsplash.com/photo-1622279457486-640c43431653?q=80&w=1920&auto=format&fit=crop"
      >
        <source
          src="https://videos.pexels.com/video-files/6253791/6253791-uhd_2560_1440_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Cinematic Overlay */}
      <div className="absolute inset-0 bg-black/55 z-[1]" />
      {/* Bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent z-[1]" />

      {/* Social Icons - Left Side */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-5">
        {[
          { href: 'https://tiktok.com/@padelitycs', icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .55.04.81.1v-3.53a6.27 6.27 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.17a8.22 8.22 0 0 0 4.76 1.5V7.23a4.85 4.85 0 0 1-1-.54Z"/></svg>
          )},
          { href: 'https://youtube.com/@padelitycs', icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.68 31.68 0 0 0 0 12a31.68 31.68 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.85.55 9.38.55 9.38.55s7.53 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.68 31.68 0 0 0 24 12a31.68 31.68 0 0 0-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z"/></svg>
          )},
          { href: 'https://instagram.com/padelitycs', icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          )},
          { href: 'https://facebook.com/padelitycs', icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          )},
        ].map((social, i) => (
          <a
            key={i}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-300"
          >
            {social.icon}
          </a>
        ))}
      </div>

      {/* Center Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-[72px] md:text-[110px] lg:text-[140px] font-black text-white leading-[0.9] tracking-tight uppercase"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          PADEL
          <br />
          ITYCS
        </motion.h1>

        <motion.div variants={fadeInUp} className="mt-10">
          <motion.button
            onClick={onStartOnboarding}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-12 py-4 border-2 border-white/80 text-white text-[13px] font-bold tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all duration-500"
          >
            RECLAMAR MI PERFIL
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8">
        <div className="container mx-auto max-w-7xl flex items-end justify-between">
          {/* Left - Next Event */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-5 py-4 hidden md:block"
          >
            <div className="flex items-center gap-8 text-[12px] text-white/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-white/40" />
                <span className="font-medium">Próximo torneo:</span>
              </div>
              <a href="#" className="text-white/60 hover:text-white font-medium transition-colors flex items-center gap-1">
                Saber más <span className="text-[10px]">↗</span>
              </a>
            </div>
            <p className="text-white font-bold text-[15px] tracking-wide mt-1 uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
              Torneo Trujillo Abierto
            </p>
            <p className="text-white/50 text-[12px] mt-0.5">15/07/2026 — 20/07/2026</p>
          </motion.div>

          {/* Right - Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-white/90 text-[13px] md:text-[15px] font-bold tracking-[0.15em] uppercase text-right max-w-xs leading-relaxed hidden md:block"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            EL RANKING OFICIAL
            <br />
            DE PÁDEL EN TRUJILLO
          </motion.p>
        </div>
      </div>
    </section>
  );
}
