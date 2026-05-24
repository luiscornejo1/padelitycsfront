import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Gender } from './data/mockData';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import RankingsSection from './components/RankingsSection';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import OnboardingWizard from './components/OnboardingWizard';

export default function App() {
  const [gender, setGender] = useState<Gender>('Masculino');
  const [view, setView] = useState<'overview' | 'detail' | 'onboarding'>('overview');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleStartOnboarding = () => {
    setView('onboarding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rankingView = view === 'onboarding' ? 'overview' : view;

  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
      <Navbar
        onNavigateHome={handleNavigateHome}
        onStartOnboarding={handleStartOnboarding}
      />

      <main>
        {view === 'onboarding' ? (
          <div className="pt-28 pb-20 px-6 min-h-[85vh] flex items-center justify-center relative">
            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/8 rounded-full blur-[150px] pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full relative z-10"
            >
              <OnboardingWizard
                onComplete={handleNavigateHome}
                onCancel={handleNavigateHome}
              />
            </motion.div>
          </div>
        ) : (
          <>
            <HeroSection onStartOnboarding={handleStartOnboarding} />
            <RankingsSection
              gender={gender}
              setGender={setGender}
              view={rankingView as 'overview' | 'detail'}
              setView={(v) => setView(v)}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onStartOnboarding={handleStartOnboarding}
            />
            <NewsSection />
          </>
        )}
      </main>

      <Footer onNavigateHome={handleNavigateHome} />
    </div>
  );
}
