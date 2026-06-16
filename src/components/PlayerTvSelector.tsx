import { useState } from 'react';
import { useTournaments } from '../context/TournamentContext';
import PlayerTvView from './PlayerTvView';
import { Trophy, Tv, PlayCircle, Loader2 } from 'lucide-react';

interface PlayerTvSelectorProps {
  onNavigateHome: () => void;
  initialTournamentId?: string | null;
}

export default function PlayerTvSelector({ onNavigateHome, initialTournamentId }: PlayerTvSelectorProps) {
  const { activeTournaments, updateTournament } = useTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | number | null>(initialTournamentId || null);
  const [loading, setLoading] = useState(false);

  // Filter only active tournaments
  const inGameTournaments = activeTournaments.filter(t => t.status === 'En Juego');

  const handleLoadMockData = () => {
    setLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      const mockId = Date.now();
      const mockTournament = {
        id: mockId,
        name: 'Torneo Padel Americano - Final',
        date: new Date().toISOString().split('T')[0],
        category: 'Libre' as any,
        format: 'americano' as const,
        status: 'En Juego' as const,
        courts: 2,
        pairs: 8,
        inscriptions: [],
        fixture: [
          {
            courtNumber: 1,
            courtName: 'Cancha 1',
            pairs: [],
            matches: [
              {
                round: 1,
                team1: { player1: { name: 'Alejandro G.' }, player2: { name: 'Juan L.' } },
                team2: { player1: { name: 'Fernando B.' }, player2: { name: 'Sanyo G.' } }
              }
            ]
          },
          {
            courtNumber: 2,
            courtName: 'Cancha 2',
            pairs: [],
            matches: [
              {
                round: 1,
                team1: { player1: { name: 'Arturo C.' }, player2: { name: 'Agustín T.' } },
                team2: { player1: { name: 'Paquito N.' }, player2: { name: 'Fede C.' } }
              }
            ]
          }
        ],
        matchScores: {
          'g1_m0': { t1: 14, t2: 17 }, // Set 1 score
          'g2_m0': { t1: 6, t2: 2 } // Set 1 score
        },
        participants: [],
        timeElapsed: '0'
      };
      // We don't save this to context to not pollute admin, just pass it down or save temporarily
      // Actually we need to add it to context so it works cleanly if we want.
      // But maybe better not to pollute? Let's just pass the mock directly to PlayerTvView if mock is selected.
      // Wait, PlayerTvView will read from context. Let's add it to context.
      updateTournament(mockTournament);
      setSelectedTournamentId(mockId);
      setLoading(false);
    }, 1000);
  };

  if (selectedTournamentId) {
    return <PlayerTvView tournamentId={selectedTournamentId} onBack={() => setSelectedTournamentId(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#060B14] text-white p-6 pt-24 font-['Inter']">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onNavigateHome}
          className="text-[#E2FF3A] font-bold text-sm mb-8 hover:underline flex items-center gap-2"
        >
          ← Volver al Inicio
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#E2FF3A] p-3 rounded-xl text-black">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tight uppercase">PADEL TV</h1>
            <p className="text-slate-400 font-medium tracking-widest text-xs uppercase mt-1">Player View Portal</p>
          </div>
        </div>

        <div className="bg-[#12161A] border border-[#1E252D] rounded-2xl p-6 mb-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#E2FF3A]" /> Torneos Activos
          </h2>
          
          <div className="space-y-4">
            {inGameTournaments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No hay torneos en juego actualmente.</p>
            ) : (
              inGameTournaments.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTournamentId(t.id)}
                  className="w-full bg-[#0B1120] hover:bg-[#1E252D] border border-slate-800 hover:border-[#E2FF3A]/30 p-4 rounded-xl flex items-center justify-between transition-all group"
                >
                  <div className="text-left">
                    <h3 className="font-bold text-white group-hover:text-[#E2FF3A] transition-colors">{t.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t.category} • {t.format}</p>
                  </div>
                  <PlayCircle className="w-6 h-6 text-slate-600 group-hover:text-[#E2FF3A] transition-colors" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#12161A] border border-[#1E252D] rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-4">¿Modo de Prueba?</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Como la app usa localStorage, los torneos de tu PC no aparecerán aquí si abres esto desde el celular.
            Carga datos de prueba para ver el diseño en acción.
          </p>
          <button
            onClick={handleLoadMockData}
            disabled={loading}
            className="w-full py-4 bg-[#E2FF3A] hover:bg-[#d4f231] text-black font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(226,255,58,0.2)] hover:shadow-[0_0_30px_rgba(226,255,58,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cargar Torneo de Prueba'}
          </button>
        </div>
      </div>
    </div>
  );
}
