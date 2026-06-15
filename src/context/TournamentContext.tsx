import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Category } from '../data/mockData';

export interface RegisteredPair {
  id: string;
  p1Name: string;
  p2Name: string;
  category: Category;
  date: string;
}

export interface RegisteredPlayer {
  id: string;
  name: string;
  category: Category;
  date: string;
}

export interface Tournament {
  id: number;
  name: string;
  format: 'americano' | 'mexicano' | 'romano' | 'personalizado' | 'mic_padel_league' | 'fase_de_grupos';
  status: string;
  courts: number;
  pairs: number;
  numGroups?: number;
  category?: Category;
  rotationRule?: 'equitativo' | 'rey_de_cancha';
  timeElapsed: string;
  participants: any[]; // Links the pairs or individuals to the tournament
  inscriptions?: RegisteredPair[]; // Independent inscriptions per tournament
  bracketResults?: Record<string, string>; // matchId -> winnerPairId
  bracketParticipants?: any[]; // The selected participants for the bracket
  bracketSize?: number; // 4 or 8
  fixture?: any[]; // Stores the generated groups and matches
  matchScores?: Record<string, { t1: number, t2: number }>; // groupIndex_matchRound -> scores
  currentRound?: number; // For Mexicano format
}

interface TournamentContextType {
  registeredPairs: RegisteredPair[];
  registerPair: (p1Name: string, p2Name: string, category: Category) => void;
  deletePair: (id: string) => void;
  
  registeredPlayers: RegisteredPlayer[];
  registerPlayer: (name: string, category: Category) => void;
  deletePlayer: (id: string) => void;

  activeTournaments: Tournament[];
  createTournament: (name: string, format: 'americano'|'mexicano'|'romano'|'personalizado'|'mic_padel_league'|'fase_de_grupos', courts: number, pairs: number, participants?: any[], fixture?: any[], rotationRule?: 'equitativo' | 'rey_de_cancha', numGroups?: number) => number;
  deleteTournament: (id: number) => void;
  updateTournament: (tournament: Tournament) => void;
  updateBracketResult: (tournamentId: number, matchId: string, winnerId: string) => void;
  confirmBracketPhase: (tournamentId: number, size: number, participants: any[]) => void;
  updateMatchScore: (tournamentId: number, matchId: string, t1: number, t2: number) => void;
  
  addInscriptionToTournament: (tournamentId: number, p1Name: string, p2Name: string, category: Category) => void;
  removeInscriptionFromTournament: (tournamentId: number, pairId: string) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredPairs, setRegisteredPairs] = useState<RegisteredPair[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedPairs = localStorage.getItem('padelitycs_pairs');
    const storedPlayers = localStorage.getItem('padelitycs_players');
    const storedTournaments = localStorage.getItem('padelitycs_tournaments');

    const safeParse = (data: string | null, fallback: any) => {
      if (!data) return fallback;
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Data corruption detected in local storage, reverting to fallback', e);
        return fallback;
      }
    };

    const initialPairs: RegisteredPair[] = [
      { id: '1', p1Name: 'Diego López', p2Name: 'Andrés Soto', category: '3ra', date: 'Hace 2 min' },
    ];
    const parsedPairs = safeParse(storedPairs, initialPairs);
    setRegisteredPairs(parsedPairs);
    if (parsedPairs === initialPairs) localStorage.setItem('padelitycs_pairs', JSON.stringify(initialPairs));

    const initialPlayers: RegisteredPlayer[] = [
      { id: 'p1', name: 'Carlos Díaz', category: '3ra', date: 'Hace 5 min' },
    ];
    const parsedPlayers = safeParse(storedPlayers, initialPlayers);
    setRegisteredPlayers(parsedPlayers);
    if (parsedPlayers === initialPlayers) localStorage.setItem('padelitycs_players', JSON.stringify(initialPlayers));

    const initialTourneys: Tournament[] = [
      { id: 1, name: 'Trujillo Abierto - 3ra Categoría', format: 'americano', status: 'En Juego', courts: 2, pairs: 8, timeElapsed: '2h 15m', participants: [] }
    ];
    const parsedTourneys = safeParse(storedTournaments, initialTourneys);
    setActiveTournaments(parsedTourneys);
    if (parsedTourneys === initialTourneys) localStorage.setItem('padelitycs_tournaments', JSON.stringify(initialTourneys));
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (registeredPairs.length > 0) { // Avoid clearing on first render before load
      localStorage.setItem('padelitycs_pairs', JSON.stringify(registeredPairs));
    }
  }, [registeredPairs]);

  useEffect(() => {
    if (registeredPlayers.length > 0) {
      localStorage.setItem('padelitycs_players', JSON.stringify(registeredPlayers));
    }
  }, [registeredPlayers]);

  useEffect(() => {
    if (activeTournaments.length > 0) {
      localStorage.setItem('padelitycs_tournaments', JSON.stringify(activeTournaments));
    }
  }, [activeTournaments]);

  const registerPair = (p1Name: string, p2Name: string, category: Category) => {
    const newPair: RegisteredPair = {
      id: Math.random().toString(36).substr(2, 9),
      p1Name,
      p2Name,
      category,
      date: 'Justo ahora'
    };
    setRegisteredPairs(prev => [newPair, ...prev]);
  };

  const deletePair = (id: string) => {
    setRegisteredPairs(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (updated.length === 0) localStorage.removeItem('padelitycs_pairs');
      return updated;
    });
  };

  const registerPlayer = (name: string, category: Category) => {
    const newPlayer: RegisteredPlayer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      date: 'Justo ahora'
    };
    setRegisteredPlayers(prev => [newPlayer, ...prev]);
  };

  const deletePlayer = (id: string) => {
    setRegisteredPlayers(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (updated.length === 0) localStorage.removeItem('padelitycs_players');
      return updated;
    });
  };

  const createTournament = (name: string, format: 'americano'|'mexicano'|'romano'|'personalizado'|'mic_padel_league'|'fase_de_grupos', courts: number, pairs: number, participants?: any[], fixture?: any[], rotationRule?: 'equitativo' | 'rey_de_cancha', numGroups?: number): number => {
    const id = Date.now();
    const newTournament: Tournament = {
      id,
      name,
      format,
      status: 'Activo',
      courts,
      pairs,
      numGroups,
      timeElapsed: '0m',
      participants: participants || [],
      inscriptions: [], // initialize empty
      fixture,
      matchScores: {},
      currentRound: 1,
      rotationRule
    };
    setActiveTournaments(prev => [newTournament, ...prev]);
    return id;
  };

  const updateTournament = (tournament: Tournament) => {
    setActiveTournaments(prev => {
      const exists = prev.some(t => t.id === tournament.id);
      return exists ? prev.map(t => t.id === tournament.id ? tournament : t) : [...prev, tournament];
    });
  };

  const deleteTournament = (id: number) => {
    setActiveTournaments(prev => {
      const updated = prev.filter(t => t.id !== id);
      if (updated.length === 0) localStorage.removeItem('padelitycs_tournaments');
      return updated;
    });
  };

  const updateBracketResult = (tournamentId: number, matchId: string, winnerId: string) => {
    setActiveTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          bracketResults: {
            ...(t.bracketResults || {}),
            [matchId]: winnerId
          }
        };
      }
      return t;
    }));
  };

  const confirmBracketPhase = (tournamentId: number, size: number, participants: any[]) => {
    setActiveTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          bracketSize: size,
          bracketParticipants: participants
        };
      }
      return t;
    }));
  };

  const updateMatchScore = (tournamentId: number, matchId: string, t1: number, t2: number) => {
    setActiveTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          matchScores: {
            ...(t.matchScores || {}),
            [matchId]: { t1, t2 }
          }
        };
      }
      return t;
    }));
  };

  const addInscriptionToTournament = (tournamentId: number, p1Name: string, p2Name: string, category: Category) => {
    setActiveTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        const newPair: RegisteredPair = {
          id: Math.random().toString(36).substr(2, 9),
          p1Name,
          p2Name,
          category,
          date: 'Justo ahora'
        };
        return {
          ...t,
          inscriptions: [...(t.inscriptions || []), newPair]
        };
      }
      return t;
    }));
  };

  const removeInscriptionFromTournament = (tournamentId: number, pairId: string) => {
    setActiveTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          inscriptions: (t.inscriptions || []).filter(p => p.id !== pairId)
        };
      }
      return t;
    }));
  };

  return (
    <TournamentContext.Provider value={{
      registeredPairs,
      registerPair,
      deletePair,
      registeredPlayers,
      registerPlayer,
      deletePlayer,
      activeTournaments,
      createTournament,
      deleteTournament,
      updateTournament,
      updateBracketResult,
      confirmBracketPhase,
      updateMatchScore,
      addInscriptionToTournament,
      removeInscriptionFromTournament
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};
