import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy, Calendar, Users, ChevronRight } from 'lucide-react';
import { useTournaments } from '../../context/TournamentContext';
import AmericanoDetailView from './AmericanoDetailView';

export default function AmericanosManagerView() {
  const { activeTournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | 'new' | null>(null);

  if (selectedTournament !== null) {
    return (
      <AmericanoDetailView 
        tournamentId={selectedTournament} 
        onBack={() => setSelectedTournament(null)} 
        onTournamentCreated={(id) => setSelectedTournament(id)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Gestor de Americanos</h2>
          <p className="text-sm text-slate-400">Gestiona todos los torneos americanos del club.</p>
        </div>
        <button 
          onClick={() => setSelectedTournament('new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Nuevo Americano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTournaments.map(tournament => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedTournament(tournament.id)}
            className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-emerald-400 transition-colors">
                    {tournament.name}
                  </h3>
                  <span className="text-xs text-emerald-500 font-medium tracking-wider uppercase">
                    {tournament.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-4">
              <div className="flex items-center text-sm text-slate-400">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                <span>Formato: <span className="text-white font-medium capitalize">{tournament.format.replace('_', ' ')}</span></span>
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <Users className="w-4 h-4 mr-2 text-slate-500" />
                <span>Canchas: <span className="text-white font-medium">{tournament.courts}</span> | Parejas: <span className="text-white font-medium">{tournament.pairs}</span></span>
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <div className="w-4 h-4 mr-2 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-[10px] text-white">i</span>
                </div>
                <span>Inscritos: <span className="text-white font-medium">{tournament.inscriptions?.length || 0}</span></span>
              </div>
            </div>

            <button className="mt-auto flex items-center justify-between w-full p-2 bg-slate-900/50 rounded-lg text-sm text-slate-300 group-hover:text-white transition-colors">
              <span>Gestionar Torneo</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}

        {activeTournaments.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            <Trophy className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400 text-center mb-4">No hay torneos americanos activos.</p>
            <button 
              onClick={() => setSelectedTournament('new')}
              className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-medium hover:bg-emerald-500/20 transition-colors"
            >
              Crear tu primer Americano
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
