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
      className={`relative w-64 p-3 rounded-lg border flex items-center gap-3 transition-all ${
        isWinner 
        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
        : isRevealed 
          ? 'bg-slate-900 border-slate-700' 
          : 'bg-slate-950 border-slate-800'
      } ${isInteractive && isRevealed && participant ? 'cursor-pointer hover:border-blue-400 hover:bg-slate-800' : ''}`}
    >
      <div className="w-8 h-8 shrink-0 rounded bg-slate-950 flex items-center justify-center border border-slate-800 font-black text-xs text-slate-500">
        {participant?.seed || '-'}
      </div>
      <div className="flex-1 flex flex-col justify-center min-h-[40px]">
        {participant ? (
          <span className={`text-sm font-bold truncate ${isRevealed ? 'text-white' : 'text-slate-500 font-mono text-xs'}`}>
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
  isAdmin = false 
}: BracketGeneratorProps) {
  const isEight = participants.length > 4;

  const q1_p1 = isEight ? participants[0] : undefined;
  const q1_p2 = isEight ? participants[1] : undefined;
  const q2_p1 = isEight ? participants[2] : undefined;
  const q2_p2 = isEight ? participants[3] : undefined;
  const q3_p1 = isEight ? participants[4] : undefined;
  const q3_p2 = isEight ? participants[5] : undefined;
  const q4_p1 = isEight ? participants[6] : undefined;
  const q4_p2 = isEight ? participants[7] : undefined;

  const getWinner = (matchId: string, p1?: BracketParticipant, p2?: BracketParticipant) => {
    const wId = bracketResults[matchId];
    if (wId && p1 && wId === p1.id) return p1;
    if (wId && p2 && wId === p2.id) return p2;
    return undefined;
  };

  const handleSelect = (matchId: string, p?: BracketParticipant) => {
    if (isAdmin && onWinnerSelect && p) {
      onWinnerSelect(matchId, p.id);
    }
  };

  const s1_p1 = isEight ? getWinner('q1', q1_p1, q1_p2) : participants[0];
  const s1_p2 = isEight ? getWinner('q2', q2_p1, q2_p2) : participants[1];
  const s2_p1 = isEight ? getWinner('q3', q3_p1, q3_p2) : participants[2];
  const s2_p2 = isEight ? getWinner('q4', q4_p1, q4_p2) : participants[3];

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
    <div className="w-full flex flex-col items-center py-10 overflow-x-auto scrollbar-hide">
      <div className="flex items-start gap-16 min-w-max px-4 relative">
        
        {/* QUARTERFINALS COLUMN */}
        {isEight && (
          <div className="flex flex-col relative z-10 w-64">
            <div className="absolute top-[-30px] w-full text-center">
              <h4 className="text-sm font-black tracking-[0.3em] text-slate-500 uppercase">Cuartos</h4>
            </div>
            
            {/* Group 1 (Q1 & Q2) */}
            <div className="relative flex flex-col mb-[64px]">
              {renderMatch('q1', q1_p1, q1_p2)}
              <div className="h-[32px]" /> {/* Gap */}
              {renderMatch('q2', q2_p1, q2_p2)}
              
              {/* Bracket connector */}
              <div className="absolute right-[-32px] w-[32px] border-r-2 border-y-2 border-slate-700 rounded-r-lg z-0" style={{ top: '70px', height: '172px' }} />
              {/* Output line */}
              <div className="absolute right-[-64px] w-[32px] border-t-2 border-slate-700 z-0" style={{ top: '156px' }} />
            </div>

            {/* Group 2 (Q3 & Q4) */}
            <div className="relative flex flex-col">
              {renderMatch('q3', q3_p1, q3_p2)}
              <div className="h-[32px]" /> {/* Gap */}
              {renderMatch('q4', q4_p1, q4_p2)}
              
              {/* Bracket connector */}
              <div className="absolute right-[-32px] w-[32px] border-r-2 border-y-2 border-slate-700 rounded-r-lg z-0" style={{ top: '70px', height: '172px' }} />
              {/* Output line */}
              <div className="absolute right-[-64px] w-[32px] border-t-2 border-slate-700 z-0" style={{ top: '156px' }} />
            </div>
          </div>
        )}

        {/* SEMIFINALS COLUMN */}
        <div className="flex flex-col relative z-10 w-64" style={{ paddingTop: isEight ? '86px' : '0px' }}>
          <div className="absolute top-[-30px] w-full text-center">
            <h4 className="text-sm font-black tracking-[0.3em] text-slate-500 uppercase">Semifinales</h4>
          </div>
          
          <div className="relative flex flex-col">
            {renderMatch('s1', s1_p1, s1_p2)}
            <div style={{ height: isEight ? '236px' : '32px' }} /> {/* Gap */}
            {renderMatch('s2', s2_p1, s2_p2)}
            
            {/* Incoming lines (if Semis is the first column, no incoming lines) */}
            {isEight && (
               <>
                 <div className="absolute left-[-32px] w-[32px] border-t-2 border-slate-700 z-0" style={{ top: '70px' }} />
                 <div className="absolute left-[-32px] w-[32px] border-t-2 border-slate-700 z-0" style={{ top: '446px' }} />
               </>
            )}

            {/* Bracket connector */}
            <div className="absolute right-[-32px] w-[32px] border-r-2 border-y-2 border-slate-700 rounded-r-lg z-0" 
                 style={{ top: '70px', height: isEight ? '376px' : '172px' }} />
            {/* Output line */}
            <div className="absolute right-[-64px] w-[32px] border-t-2 border-slate-700 z-0" 
                 style={{ top: isEight ? '258px' : '156px' }} />
          </div>
        </div>

        {/* FINAL COLUMN */}
        <div className="flex flex-col relative z-10 w-64" style={{ paddingTop: isEight ? '188px' : '86px' }}>
          <div className="absolute top-[-30px] w-full text-center">
            <h4 className="text-sm font-black tracking-[0.3em] text-blue-500 uppercase">Gran Final</h4>
          </div>

          <div className="relative flex flex-col">
            {renderMatch('f', f_p1, f_p2)}
            
            {/* Incoming line */}
            <div className="absolute left-[-32px] w-[32px] border-t-2 border-slate-700 z-0" style={{ top: '70px' }} />
            
            {/* Output line to champion */}
            <div className="absolute right-[-32px] w-[32px] border-t-2 border-slate-700 z-0" style={{ top: '70px' }} />
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
            <div className="absolute left-[-32px] w-[32px] border-t-2 border-slate-700 z-0" style={{ top: '33px' }} />
          </div>
        </div>

      </div>
    </div>
  );
}
