export type ViewState = 'overview' | 'detail' | 'americanos-live' | 'player-tv' | 'admin-login' | 'admin-dashboard' | 'padel-cash';

export function getInitialView(searchParams: URLSearchParams, storedView: string | null): ViewState {
  if (searchParams.get('view') === 'player-tv') return 'player-tv';
  if (storedView) return storedView as ViewState;
  return 'overview';
}
