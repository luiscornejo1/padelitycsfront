import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Category } from '../data/mockData';
import type { PadelCashUser, YapePaymentRequest, YapeBookingDetails, PadelCashCoupon } from '../types/padelCashTypes';

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

  // Padel-Cash reward and payment validation system
  padelCashUsers: PadelCashUser[];
  yapePayments: YapePaymentRequest[];
  currentPadelUser: PadelCashUser | null;
  submitYapePayment: (userId: string, bookingDetails: YapeBookingDetails, screenshotUrl: string) => void;
  approveYapePayment: (paymentId: string) => void;
  rejectYapePayment: (paymentId: string, reason: string) => void;
  cancelPaidBooking: (paymentId: string) => void;
  claimPointsCoupon: (userId: string) => void;
  setCurrentPadelUserById: (userId: string) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredPairs, setRegisteredPairs] = useState<RegisteredPair[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);

  // Padel-Cash reward and payment validation states
  const [padelCashUsers, setPadelCashUsers] = useState<PadelCashUser[]>([]);
  const [yapePayments, setYapePayments] = useState<YapePaymentRequest[]>([]);
  const [currentPadelUser, setCurrentPadelUser] = useState<PadelCashUser | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedPairs = localStorage.getItem('padelitycs_pairs');
    const storedPlayers = localStorage.getItem('padelitycs_players');
    const storedTournaments = localStorage.getItem('padelitycs_tournaments');
    const storedCashUsers = localStorage.getItem('padelitycs_cash_users');
    const storedYapePayments = localStorage.getItem('padelitycs_yape_payments');

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

    // Initialize mock cash users and payments
    const initialCashUsers: PadelCashUser[] = [
      {
        id: 'p1', // Carlos Díaz
        name: 'Carlos Díaz',
        phone: '987654321',
        points: 40,
        completedReservationsCount: 8, // Close to Plata (10)
        level: 'bronce',
        coupons: []
      },
      {
        id: 'p2',
        name: 'Roberto Gómez',
        phone: '912345678',
        points: 120,
        completedReservationsCount: 15, // Plata (10-24)
        level: 'plata',
        coupons: [{ code: 'DESC-100', value: 50, type: 'discount', isUsed: false, dateCreated: 'Ayer' }]
      },
      {
        id: 'p3',
        name: 'Milagros Soto',
        phone: '955443322',
        points: 80,
        completedReservationsCount: 30, // Oro (25+)
        level: 'oro',
        coupons: []
      }
    ];
    const parsedCashUsers = safeParse(storedCashUsers, initialCashUsers);
    setPadelCashUsers(parsedCashUsers);
    if (!storedCashUsers) localStorage.setItem('padelitycs_cash_users', JSON.stringify(initialCashUsers));

    const initialYapePayments: YapePaymentRequest[] = [
      {
        id: 'YAP-982',
        userId: 'p1',
        userName: 'Carlos Díaz',
        bookingDetails: {
          court: 'Cancha 1 (Panorámica)',
          date: '2026-06-17',
          time: '19:00 - 20:30',
          originalPrice: 80,
          discountedPrice: 72
        },
        screenshotUrl: 'https://placehold.co/400x800/22c55e/ffffff?text=Yape+S/+72.00\\nCarlos+Diaz\\nOperacion:+99812',
        status: 'pending',
        dateCreated: 'Hace 5 min'
      }
    ];
    const parsedYapePayments = safeParse(storedYapePayments, initialYapePayments);
    setYapePayments(parsedYapePayments);
    if (!storedYapePayments) localStorage.setItem('padelitycs_yape_payments', JSON.stringify(initialYapePayments));

    // Set current active user to Carlos Díaz for client view
    const current = parsedCashUsers.find((u: PadelCashUser) => u.id === 'p1') || parsedCashUsers[0] || null;
    setCurrentPadelUser(current);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (registeredPairs.length > 0) {
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

  useEffect(() => {
    if (padelCashUsers.length > 0) {
      localStorage.setItem('padelitycs_cash_users', JSON.stringify(padelCashUsers));
    }
  }, [padelCashUsers]);

  useEffect(() => {
    if (yapePayments.length > 0) {
      localStorage.setItem('padelitycs_yape_payments', JSON.stringify(yapePayments));
    }
  }, [yapePayments]);

  // Sincronización en tiempo real entre pestañas (Storage Event)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'padelitycs_cash_users' && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        setPadelCashUsers(parsed);
        setCurrentPadelUser(prev => {
          if (!prev) return null;
          return parsed.find((u: PadelCashUser) => u.id === prev.id) || prev;
        });
      }
      if (e.key === 'padelitycs_yape_payments' && e.newValue) {
        setYapePayments(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
      inscriptions: [],
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

  // Padel-Cash reward operations
  const submitYapePayment = (userId: string, bookingDetails: YapeBookingDetails, screenshotUrl: string) => {
    const user = padelCashUsers.find(u => u.id === userId);
    if (!user) return;

    const newPayment: YapePaymentRequest = {
      id: `YAP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      userName: user.name,
      bookingDetails,
      screenshotUrl,
      status: 'pending',
      dateCreated: 'Hace un momento'
    };

    setYapePayments(prev => [newPayment, ...prev]);
  };

  const approveYapePayment = (paymentId: string) => {
    const payment = yapePayments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'pending') return;

    const targetUserId = payment.userId;
    
    setYapePayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: 'approved' } : p
    ));

    setPadelCashUsers(prev => prev.map(user => {
      if (user.id === targetUserId) {
        const newReservations = user.completedReservationsCount + 1;
        let newLevel = user.level;
        if (newReservations >= 25) newLevel = 'oro';
        else if (newReservations >= 10) newLevel = 'plata';

        const updatedUser: PadelCashUser = {
          ...user,
          points: user.points + 10,
          completedReservationsCount: newReservations,
          level: newLevel
        };

        setCurrentPadelUser(curr => (curr && curr.id === targetUserId) ? updatedUser : curr);
        return updatedUser;
      }
      return user;
    }));
  };

  const rejectYapePayment = (paymentId: string, reason: string) => {
    const payment = yapePayments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'pending') return;

    setYapePayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: 'rejected', rejectionReason: reason } : p
    ));
  };

  const cancelPaidBooking = (paymentId: string) => {
    const payment = yapePayments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'approved') return;

    const targetUserId = payment.userId;
    const refundValue = payment.bookingDetails.discountedPrice;

    setYapePayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: 'rejected', rejectionReason: 'Reserva cancelada (Reembolso Crédito)' } : p
    ));

    setPadelCashUsers(prev => prev.map(user => {
      if (user.id === targetUserId) {
        const newCoupon: PadelCashCoupon = {
          code: `CRED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          value: refundValue,
          type: 'credit_virtual',
          isUsed: false,
          dateCreated: 'Justo ahora'
        };
        
        const newReservations = Math.max(0, user.completedReservationsCount - 1);
        let newLevel = user.level;
        if (newReservations < 10) newLevel = 'bronce';
        else if (newReservations < 25) newLevel = 'plata';

        const updatedUser: PadelCashUser = {
          ...user,
          points: Math.max(0, user.points - 10), // Deduct points
          completedReservationsCount: newReservations,
          level: newLevel,
          coupons: [newCoupon, ...user.coupons]
        };

        setCurrentPadelUser(curr => (curr && curr.id === targetUserId) ? updatedUser : curr);
        return updatedUser;
      }
      return user;
    }));
  };

  const claimPointsCoupon = (userId: string) => {
    setPadelCashUsers(prev => prev.map(user => {
      if (user.id === userId && user.points >= 100) {
        const newCoupon: PadelCashCoupon = {
          code: `CUP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          value: 50,
          type: 'discount',
          isUsed: false,
          dateCreated: 'Justo ahora'
        };
        const updatedUser: PadelCashUser = {
          ...user,
          points: user.points - 100,
          coupons: [newCoupon, ...user.coupons]
        };

        setCurrentPadelUser(curr => (curr && curr.id === userId) ? updatedUser : curr);
        return updatedUser;
      }
      return user;
    }));
  };

  const setCurrentPadelUserById = (userId: string) => {
    const user = padelCashUsers.find(u => u.id === userId);
    if (user) {
      setCurrentPadelUser(user);
    }
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
      removeInscriptionFromTournament,
      
      padelCashUsers,
      yapePayments,
      currentPadelUser,
      submitYapePayment,
      approveYapePayment,
      rejectYapePayment,
      cancelPaidBooking,
      claimPointsCoupon,
      setCurrentPadelUserById
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
