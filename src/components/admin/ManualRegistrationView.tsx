import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Trash2, Trophy, Medal } from 'lucide-react';
import type { Category } from '../../data/mockData';
import { useTournaments } from '../../context/TournamentContext';

const CATEGORIES: Category[] = ['1era', '2da', '3ra', '4ta', '5ta', '6ta'];

interface ManualRegistrationViewProps {
  isEmbedded?: boolean;
}

export default function ManualRegistrationView({ isEmbedded }: ManualRegistrationViewProps) {
  const { registeredPairs, registerPair, deletePair, registeredPlayers, registerPlayer, deletePlayer } = useTournaments();
  const [mode, setMode] = useState<'pairs' | 'players'>('pairs');
  
  // Pairs state
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  
  // Players state
  const [playerName, setPlayerName] = useState('');
  
  const [category, setCategory] = useState<Category>('3ra');

  const handleRegisterPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1Name || !p2Name) return;
    registerPair(p1Name, p2Name, category);
    setP1Name('');
    setP2Name('');
  };

  const handleRegisterPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName) return;
    registerPlayer(playerName, category);
    setPlayerName('');
  };

  const handleDelete = (id: string, isPair: boolean) => {
    if (isPair) deletePair(id);
    else deletePlayer(id);
  };

  return (
    <div className={`flex flex-col xl:flex-row gap-8 relative ${isEmbedded ? 'p-0 pt-4' : 'p-8'}`}>
      
      {/* Formulario de Registro */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-emerald-400" />
          Nuevo Registro
        </h2>
        
        {/* Toggle Mode */}
        <div className="flex bg-[#0F172A] p-1.5 rounded-2xl w-full border border-slate-800/30">
          <button
            onClick={() => setMode('pairs')}
            className={`flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all rounded-xl ${
              mode === 'pairs' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            Parejas Fijas
          </button>
          <button
            onClick={() => setMode('players')}
            className={`flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all rounded-xl ${
              mode === 'players' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            Individuos (Romano)
          </button>
        </div>

        <form onSubmit={mode === 'pairs' ? handleRegisterPair : handleRegisterPlayer} className="bg-[#0F172A] border border-slate-800/30 rounded-3xl p-6 flex flex-col gap-5">
          <p className="text-sm text-slate-400 mb-2">
            {mode === 'pairs' 
              ? 'Añade manualmente parejas que hayan pagado en efectivo o sean invitados especiales.'
              : 'Añade jugadores individuales para formatos aleatorios como Romano.'}
          </p>

          {mode === 'pairs' ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Jugador 1
                </label>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  placeholder="Nombre y Apellido"
                  required
                  className="w-full bg-[#070D1A] border border-slate-700/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/70 focus:shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.15)] transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Jugador 2
                </label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  placeholder="Nombre y Apellido"
                  required
                  className="w-full bg-[#070D1A] border border-slate-700/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/70 focus:shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.15)] transition-all"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                Jugador Individual
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nombre y Apellido"
                required
                className="w-full bg-[#0B1120] border border-slate-800/50 shadow-inner focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] focus:border-emerald-500/50 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
              Categoría
            </label>
            <div className="relative">
              <Medal className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-[#070D1A] border border-slate-700/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] rounded-xl py-3 pl-11 pr-4 text-white appearance-none focus:outline-none focus:border-emerald-500/70 focus:shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.15)] transition-all"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c} Categoría</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 group"
          >
            <UserPlus className="w-5 h-5" />
            {mode === 'pairs' ? 'Inscribir Pareja' : 'Inscribir Jugador'}
          </button>
        </form>
      </div>

      {/* Lista de Registrados */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {mode === 'pairs' ? 'Parejas Manuales' : 'Jugadores Manuales'}
            <span className="bg-[#0B1120] text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
              {mode === 'pairs' ? registeredPairs.length : registeredPlayers.length} Totales
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {(mode === 'pairs' ? registeredPairs.length : registeredPlayers.length) === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500 bg-[#0F172A] rounded-2xl border border-slate-800/20">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p>Aún no hay {mode === 'pairs' ? 'parejas' : 'jugadores'} registrados manualmente.</p>
            </div>
          ) : (
            <AnimatePresence>
              {mode === 'pairs'
                ? registeredPairs.map((pair) => (
                  <motion.div
                    key={pair.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="flex items-center justify-between gap-4 bg-[#0F172A] rounded-2xl px-5 py-4 border border-transparent shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:border-slate-700/40 transition-all duration-200 group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{pair.p1Name}</span>
                      <span className="text-sm font-bold text-white">{pair.p2Name}</span>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                      <span className="text-xs font-bold bg-[#0B1120] text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-800/40">
                        <Trophy className="w-3 h-3 text-slate-500" />
                        {pair.category}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{pair.date}</span>
                      <button
                        onClick={() => handleDelete(pair.id, true)}
                        className="p-2 bg-transparent border border-transparent text-slate-600 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 rounded-xl transition-all"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
                : registeredPlayers.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="flex items-center justify-between gap-4 bg-[#0F172A] rounded-2xl px-5 py-4 border border-transparent shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:border-slate-700/40 transition-all duration-200 group"
                  >
                    <span className="text-sm font-bold text-white">{player.name}</span>
                    <div className="flex items-center gap-4 ml-auto">
                      <span className="text-xs font-bold bg-[#0B1120] text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-800/40">
                        <Trophy className="w-3 h-3 text-slate-500" />
                        {player.category}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{player.date}</span>
                      <button
                        onClick={() => handleDelete(player.id, false)}
                        className="p-2 bg-transparent border border-transparent text-slate-600 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 rounded-xl transition-all"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              }
            </AnimatePresence>
          )}
        </div>
      </div>

    </div>
  );
}
