import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Gender } from './data/mockData';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import RankingsSection from './components/RankingsSection';
import AmericanoSection from './components/AmericanoSection';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import OnboardingWizard from './components/OnboardingWizard';
import AmericanoLiveView from './components/AmericanoLiveView';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';

export default function App() {
  const [gender, setGender] = useState<Gender>('Masculino');
  const [view, setView] = useState<'overview' | 'detail' | 'onboarding' | 'americanos-live' | 'admin-login' | 'admin-dashboard'>('onboarding');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleStartOnboarding = () => {
    setView('onboarding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setView('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAmericanosLive = () => {
    setView('americanos-live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAdmin = () => {
    setView('admin-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setView('admin-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rankingView = view === 'onboarding' ? 'overview' : view;
  const isDashboard = view === 'admin-dashboard' || view === 'admin-login';

  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
      {!isDashboard && (
        <Navbar
          onNavigateHome={handleNavigateHome}
          onStartOnboarding={handleStartOnboarding}
          onNavigateAmericanosLive={handleNavigateAmericanosLive}
          onNavigateAdmin={handleNavigateAdmin}
        />
      )}

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
        ) : view === 'americanos-live' ? (
          <AmericanoLiveView />
        ) : view === 'admin-login' ? (
          <AdminLogin 
            onLoginSuccess={handleLoginSuccess} 
            onNavigateHome={handleNavigateHome} 
          />
        ) : view === 'admin-dashboard' ? (
          <AdminDashboard onNavigateHome={handleNavigateHome} />
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
            <AmericanoSection 
              onNavigateLive={handleNavigateAmericanosLive} 
              onNavigateAdmin={handleNavigateAdmin}
            />
            <NewsSection />
          </>
        )}
      </main>

      {!isDashboard && <Footer onNavigateHome={handleNavigateHome} />}
    </div>
  );
}
