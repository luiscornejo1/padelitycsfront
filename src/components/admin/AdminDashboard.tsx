import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, LayoutDashboard, Wallet, LogOut, Search, Bell, Menu, X, PackageOpen } from 'lucide-react';

import AmericanosManagerView from './AmericanosManagerView';
import MicPadelLeagueView from './MicPadelLeagueView';
import AcademyMatrixView from './AcademyMatrixView';
import MajorTournamentView from './MajorTournamentView';
import InventoryPOSView from './InventoryPOSView';
import PadelCashAdminView from './PadelCashAdminView';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CalendarDays, Crown } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

export default function AdminDashboard({ onNavigateHome }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'gestor_americanos' | 'mic_padel_league' | 'academy' | 'major_tournaments' | 'padel_cash_payments'>('overview');
  const [selectedClub, setSelectedClub] = useState<'urban' | 'xpadel'>('urban');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [totalRevenue] = useLocalStorage<number>('padel_total_revenue', 0);

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'inventory', label: 'Caja e Inventario', icon: PackageOpen },
    { id: 'padel_cash_payments', label: 'Padel-Cash (Pagos)', icon: Wallet },
    { id: 'gestor_americanos', label: 'Gestor de Americanos', icon: Trophy },
    { id: 'mic_padel_league', label: 'Mic Padel League', icon: Trophy },
    { id: 'major_tournaments', label: 'Torneos Mayores', icon: Crown },
    { id: 'academy', label: 'Control Academia', icon: CalendarDays },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-800 text-brand-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A101D] border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
        <div className="h-[72px] flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Trophy className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase">Admin Panel</span>
          </div>
        </div>

        <div className="p-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block px-2">
            Seleccionar Sede
          </label>
          <select 
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value as 'urban' | 'xpadel')}
            className="w-full bg-slate-900 border border-slate-700 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="urban">Urban Padel Hub (4 Canchas)</option>
            <option value="xpadel">X Padel (3 Canchas)</option>
          </select>
        </div>

        <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-brand-gray hover:text-brand-dark hover:bg-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-gray hover:text-brand-dark hover:bg-white/50 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Salir al inicio
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#0A101D] border-r border-slate-800 z-[999] flex flex-col md:hidden shadow-2xl"
            >
              <div className="h-[72px] flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="font-bold text-sm tracking-widest uppercase">Admin Panel</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-brand-gray hover:text-brand-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 shrink-0">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block px-2">
                  Seleccionar Sede
                </label>
                <select 
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value as 'urban' | 'xpadel')}
                  className="w-full bg-slate-900 border border-slate-700 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="urban">Urban Padel Hub (4 Canchas)</option>
                  <option value="xpadel">X Padel (3 Canchas)</option>
                </select>
              </div>

              <nav className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                        ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                        : 'text-brand-gray hover:text-brand-dark hover:bg-white/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 shrink-0">
                <button 
                  onClick={() => {
                    onNavigateHome();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-gray hover:text-brand-dark hover:bg-white/50 transition-all w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Salir al inicio
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-[72px] bg-[#0A101D]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-brand-gray hover:text-brand-dark md:hidden focus:outline-none"
              title="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-md md:text-xl font-bold truncate">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-brand-gray absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-slate-900 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-sm outline-none focus:border-emerald-500 transition-colors w-40 md:w-64"
              />
            </div>
            <button className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-brand-gray hover:text-brand-dark transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 md:p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                    <span className="text-brand-gray text-sm font-semibold">Ingresos Reales (Mes)</span>
                    <h3 className="text-3xl font-bold text-brand-dark mt-2">S/ {totalRevenue.toFixed(2)}</h3>
                    <span className="text-emerald-400 text-xs font-bold">Generado desde Caja</span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                    <span className="text-brand-gray text-sm font-semibold">Torneos Activos</span>
                    <h3 className="text-3xl font-bold text-brand-dark mt-2">2</h3>
                    <span className="text-brand-green text-xs font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" /> En curso
                    </span>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                    <span className="text-brand-gray text-sm font-semibold">Canchas Disponibles</span>
                    <h3 className="text-3xl font-bold text-brand-dark mt-2">
                      {selectedClub === 'urban' ? '4/4' : '3/3'}
                    </h3>
                    <span className="text-slate-500 text-xs font-bold">100% operatividad</span>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-center">
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Bienvenido al Panel de {selectedClub === 'urban' ? 'Urban Padel Hub' : 'X Padel'}</h3>
                  <p className="text-brand-gray text-sm max-w-md mx-auto">
                    Desde aquí puedes gestionar todas las inscripciones pagadas, armar los fixtures de tus americanos, y controlar la fase de grupos en vivo.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <InventoryPOSView />
              </motion.div>
            )}

            {activeTab === 'gestor_americanos' && (
              <motion.div
                key="gestor_americanos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AmericanosManagerView />
              </motion.div>
            )}

            {activeTab === 'mic_padel_league' && (
              <motion.div
                key="mic_padel_league"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MicPadelLeagueView />
              </motion.div>
            )}

            {activeTab === 'major_tournaments' && (
              <motion.div
                key="major_tournaments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MajorTournamentView />
              </motion.div>
            )}

            {activeTab === 'academy' && (
              <motion.div
                key="academy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AcademyMatrixView />
              </motion.div>
            )}

            {activeTab === 'padel_cash_payments' && (
              <motion.div
                key="padel_cash_payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 md:p-8"
              >
                <PadelCashAdminView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
