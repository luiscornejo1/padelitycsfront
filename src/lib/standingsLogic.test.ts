import { describe, it, expect } from 'vitest';
import { getStandings, getStandingsByGroup } from './standingsLogic';

describe('standingsLogic', () => {
  describe('getStandings', () => {
    it('should calculate points (games won) and gamesAgainst correctly', () => {
      const group = {
        courtNumber: 1,
        pairs: [
          { id: '1', name: 'Team A' },
          { id: '2', name: 'Team B' }
        ],
        matches: [
          { team1: { id: '1' }, team2: { id: '2' } }
        ]
      };
      const matchScores = {
        'g1_m0': { t1: 6, t2: 4 }
      };

      const standings = getStandings(group, matchScores);

      const teamA = standings.find((s: any) => s.id === '1');
      const teamB = standings.find((s: any) => s.id === '2');

      expect(teamA.points).toBe(6);
      expect(teamA.gamesAgainst).toBe(4);
      expect(teamA.matchesPlayed).toBe(1);

      expect(teamB.points).toBe(4);
      expect(teamB.gamesAgainst).toBe(6);
      expect(teamB.matchesPlayed).toBe(1);
    });

    it('should sort by points descending, then by gamesAgainst ascending', () => {
      const group = {
        courtNumber: 1,
        pairs: [
          { id: '1', name: 'Team A' },
          { id: '2', name: 'Team B' },
          { id: '3', name: 'Team C' }
        ],
        matches: [
          { team1: { id: '1' }, team2: { id: '2' } }, // 1 vs 2
          { team1: { id: '1' }, team2: { id: '3' } }, // 1 vs 3
          { team1: { id: '2' }, team2: { id: '3' } }  // 2 vs 3
        ]
      };
      
      // Team A: 6-4, 4-6 -> points: 10, against: 10
      // Team B: 4-6, 6-2 -> points: 10, against: 8  (Should be 1st because 8 < 10)
      // Team C: 6-4, 2-6 -> points: 8, against: 10
      const matchScores = {
        'g1_m0': { t1: 6, t2: 4 }, // Team A wins 6-4 vs Team B
        'g1_m1': { t1: 4, t2: 6 }, // Team C wins 6-4 vs Team A
        'g1_m2': { t1: 6, t2: 2 }  // Team B wins 6-2 vs Team C
      };

      const standings = getStandings(group, matchScores);

      expect(standings[0].id).toBe('2'); // Team B
      expect(standings[1].id).toBe('1'); // Team A
      expect(standings[2].id).toBe('3'); // Team C
    });
  });

  describe('getStandingsByGroup', () => {
    it('should extract grouped standings correctly', () => {
      const activeT = {
        fixture: [
          { courtNumber: 1, courtName: 'Grupo A', pairs: [{ id: '1' }, { id: '2' }], matches: [] },
          { courtNumber: 2, courtName: 'Grupo B', pairs: [{ id: '3' }, { id: '4' }], matches: [] }
        ],
        matchScores: {}
      };

      const grouped = getStandingsByGroup(activeT);
      expect(grouped).toHaveLength(2);
      expect(grouped[0].courtName).toBe('Grupo A');
      expect(grouped[0].standings).toHaveLength(2);
      expect(grouped[1].courtName).toBe('Grupo B');
      expect(grouped[1].standings).toHaveLength(2);
    });
  });
});
