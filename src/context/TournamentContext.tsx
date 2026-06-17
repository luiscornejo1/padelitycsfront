import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Category } from '../data/mockData';
import type { PadelCashUser, YapePaymentRequest, YapeBookingDetails, PadelCashCoupon } from '../types/padelCashTypes';
import { supabase } from '../lib/supabaseClient';

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
  participants: any[]; 
  inscriptions?: RegisteredPair[]; 
  bracketResults?: Record<string, string>; 
  bracketParticipants?: any[]; 
  bracketSize?: number; 
  fixture?: any[]; 
  matchScores?: Record<string, { t1: number, t2: number }>; 
  currentRound?: number; 
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
  // --- Local Storage States (Temporales, carrito de compras) ---
  const [registeredPairs, setRegisteredPairs] = useState<RegisteredPair[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  
  // --- Supabase States (Persistentes) ---
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [padelCashUsers, setPadelCashUsers] = useState<PadelCashUser[]>([]);
  const [yapePayments, setYapePayments] = useState<YapePaymentRequest[]>([]);
  const [currentPadelUser, setCurrentPadelUser] = useState<PadelCashUser | null>(null);

  // Carga inicial y Suscripciones Realtime
  useEffect(() => {
    // Cargar locales
    const storedPairs = localStorage.getItem('padelitycs_pairs');
    const storedPlayers = localStorage.getItem('padelitycs_players');
    if (storedPairs) setRegisteredPairs(JSON.parse(storedPairs));
    if (storedPlayers) setRegisteredPlayers(JSON.parse(storedPlayers));

    // Cargar desde Supabase
    fetchSupabaseData();

    // Configurar Realtime
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        (payload) => {
          fetchTournaments(); // Refetch on any change (simple sync)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yape_payments' },
        (payload) => {
          fetchYapePayments();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save temporary state to LocalStorage
  useEffect(() => {
    if (registeredPairs.length > 0) localStorage.setItem('padelitycs_pairs', JSON.stringify(registeredPairs));
  }, [registeredPairs]);

  useEffect(() => {
    if (registeredPlayers.length > 0) localStorage.setItem('padelitycs_players', JSON.stringify(registeredPlayers));
  }, [registeredPlayers]);

  // Funciones de Fetch
  const fetchTournaments = async () => {
    const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Map DB snake_case columns to camelCase expected by the app
      const mapped = data.map(t => ({
        id: t.id,
        name: t.name,
        format: t.format,
        status: t.status,
        courts: t.courts,
        pairs: t.pairs,
        numGroups: t.num_groups,
        category: t.category,
        rotationRule: t.rotation_rule,
        timeElapsed: t.time_elapsed || '0m',
        participants: t.participants || [],
        bracketResults: t.bracket_results,
        bracketParticipants: t.bracket_participants,
        bracketSize: t.bracket_size,
        fixture: t.fixture,
        matchScores: t.match_scores,
        currentRound: t.current_round,
        inscriptions: [] // TODO: If needed, fetch inscriptions from its table
      }));
      setActiveTournaments(mapped as any);
    }
  };

  const fetchYapePayments = async () => {
    const { data, error } = await supabase.from('yape_payments').select(`
      *,
      profiles:user_id ( full_name )
    `).order('created_at', { ascending: false });
    if (!error && data) {
      const mapped = data.map(p => ({
        id: p.id,
        userId: p.user_id,
        userName: p.profiles?.full_name || 'Usuario Desconocido',
        bookingDetails: {
          court: 'Cancha Reserva', // En una app real, esto vendría de join con 'reservations'
          date: new Date(p.created_at).toLocaleDateString(),
          time: '',
          originalPrice: p.amount,
          discountedPrice: p.amount
        },
        screenshotUrl: p.screenshot_url,
        status: p.status,
        dateCreated: new Date(p.created_at).toLocaleString(),
        rejectionReason: p.rejection_reason
      }));
      setYapePayments(mapped as any);
    }
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      const mapped = data.map(p => ({
        id: p.id,
        name: p.full_name || 'Jugador',
        phone: p.phone || '',
        points: p.points || 0,
        completedReservationsCount: p.completed_reservations_count || 0,
        level: p.level || 'bronce',
        coupons: [] // Los cupones se cargan de otra tabla si es necesario
      }));
      setPadelCashUsers(mapped as any);
      
      // Auto-set current user si no hay uno
      setCurrentPadelUser(prev => {
        if (!prev && mapped.length > 0) return mapped[0] as any;
        if (prev) return mapped.find(u => u.id === prev.id) as any || prev;
        return null;
      });
    }
  };

  const fetchSupabaseData = async () => {
    await Promise.all([fetchTournaments(), fetchYapePayments(), fetchProfiles()]);
  };

  // --- Operaciones Locales (Pairs / Players) ---
  const registerPair = (p1Name: string, p2Name: string, category: Category) => {
    setRegisteredPairs(prev => [{ id: Math.random().toString(36).substr(2, 9), p1Name, p2Name, category, date: 'Justo ahora' }, ...prev]);
  };

  const deletePair = (id: string) => {
    setRegisteredPairs(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (updated.length === 0) localStorage.removeItem('padelitycs_pairs');
      return updated;
    });
  };

  const registerPlayer = (name: string, category: Category) => {
    setRegisteredPlayers(prev => [{ id: Math.random().toString(36).substr(2, 9), name, category, date: 'Justo ahora' }, ...prev]);
  };

  const deletePlayer = (id: string) => {
    setRegisteredPlayers(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (updated.length === 0) localStorage.removeItem('padelitycs_players');
      return updated;
    });
  };

  // --- Operaciones Supabase (Tournaments) ---
  const createTournament = (name: string, format: any, courts: number, pairs: number, participants?: any[], fixture?: any[], rotationRule?: any, numGroups?: number): number => {
    // MOCK id for immediate return (Supabase returns uuid or serial)
    // To match interface, we return a temporary ID, Supabase uses SERIAL which is async
    const tempId = Date.now();
    
    supabase.from('tournaments').insert({
      name,
      format,
      status: 'Activo',
      courts,
      pairs,
      num_groups: numGroups,
      participants: participants || [],
      fixture: fixture || [],
      rotation_rule: rotationRule,
      match_scores: {},
      bracket_results: {},
      current_round: 1
    }).then(() => fetchTournaments()); // Sync

    // Optimistic UI update
    setActiveTournaments(prev => [{
      id: tempId, name, format, status: 'Activo', courts, pairs, numGroups, rotationRule, timeElapsed: '0m',
      participants: participants || [], fixture, matchScores: {}, bracketResults: {}, currentRound: 1
    } as any, ...prev]);

    return tempId;
  };

  const updateTournament = async (tournament: Tournament) => {
    // Optimistic
    setActiveTournaments(prev => prev.map(t => t.id === tournament.id ? tournament : t));
    
    // Remote
    await supabase.from('tournaments').update({
      name: tournament.name,
      status: tournament.status,
      fixture: tournament.fixture,
      participants: tournament.participants,
      current_round: tournament.currentRound
    }).eq('id', tournament.id);
  };

  const deleteTournament = async (id: number) => {
    setActiveTournaments(prev => prev.filter(t => t.id !== id));
    await supabase.from('tournaments').delete().eq('id', id);
  };

  const updateBracketResult = async (tournamentId: number, matchId: string, winnerId: string) => {
    const tournament = activeTournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const newBracketResults = { ...(tournament.bracketResults || {}), [matchId]: winnerId };
    setActiveTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, bracketResults: newBracketResults } : t));
    
    await supabase.from('tournaments').update({ bracket_results: newBracketResults }).eq('id', tournamentId);
  };

  const confirmBracketPhase = async (tournamentId: number, size: number, participants: any[]) => {
    setActiveTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, bracketSize: size, bracketParticipants: participants } : t));
    await supabase.from('tournaments').update({ bracket_size: size, bracket_participants: participants }).eq('id', tournamentId);
  };

  const updateMatchScore = async (tournamentId: number, matchId: string, t1: number, t2: number) => {
    const tournament = activeTournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    const newMatchScores = { ...(tournament.matchScores || {}), [matchId]: { t1, t2 } };
    setActiveTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, matchScores: newMatchScores } : t));

    await supabase.from('tournaments').update({ match_scores: newMatchScores }).eq('id', tournamentId);
  };

  // Temporarily kept in memory if needed by UI
  const addInscriptionToTournament = (tournamentId: number, p1Name: string, p2Name: string, category: Category) => {
    // For full implementation, this should insert into the 'inscriptions' table
    setActiveTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          inscriptions: [...(t.inscriptions || []), { id: Math.random().toString(), p1Name, p2Name, category, date: 'Ahora' }]
        };
      }
      return t;
    }));
  };

  const removeInscriptionFromTournament = (tournamentId: number, pairId: string) => {
    setActiveTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return { ...t, inscriptions: (t.inscriptions || []).filter(p => p.id !== pairId) };
      }
      return t;
    }));
  };

  // --- Operaciones Padel-Cash (Supabase RPC) ---
  const submitYapePayment = async (userId: string, bookingDetails: YapeBookingDetails, screenshotUrl: string) => {
    // In a real flow, the UI should upload the image to Supabase Storage first and pass the URL
    await supabase.from('yape_payments').insert({
      user_id: userId,
      amount: bookingDetails.discountedPrice,
      status: 'pending',
      transaction_code: 'YAPE-' + Math.floor(Math.random()*10000),
      screenshot_url: screenshotUrl || 'https://via.placeholder.com/150'
    });
  };

  const approveYapePayment = async (paymentId: string) => {
    const { error } = await supabase.rpc('approve_yape_payment', { payment_id: paymentId });
    if (error) console.error("Error approving payment", error);
  };

  const rejectYapePayment = async (paymentId: string, reason: string) => {
    const { error } = await supabase.rpc('reject_yape_payment', { payment_id: paymentId, reason });
    if (error) console.error("Error rejecting payment", error);
  };

  const cancelPaidBooking = async (paymentId: string) => {
    // Implementation would ideally have an RPC to refund points/credit.
    // We will just reject for now if it was somehow approved and needs cancellation.
    console.warn("Cancellation logic requires complex point refund RPC, omitted for brevity");
  };

  const claimPointsCoupon = async (userId: string) => {
    // This should ideally insert a row into 'coupons' and deduct points via an RPC
    console.warn("Coupon claim logic omitted for brevity, needs RPC to prevent race conditions");
  };

  const setCurrentPadelUserById = (userId: string) => {
    const user = padelCashUsers.find(u => u.id === userId);
    if (user) setCurrentPadelUser(user);
  };

  return (
    <TournamentContext.Provider value={{
      registeredPairs, registerPair, deletePair,
      registeredPlayers, registerPlayer, deletePlayer,
      activeTournaments, createTournament, deleteTournament, updateTournament,
      updateBracketResult, confirmBracketPhase, updateMatchScore,
      addInscriptionToTournament, removeInscriptionFromTournament,
      padelCashUsers, yapePayments, currentPadelUser,
      submitYapePayment, approveYapePayment, rejectYapePayment, cancelPaidBooking, claimPointsCoupon, setCurrentPadelUserById
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) throw new Error('useTournaments must be used within a TournamentProvider');
  return context;
};
