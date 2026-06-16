import { useState, useEffect } from 'react';
import { useTournaments } from '../context/TournamentContext';
import { Trophy, Tv, Users, LayoutGrid, ChevronLeft, Activity, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { getOverallClassified } from '../lib/standingsLogic';
import BracketGenerator from './BracketGenerator';

interface PlayerTvViewProps {
  tournamentId: string | number;
  onBack: () => void;
}

export default function PlayerTvView({ tournamentId, onBack }: PlayerTvViewProps) {
  const { activeTournaments } = useTournaments();
  // Use loose equality to match string "mock-123" or number 123
  const tournament = activeTournaments.find(t => String(t.id) === String(tournamentId));
  const [activeTab, setActiveTab] = useState<'tv' | 'posiciones' | 'fixture' | 'jugadores'>('tv');
  const [fixtureSubTab, setFixtureSubTab] = useState<'regular' | 'final'>('regular');
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const classifiedPairs = (activeTab === 'posiciones' || activeTab === 'jugadores') ? getOverallClassified(tournament, true) : [];

  const getPlayerHistory = (playerId: string) => {
    if (!tournament || !tournament.fixture) return [];
    
    const history: any[] = [];
    tournament.fixture.forEach(group => {
      group.matches?.forEach((m: any, matchIdx: number) => {
        // Check if player is in this match
        const isTeam1 = m.team1?.player1?.id.replace('ind-', '') === playerId || m.team1?.player2?.id.replace('ind-', '') === playerId;
        const isTeam2 = m.team2?.player1?.id.replace('ind-', '') === playerId || m.team2?.player2?.id.replace('ind-', '') === playerId;
        
        if (isTeam1 || isTeam2) {
          const matchId = `g${group.courtNumber}_m${matchIdx}`;
          const score = tournament.matchScores?.[matchId];
          
          if (score !== undefined) {
            const team1Won = score.t1 > score.t2;
            const myTeamWon = isTeam1 ? team1Won : !team1Won;
            const myTeam = isTeam1 ? m.team1 : m.team2;
            const rivalTeam = isTeam1 ? m.team2 : m.team1;
            const myScore = isTeam1 ? score.t1 : score.t2;
            const rivalScore = isTeam1 ? score.t2 : score.t1;
            
            // Find partner
            const isP1 = myTeam?.player1?.id.replace('ind-', '') === playerId;
            const partner = isP1 ? myTeam?.player2 : myTeam?.player1;
            
            history.push({
              round: m.round || matchIdx + 1,
              courtName: group.courtName || `Cancha ${group.courtNumber}`,
              partnerName: partner ? partner.name : 'N/A',
              rivals: `${rivalTeam?.player1?.name?.split(' ')[0] || ''} / ${rivalTeam?.player2?.name?.split(' ')[0] || ''}`,
              myScore,
              rivalScore,
              won: myTeamWon
            });
          }
        }
      });
    });
    
    return history.sort((a, b) => a.round - b.round);
  };

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#111418] text-white flex flex-col items-center justify-center p-6">
        <Activity className="w-12 h-12 text-[#E2FF3A] animate-pulse mb-4" />
        <h2 className="text-xl font-bold tracking-widest uppercase text-center mb-2">Cargando Torneo...</h2>
        <p className="text-slate-500 text-sm text-center">Sincronizando datos en vivo</p>
        <button 
          onClick={onBack}
          className="mt-8 px-6 py-2 border border-[#2A3441] text-slate-400 hover:text-white rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  const currentRound = tournament.currentRound || 1;
  const liveMatches: any[] = [];
  
  if (tournament.fixture) {
    tournament.fixture.forEach(group => {
      let match;
      let matchIdx = -1;
      
      if (tournament.format === 'americano') {
        matchIdx = currentRound - 1;
        match = group.matches?.[matchIdx];
      } else {
        match = group.matches?.find((m: any) => m.round === currentRound);
        matchIdx = group.matches?.indexOf(match) ?? -1;
      }

      if (match && matchIdx >= 0 && matchIdx < (group.matches?.length || 0)) {
        const matchId = `g${group.courtNumber}_m${matchIdx}`;
        const score = tournament.matchScores?.[matchId];
        
        liveMatches.push({
          courtName: group.courtName || `Cancha ${group.courtNumber}`,
          match: match,
          score: score || { t1: 0, t2: 0 },
        });
      }
    });
  }

  // Fallback
  if (liveMatches.length === 0) {
    liveMatches.push({
      courtName: 'Cancha 1',
      match: {
        team1: { player1: { name: 'Player A' }, player2: { name: 'Player B' } },
        team2: { player1: { name: 'Player C' }, player2: { name: 'Player D' } }
      },
      score: { t1: 0, t2: 0 },
    });
  }

  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  useEffect(() => {
    if (liveMatches.length <= 1 || activeTab !== 'tv') return;
    
    // Auto-rotate every 8 seconds
    const interval = setInterval(() => {
      setActiveCarouselIndex(prev => (prev + 1) % liveMatches.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [liveMatches.length, activeTab]);

  // Ensure index is valid
  const mainMatch = liveMatches[activeCarouselIndex] || liveMatches[0];

  return (
    <div className="min-h-screen bg-[#111418] text-white font-['Inter'] flex flex-col relative pb-20">
      
      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-[#2A3441]/50 bg-[#151A20]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-[#2A3441] rounded-full transition-colors mr-1">
            <ChevronLeft className="w-5 h-5 text-[#E2FF3A]" />
          </button>
          <div className="text-[#E2FF3A]">
            <Tv className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">PADEL TV</h1>
        </div>
        <div className="bg-[#FF3A5E]/10 border border-[#FF3A5E]/30 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF3A5E] animate-pulse"></div>
          <span className="text-[#FF3A5E] text-xs font-bold tracking-widest uppercase">LIVE</span>
        </div>
      </header>

      {activeTab === 'tv' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          
          {/* MAIN EVENT CAROUSEL */}
          <section>
            <div className="flex justify-between items-end mb-4 px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-white tracking-widest uppercase">RONDA ACTUAL</h2>
                <span className="bg-[#E2FF3A] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">R{currentRound}</span>
              </div>
              <span className="text-[#E2FF3A] text-xs font-bold tracking-widest uppercase">{mainMatch?.courtName}</span>
            </div>

            <div className="bg-[#1C232D] border border-[#2A3441] rounded-2xl overflow-hidden relative shadow-2xl">
              {/* COURT GRAPHIC WITH PSEUDO-3D DEPTH */}
              <div className="h-[420px] relative flex flex-col justify-between p-6 bg-gradient-to-b from-[#18202F] via-[#111622] to-[#18202F]">
                
                {/* Pseudo-3D Lighting Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#E2FF3A]/5 blur-[100px] rounded-full pointer-events-none"></div>

                {/* 2.5D Court Lines Background */}
                <div className="absolute inset-x-8 inset-y-12 border-2 border-[#2A3441] rounded-sm pointer-events-none z-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                   {/* Center Line / Net */}
                   <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#2A3441] shadow-[0_0_15px_rgba(0,0,0,0.8)]"></div>
                   
                   {/* Service boxes */}
                   <div className="absolute top-[25%] left-0 right-0 h-[2px] bg-[#2A3441]/60"></div>
                   <div className="absolute bottom-[25%] left-0 right-0 h-[2px] bg-[#2A3441]/60"></div>
                   <div className="absolute top-[25%] bottom-[25%] left-1/2 w-[2px] bg-[#2A3441]/60 -translate-x-1/2"></div>
                </div>

                {/* TEAM A */}
                <div className="relative z-10 flex flex-col items-center pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">TEAM A</span>
                    <div className="w-3 h-3 rounded-full bg-[#E2FF3A] shadow-[0_0_8px_#E2FF3A]"></div> {/* Ball icon */}
                  </div>
                  <h3 className="font-bold text-2xl md:text-3xl leading-tight text-white tracking-tight">{mainMatch?.match.team1.player1.name}</h3>
                  <h3 className="font-bold text-2xl md:text-3xl leading-tight text-white tracking-tight">& {mainMatch?.match.team1.player2.name}</h3>
                </div>

                {/* SCORES IN MIDDLE */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-center z-20">
                  {/* Neon Glow Center Line */}
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E2FF3A]/50 to-transparent shadow-[0_0_20px_#E2FF3A]"></div>
                  
                  <div className="relative z-10 flex items-center gap-8 md:gap-16 px-8">
                    <div className="flex flex-col items-center bg-[#111622] px-4 pb-2 pt-1 rounded-lg">
                      <span className="text-6xl md:text-7xl font-black text-[#E2FF3A] italic tracking-tighter drop-shadow-[0_0_25px_rgba(226,255,58,0.3)]">{mainMatch?.score.t1 || 0}</span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">SET 1</span>
                    </div>
                    <div className="w-[2px] h-20 bg-slate-700/50 transform rotate-12"></div>
                    <div className="flex flex-col items-center bg-[#111622] px-4 pb-2 pt-1 rounded-lg">
                      <span className="text-6xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">{mainMatch?.score.t2 || 0}</span>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">SET 1</span>
                    </div>
                  </div>
                </div>

                {/* TEAM B */}
                <div className="relative z-10 flex flex-col items-center pb-4">
                  <h3 className="font-bold text-2xl md:text-3xl leading-tight text-white tracking-tight">{mainMatch?.match.team2.player1.name}</h3>
                  <h3 className="font-bold text-2xl md:text-3xl leading-tight text-white tracking-tight">& {mainMatch?.match.team2.player2.name}</h3>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">TEAM B</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* OTHER COURTS (THUMBNAILS) */}
          {liveMatches.length > 0 && (
            <section className="pt-4">
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-sm font-black text-white tracking-widest uppercase">Otras canchas</h2>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x px-2">
                {liveMatches.map((om, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveCarouselIndex(idx)}
                    className={`min-w-[280px] border rounded-2xl p-5 snap-center shadow-lg cursor-pointer transition-all ${
                      activeCarouselIndex === idx 
                        ? 'bg-[#1C232D] border-[#E2FF3A]/50 ring-1 ring-[#E2FF3A]/20' 
                        : 'bg-[#151A20] border-[#2A3441] opacity-70 hover:opacity-100'
                    }`}
                  >
                    
                    {/* Mini court score */}
                    <div className="h-16 border border-[#2A3441] rounded-lg mb-4 relative flex items-center px-6 bg-[#0F172A]">
                       <div className="absolute left-0 right-0 h-[2px] bg-[#E2FF3A]/20"></div>
                       <div className="w-full flex justify-between relative z-10 px-2">
                         <span className="font-black text-2xl text-white">{om.score.t1 || 0}</span>
                         <span className="font-black text-2xl text-white">{om.score.t2 || 0}</span>
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-2">
                         {activeCarouselIndex === idx && <div className="w-1.5 h-1.5 rounded-full bg-[#E2FF3A] animate-pulse"></div>}
                         <span className={`${activeCarouselIndex === idx ? 'text-[#E2FF3A]' : 'text-slate-400'} text-[10px] font-black tracking-widest uppercase`}>{om.courtName}</span>
                       </div>
                       <span className="text-slate-500 text-[9px] font-black tracking-widest uppercase">RONDA {currentRound}</span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-white line-clamp-1">{om.match.team1.player1.name} / {om.match.team1.player2.name}</p>
                      <p className="text-sm font-medium text-slate-400 line-clamp-1">{om.match.team2.player1.name} / {om.match.team2.player2.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* FIXTURE TAB */}
      {activeTab === 'fixture' && (
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="mb-6 px-2 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Cronograma</h2>
              <p className="text-slate-400 text-sm mt-1">Revisa cuándo te toca jugar.</p>
            </div>
            
            {tournament.bracketParticipants && tournament.bracketParticipants.length > 0 && (
              <div className="flex bg-[#151A20] rounded-lg p-1 border border-[#2A3441]">
                <button 
                  onClick={() => setFixtureSubTab('regular')}
                  className={`px-3 py-1.5 text-xs font-bold rounded uppercase tracking-wider ${fixtureSubTab === 'regular' ? 'bg-[#E2FF3A] text-black' : 'text-slate-400 hover:text-white'}`}
                >
                  Grupos
                </button>
                <button 
                  onClick={() => setFixtureSubTab('final')}
                  className={`px-3 py-1.5 text-xs font-bold rounded uppercase tracking-wider ${fixtureSubTab === 'final' ? 'bg-[#E2FF3A] text-black' : 'text-slate-400 hover:text-white'}`}
                >
                  Fase Final
                </button>
              </div>
            )}
          </div>

          {fixtureSubTab === 'regular' ? (
            <div className="space-y-8">
              {tournament.fixture?.map((group, groupIdx) => (
                <section key={groupIdx} className="bg-[#1C232D] border border-[#2A3441] rounded-2xl overflow-hidden">
                  {/* Court Header */}
                  <div className="bg-[#151A20] px-5 py-3 border-b border-[#2A3441] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#E2FF3A]"></div>
                      <h3 className="font-bold text-white tracking-widest uppercase text-sm">{group.courtName || `Cancha ${group.courtNumber}`}</h3>
                    </div>
                    <span className="text-[#E2FF3A] text-[10px] font-black tracking-widest uppercase">Grupo {groupIdx + 1}</span>
                  </div>

                  {/* Match List */}
                  <div className="divide-y divide-[#2A3441]/50">
                    {group.matches?.map((match: any, matchIdx: number) => {
                      const matchId = `g${group.courtNumber}_m${matchIdx}`;
                      const score = tournament.matchScores?.[matchId];
                      const isPlayed = !!score;

                      return (
                        <div key={matchIdx} className="p-4 flex items-center justify-between hover:bg-[#2A3441]/20 transition-colors">
                          
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${isPlayed ? 'text-slate-300' : 'text-white'}`}>
                              {match.team1.player1.name} / {match.team1.player2.name}
                            </p>
                            <p className={`font-medium text-sm mt-1 ${isPlayed ? 'text-slate-300' : 'text-white'}`}>
                              {match.team2.player1.name} / {match.team2.player2.name}
                            </p>
                          </div>

                          <div className="ml-4 flex flex-col items-end justify-center">
                            {isPlayed ? (
                              <div className="bg-[#151A20] border border-[#2A3441] rounded px-3 py-1.5 flex gap-3">
                                <span className="font-black text-white">{score.t1}</span>
                                <span className="text-slate-600">-</span>
                                <span className="font-black text-white">{score.t2}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase bg-[#151A20] px-2 py-1 rounded">Pendiente</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              {(!tournament.fixture || tournament.fixture.length === 0) && (
                <div className="text-center p-8 bg-[#1C232D] rounded-2xl border border-[#2A3441]">
                  <p className="text-slate-500">Aún no hay partidos generados para este torneo.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#1C232D] border border-[#2A3441] rounded-2xl overflow-hidden pt-4">
              <BracketGenerator 
                participants={tournament.bracketParticipants || []} 
                size={tournament.bracketSize || 8}
                bracketResults={tournament.bracketResults}
                isAdmin={false}
              />
            </div>
          )}
        </div>
      )}

      {/* POSICIONES TAB */}
      {activeTab === 'posiciones' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">TABLA GENERAL</h2>
            <Trophy className="w-6 h-6 text-[#E2FF3A]" />
          </div>
          
          <div className="bg-[#1C232D] border border-[#2A3441] rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="grid grid-cols-[15%_55%_15%_15%] gap-2 bg-[#151A20] p-4 border-b border-[#2A3441] text-[10px] font-black text-slate-500 tracking-widest uppercase">
              <div className="text-center">#</div>
              <div>PAREJA</div>
              <div className="text-center">PTS</div>
              <div className="text-center">PJ</div>
            </div>
            
            {/* Rows */}
            <div className="flex flex-col">
              {classifiedPairs.length > 0 ? classifiedPairs.map((pair: any, idx: number) => {
                const isFirst = idx === 0;
                return (
                  <div 
                    key={pair.id} 
                    className={`grid grid-cols-[15%_55%_15%_15%] gap-2 p-4 items-center border-b border-[#2A3441] last:border-0 transition-colors ${
                      isFirst ? 'bg-[#E2FF3A]/10 relative' : 'bg-[#1C232D]'
                    }`}
                  >
                    {isFirst && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E2FF3A]"></div>
                    )}
                    
                    {/* Rank */}
                    <div className="flex justify-center">
                      {isFirst ? (
                        <div className="w-8 h-8 rounded-full bg-[#E2FF3A] flex items-center justify-center text-black shadow-[0_0_15px_rgba(226,255,58,0.4)]">
                          <Medal className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#2A3441] flex items-center justify-center font-black text-slate-400">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold truncate ${isFirst ? 'text-white' : 'text-slate-300'}`}>
                        {pair.name}
                      </span>
                    </div>
                    
                    {/* Points */}
                    <div className="flex justify-center items-center">
                      <span className={`text-xl font-black ${isFirst ? 'text-[#E2FF3A]' : 'text-white'}`}>
                        {pair.points}
                      </span>
                    </div>
                    
                    {/* Matches Played */}
                    <div className="flex justify-center items-center">
                      <span className="text-xs font-bold text-slate-500">
                        {pair.matchesPlayed}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-slate-500">
                  <p>Aún no hay resultados para mostrar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JUGADORES TAB */}
      {activeTab === 'jugadores' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">DIRECTORIO DE JUGADORES</h2>
            <Users className="w-6 h-6 text-[#E2FF3A]" />
          </div>
          
          <div className="bg-[#1C232D] border border-[#2A3441] rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex flex-col">
              {classifiedPairs.length > 0 ? classifiedPairs.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((pair: any) => {
                const isExpanded = expandedPlayerId === pair.id;
                const history = isExpanded ? getPlayerHistory(pair.id) : [];
                
                return (
                  <div key={pair.id} className="border-b border-[#2A3441] last:border-0">
                    {/* Header Row */}
                    <button 
                      onClick={() => setExpandedPlayerId(isExpanded ? null : pair.id)}
                      className="w-full grid grid-cols-[80%_20%] gap-2 p-4 items-center bg-[#1C232D] hover:bg-[#2A3441] transition-colors text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white truncate">{pair.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{pair.matchesPlayed} Partidos Jugados</span>
                      </div>
                      <div className="flex justify-end text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>
                    
                    {/* Expanded History */}
                    {isExpanded && (
                      <div className="bg-[#151A20] p-4 border-t border-[#2A3441]/50">
                        <h4 className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3">Historial de Partidos</h4>
                        
                        {history.length > 0 ? (
                          <div className="space-y-2">
                            {history.map((match: any, idx: number) => (
                              <div key={idx} className="bg-[#1C232D] p-3 rounded-lg border border-[#2A3441] flex items-center justify-between">
                                <div className="flex flex-col gap-1 w-2/3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] bg-[#2A3441] text-slate-300 px-1.5 py-0.5 rounded font-bold">R{match.round}</span>
                                    <span className="text-xs font-bold text-white truncate">vs {match.rivals}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 truncate">Compañero: {match.partnerName}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-black ${match.won ? 'text-[#E2FF3A]' : 'text-[#FF3A5E]'}`}>
                                    {match.myScore} - {match.rivalScore}
                                  </span>
                                  <div className={`w-2 h-2 rounded-full ${match.won ? 'bg-[#E2FF3A] shadow-[0_0_8px_#E2FF3A]' : 'bg-[#FF3A5E] shadow-[0_0_8px_#FF3A5E]'}`}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 text-center py-4">Aún no ha jugado ningún partido.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-slate-500">
                  <p>Aún no hay jugadores registrados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#151A20] border-t border-[#2A3441] px-6 py-4 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('tv')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'tv' ? 'text-[#E2FF3A]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">TV en Vivo</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('fixture')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'fixture' ? 'text-[#E2FF3A]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Fixture</span>
        </button>

        <button 
          onClick={() => setActiveTab('posiciones')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'posiciones' ? 'text-[#E2FF3A]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Posiciones</span>
        </button>

        <button 
          onClick={() => setActiveTab('jugadores')}
          className={`flex flex-col items-center gap-1.5 ${activeTab === 'jugadores' ? 'text-[#E2FF3A]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Jugadores</span>
        </button>
      </nav>

    </div>
  );
}
