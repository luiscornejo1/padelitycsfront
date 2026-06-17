import { describe, it, expect } from 'vitest';
import { getInitialView } from '../../src/utils/viewUtils';

describe('viewUtils - getInitialView', () => {
  it('should return player-tv if view=player-tv is in search params', () => {
    const searchParams = new URLSearchParams('?view=player-tv&id=123');
    expect(getInitialView(searchParams, null)).toBe('player-tv');
    expect(getInitialView(searchParams, 'admin-dashboard')).toBe('player-tv');
  });

  it('should return the stored view if present in localStorage and no url param overrides it', () => {
    const searchParams = new URLSearchParams('');
    expect(getInitialView(searchParams, 'admin-dashboard')).toBe('admin-dashboard');
    expect(getInitialView(searchParams, 'padel-cash')).toBe('padel-cash');
  });

  it('should default to overview if no url param and no stored view', () => {
    const searchParams = new URLSearchParams('');
    expect(getInitialView(searchParams, null)).toBe('overview');
  });
});
