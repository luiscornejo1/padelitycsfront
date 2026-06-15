import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export interface BracketParticipant {
  id: string;
  name: string;
  seed: string;
}

interface BracketGeneratorProps {
  participants: BracketParticipant[];
  bracketResults?: Record<string, string>; // matchId -> winnerId
  onWinnerSelect?: (matchId: string, winnerId: string) => void;
  isAdmin?: boolean;
  size?: number; // 4 or 8
}

const ROULETTE_NAMES = [
  'Calculando...', 'Sorteando...', 'Analizando...', 'Cruzando...', 'Buscando...',
  'Emparejando...', 'Asignando...', 'Preparando...'
];

const BracketSlot = ({ 
  participant, 
  delay, 
  isWinner = false,
  onClick,
  isInteractive = false
}: { 
  participant?: BracketParticipant; 
  delay: number;
  isWinner?: boolean;
  onClick?: () => void;
  isInteractive?: boolean;
}) => {
  const [displayNames, setDisplayNames] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (!participant) {
      setDisplayNames('');
      setIsRevealed(false);
      return;
    }

    if (delay === 0) {
      setDisplayNames(participant.name);
      setIsRevealed(true);
      return;
    }

    const startDelay = setTimeout(() => {
      let ticks = 0;
      const interval = setInterval(() => {
        setDisplayNames(ROULETTE_NAMES[Math.floor(Math.random() * ROULETTE_NAMES.length)]);
        ticks++;
        if (ticks > 10) {
          clearInterval(interval);
          setDisplayNames(participant.name);
          setIsRevealed(true);
        }
      }, 80);
      
      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(startDelay);
  }, [participant, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      onClick={isInteractive && isRevealed && participant ? onClick : undefined}
      className={`relative w-64 p-3 rounded-lg border flex items-center gap-3 transition-all duration-300 ${
        isWinner 
        ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
        : isRevealed 
          ? 'bg-[#0F172A] border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
          : 'bg-[#0B1120] border-blue-900/40'
      } ${isInteractive && isRevealed && participant ? 'cursor-pointer hover:border-blue-400 hover:bg-[#1E293B] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]' : ''}`}
    >
      <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center border font-black text-[11px] ${isRevealed ? 'bg-blue-900/50 border-blue-500/50 text-white shadow-inner' : 'bg-[#0B1120] border-blue-900/50 text-slate-600'}`}>
        {participant?.seed || '-'}
      </div>
      <div className="flex-1 flex flex-col justify-center min-h-[40px] min-w-0">
        {participant ? (
          <span className={`text-sm font-bold truncate block w-full ${isRevealed ? 'text-white' : 'text-slate-400 tracking-widest font-mono text-xs'}`}>
            {displayNames}
          </span>
        ) : (
          <span className="text-slate-700 font-mono text-xs">Por definir</span>
        )}
      </div>
    </motion.div>
  );
};

export default function BracketGenerator({ 
  participants, 
  bracketResults = {}, 
  onWinnerSelect,
  isAdmin = false,
  size = 8
}: BracketGeneratorProps) {
  const isEight = size === 8;

  // We assume participants array has already been sized/shuffled appropriately by the parent,
  // but we pad it just in case so we don't break.
  const paddedParticipants = [...participants];
  while (paddedParticipants.length < size) {
    paddedParticipants.push({ id: `bye-${paddedParticipants.length}`, name: 'BYE (Pasa Directo)', seed: '-' });
  }

  const q1_p1 = isEight ? paddedParticipants[0] : undefined;
  const q1_p2 = isEight ? paddedParticipants[1] : undefined;
  const q2_p1 = isEight ? paddedParticipants[2] : undefined;
  const q2_p2 = isEight ? paddedParticipants[3] : undefined;
  const q3_p1 = isEight ? paddedParticipants[4] : undefined;
  const q3_p2 = isEight ? paddedParticipants[5] : undefined;
  const q4_p1 = isEight ? paddedParticipants[6] : undefined;
  const q4_p2 = isEight ? paddedParticipants[7] : undefined;

  const getWinner = (matchId: string, p1?: BracketParticipant, p2?: BracketParticipant) => {
    const wId = bracketResults[matchId];
    if (wId && p1 && wId === p1.id) return p1;
    if (wId && p2 && wId === p2.id) return p2;
    
    // Auto-advance if playing against BYE
    if (p1 && p2?.name.includes('BYE')) return p1;
    if (p2 && p1?.name.includes('BYE')) return p2;
    
    return undefined;
  };

  const handleSelect = (matchId: string, p?: BracketParticipant) => {
    if (isAdmin && onWinnerSelect && p) {
      onWinnerSelect(matchId, p.id);
    }
  };

  const s1_p1 = isEight ? getWinner('q1', q1_p1, q1_p2) : paddedParticipants[0];
  const s1_p2 = isEight ? getWinner('q2', q2_p1, q2_p2) : paddedParticipants[1];
  const s2_p1 = isEight ? getWinner('q3', q3_p1, q3_p2) : paddedParticipants[2];
  const s2_p2 = isEight ? getWinner('q4', q4_p1, q4_p2) : paddedParticipants[3];

  const f_p1 = getWinner('s1', s1_p1, s1_p2);
  const f_p2 = getWinner('s2', s2_p1, s2_p2);

  const champion = getWinner('f', f_p1, f_p2);

  // Helper to render a match (140px height)
  const renderMatch = (matchId: string, p1?: BracketParticipant, p2?: BracketParticipant) => (
    <div className="flex flex-col gap-2 relative z-10 w-64 h-[140px]">
      <BracketSlot participant={p1} delay={0.2} onClick={() => handleSelect(matchId, p1)} isInteractive={isAdmin} isWinner={bracketResults[matchId] === p1?.id} />
      <BracketSlot participant={p2} delay={0.4} onClick={() => handleSelect(matchId, p2)} isInteractive={isAdmin} isWinner={bracketResults[matchId] === p2?.id} />
    </div>
  );

  return (
    <div className="w-full overflow-x-auto pb-12 pt-16 custom-scrollbar">
      <div className="flex items-start gap-16 min-w-max px-8 mx-auto w-max relative">
        
        {/* QUARTERFINALS COLUMN */}
        {isEight && (
          <div className="flex flex-col relative z-10 w-64">
            <div className="absolute top-[-30px] w-full text-center">
              <h4 className="text-sm font-black tracking-[0.3em] text-slate-400 tracking-widest uppercase">Cuartos</h4>
            </div>
            
            {/* Group 1 (Q1 & Q2) */}
            <div className="relative flex flex-col mb-[64px]">
              {renderMatch('q1', q1_p1, q1_p2)}
              <div className="h-[32px]" /> {/* Gap */}
              {renderMatch('q2', q2_p1, q2_p2)}
              
              {/* Bracket connector */}
              <div className="absolute right-[-32px] w-[32px] border-r-2 border-y-2 border-blue-500/30 rounded-r-lg z-0" style={{ top: '70px', height: '172px' }} />
              {/* Output line */}
              <div className="absolute right-[-64px] w-[32px] border-t-2 border-blue-500/30 z-0" style={{ top: '156px' }} />
            </div>

            {/* Group 2 (Q3 & Q4) */}
            <div className="relative flex flex-col">
              {renderMatch('q3', q3_p1, q3_p2)}
              <div className="h-[32px]" /> {/* Gap */}
              {renderMatch('q4', q4_p1, q4_p2)}
              
              {/* Bracket connector */}
              <div className="absolute right-[-32px] w-[32px] border-r-2 border-y-2 border-blue-500/30 rounded-r-lg z-0" style={{ top: '70px', height: '172px' }} />
              {/* Output line */}
              <div className="absolute right-[-64px] w-[32px] border-t-2 border-blue-500/30 z-0" style={{ top: '156px' }} />
            </div>
          </div>
        )}

        {/* SEMIFINALS COLUMN */}
        <div className="flex flex-col relative z-10 w-64" style={{ paddingTop: isEight ? '86px' : '0px' }}>
          <div className="absolute top-[-30px] w-full text-center">
            <h4 className="text-sm font-black tracking-[0.3em] text-slate-400 tracking-widest uppercase">Semifinales</h4>
          </div>
          
          <div className="relative flex flex-col">
            {renderMatch('s1', s1_p1, s1_p2)}
            <div style={{ height: isEight ? '236px' : '32px' }} /> {/* Gap */}
            {renderMatch('s2', s2_p1, s2_p2)}
            
            {/* Incoming lines (if Semis is the first column, no incoming lines) */}
            {isEight && (
               <>
                 <div className="absolute left-[-32px] w-[32px] border-t-2 border-blue-500/30 z-0" style={{ top: '70px' }} />
                 <div className="absolute left-[-32px] w-[32px] border-t-2 border-blue-500/30 z-0" style={{ top: '446px' }} />
               </>
            )}

            {/* Bracket connector */}
            <div className="absolute right-[-32px] w-[32px] border-r-2 border-y-2 border-blue-500/30 rounded-r-lg z-0" 
                 style={{ top: '70px', height: isEight ? '376px' : '172px' }} />
            {/* Output line */}
            <div className="absolute right-[-64px] w-[32px] border-t-2 border-blue-500/30 z-0" 
                 style={{ top: isEight ? '258px' : '156px' }} />
          </div>
        </div>

        {/* FINAL COLUMN */}
        <div className="flex flex-col relative z-10 w-64" style={{ paddingTop: isEight ? '188px' : '86px' }}>
          <div className="absolute top-[-30px] w-full text-center">
            <h4 className="text-sm font-black tracking-[0.3em] text-brand-green uppercase">Gran Final</h4>
          </div>

          <div className="relative flex flex-col">
            {renderMatch('f', f_p1, f_p2)}
            
            {/* Incoming line */}
            <div className="absolute left-[-32px] w-[32px] border-t-2 border-blue-500/30 z-0" style={{ top: '70px' }} />
            
            {/* Output line to champion */}
            <div className="absolute right-[-32px] w-[32px] border-t-2 border-blue-500/30 z-0" style={{ top: '70px' }} />
          </div>
        </div>

        {/* CHAMPION COLUMN */}
        <div className="flex flex-col relative z-10 w-64" style={{ paddingTop: isEight ? '225px' : '123px' }}>
          <div className="absolute top-[-30px] w-full text-center flex justify-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          
          <div className="relative flex flex-col">
            <BracketSlot participant={champion} isWinner delay={0} />
            {/* Incoming line */}
            <div className="absolute left-[-32px] w-[32px] border-t-2 border-blue-500/30 z-0" style={{ top: '33px' }} />
          </div>
        </div>

        {/* Spacer for scroll margin */}
        <div className="w-8 shrink-0" />

      </div>
    </div>
  );
}
