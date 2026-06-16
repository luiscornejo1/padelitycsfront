import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import PlayerTvSelector from './components/PlayerTvSelector';
import PadelCashPortal from './components/PadelCashPortal';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, isLoading } = useAuth();

  const getInitialView = (): 'overview' | 'detail' | 'americanos-live' | 'player-tv' | 'admin-login' | 'admin-dashboard' | 'padel-cash' => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'player-tv') return 'player-tv';
    return 'overview';
  };

  const [gender, setGender] = useState<Gender>('Masculino');
  const [view, setView] = useState(getInitialView);
  const [initialTournamentId] = useState<string | null>(() => new URLSearchParams(window.location.search).get('id'));
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleStartOnboarding = () => { setShowOnboarding(true); };
  const handleCloseOnboarding = () => { setShowOnboarding(false); };

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

  const handleNavigatePlayerTv = () => {
    setView('player-tv');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigatePadelCash = () => {
    setView('padel-cash');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setView('admin-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rankingView = view;
  const isDashboard = view === 'admin-dashboard' || view === 'admin-login' || view === 'player-tv';

  // Muestra pantalla de carga mientras Supabase determina la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Cargando Padelitycs...</p>
        </div>
      </div>
    );
  }

  // Si el usuario intenta entrar a Padel-Cash sin sesión, mostramos el login
  if (view === 'padel-cash' && !user) {
    return <AuthModal onClose={() => { /* user will be set after auth */ }} />;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
      {!isDashboard && (
        <Navbar
          onNavigateHome={handleNavigateHome}
          onStartOnboarding={handleStartOnboarding}
          onNavigateAmericanosLive={handleNavigateAmericanosLive}
          onNavigateAdmin={handleNavigateAdmin}
          onNavigatePadelCash={handleNavigatePadelCash}
        />
      )}

      {/* MODAL DE ONBOARDING FLOTANTE */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060c19]/90 backdrop-blur-md"
              onClick={handleCloseOnboarding}
            />
            <div className="relative z-10 w-full max-w-xl">
              <OnboardingWizard
                onComplete={handleCloseOnboarding}
                onCancel={handleCloseOnboarding}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <main>
        {view === 'padel-cash' ? (
          <PadelCashPortal />
        ) : view === 'americanos-live' ? (
          <AmericanoLiveView />
        ) : view === 'player-tv' ? (
          <PlayerTvSelector onNavigateHome={handleNavigateHome} initialTournamentId={initialTournamentId} />
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
              setView={(v) => setView(v as any)}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onStartOnboarding={handleStartOnboarding}
            />
            <AmericanoSection
              onNavigateLive={handleNavigateAmericanosLive}
              onNavigateAdmin={handleNavigateAdmin}
              onNavigatePlayerTv={handleNavigatePlayerTv}
            />
            <NewsSection />
          </>
        )}
      </main>

      {!isDashboard && <Footer onNavigateHome={handleNavigateHome} />}
    </div>
  );
}
