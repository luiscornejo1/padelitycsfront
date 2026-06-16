export interface Pair {
  id: number | string;
  localId: number;
  player1: any;
  player2: any;
  teamElo: number;
  p1Name?: string;
  p2Name?: string;
  category?: string;
}

export interface CourtMatch {
  round: number;
  team1: Pair;
  team2: Pair;
}

export interface CourtGroup {
  courtNumber: number;
  courtName: string;
  pairs: Pair[];
  matches: CourtMatch[];
}

export function generateAmericanoFixture(
  inscriptions: any[], 
  _format: 'americano' | 'mexicano' | 'romano' | 'personalizado',
  numCourts: number,
  customPairs: number
): CourtGroup[] {
  // 1. Convert inscriptions to internal Pair structure
  const sortedPairs: Pair[] = inscriptions.map((rp, index) => ({
    id: 1000 + index,
    localId: 0,
    player1: { id: `p1-${index}`, name: rp.p1Name, category: rp.category, elo: 1500 },
    player2: { id: `p2-${index}`, name: rp.p2Name, category: rp.category, elo: 1500 },
    teamElo: 1500
  })).slice(0, customPairs);

  const groups: CourtGroup[] = [];

  // Determine actual courts to use. We need at least 2 pairs per court to have a match.
  // Ideally, an americano has 3 or 4 pairs per court.
  let actualCourts = numCourts;
  if (customPairs / numCourts < 2) {
    actualCourts = Math.max(1, Math.floor(customPairs / 3) || 1);
  }
  
  const pairsPerGroup = Math.ceil(customPairs / actualCourts);

  for (let c = 0; c < actualCourts; c++) {
    const courtPairs = sortedPairs.slice(c * pairsPerGroup, c * pairsPerGroup + pairsPerGroup).map((p, idx) => ({
      ...p,
      localId: idx + 1
    }));

    const m = courtPairs;
    const matches: CourtMatch[] = [];

    const buildOneRoundRobinCycle = (teams: typeof m, roundOffset: number): CourtMatch[] => {
      const cycleMatches: CourtMatch[] = [];
      const N = teams.length % 2 === 0 ? teams.length : teams.length + 1; // force even
      const seats = Array.from({ length: N }, (_, i) => i);

      for (let round = 0; round < N - 1; round++) {
        for (let k = 0; k < N / 2; k++) {
          const a = seats[k];
          const b = seats[N - 1 - k];
          const teamA = teams[a];
          const teamB = teams[b];
          if (teamA && teamB && a < teams.length && b < teams.length) {
            cycleMatches.push({ round: roundOffset + round + 1, team1: teamA, team2: teamB });
          }
        }
        const last = seats[N - 1];
        for (let i = N - 1; i > 1; i--) seats[i] = seats[i - 1];
        seats[1] = last;
      }
      return cycleMatches;
    };

    if (m.length >= 2) {
      const matchesPerPairPerCycle = m.length - 1;
      const MIN_MATCHES_PER_PAIR = 3; 
      const cyclesNeeded = Math.ceil(MIN_MATCHES_PER_PAIR / matchesPerPairPerCycle);

      for (let cycle = 0; cycle < cyclesNeeded; cycle++) {
        const cycleTeams = cycle === 0 ? [...m] : [...m].sort(() => Math.random() - 0.5);
        const cycleMatches = buildOneRoundRobinCycle(cycleTeams, cycle * (m.length % 2 === 0 ? m.length - 1 : m.length));
        matches.push(...cycleMatches);
      }
    }

    groups.push({
      courtNumber: c + 1,
      courtName: `Cancha ${c + 1}`,
      pairs: courtPairs,
      matches
    });
  }

  return groups;
}

export function generateGroupStageFixture(
  inscriptions: any[],
  numGroups: number
): CourtGroup[] {
  // Shuffle inscriptions to ensure random distribution
  const shuffled = [...inscriptions].sort(() => Math.random() - 0.5);
  
  const sortedPairs: Pair[] = shuffled.map((rp, index) => ({
    id: 1000 + index,
    localId: 0,
    player1: { id: `p1-${index}`, name: rp.p1Name, category: rp.category, elo: 1500 },
    player2: { id: `p2-${index}`, name: rp.p2Name, category: rp.category, elo: 1500 },
    teamElo: 1500,
    p1Name: rp.p1Name,
    p2Name: rp.p2Name
  }));

  const groups: CourtGroup[] = [];
  
  // Initialize empty groups
  for (let i = 0; i < numGroups; i++) {
    const groupLetter = String.fromCharCode(65 + i); // 0=A, 1=B, 2=C...
    groups.push({
      courtNumber: i + 1,
      courtName: `Grupo ${groupLetter}`,
      pairs: [],
      matches: []
    });
  }

  // Distribute pairs to groups (snake draft or sequential)
  sortedPairs.forEach((pair, idx) => {
    groups[idx % numGroups].pairs.push(pair);
  });

  // Generate Round Robin for each group
  groups.forEach(group => {
    const m = group.pairs;
    const matches: CourtMatch[] = [];
    let matchCounter = 0;

    for (let i = 0; i < m.length; i++) {
      for (let j = i + 1; j < m.length; j++) {
        matches.push({
          round: matchCounter + 1,
          team1: m[i],
          team2: m[j]
        });
        matchCounter++;
      }
    }
    
    // Shuffle the matches so someone doesn't play 2 matches back to back if possible
    group.matches = matches.sort(() => Math.random() - 0.5);
  });

  return groups;
}
