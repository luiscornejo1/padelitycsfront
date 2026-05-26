export interface Player {
  id: string;
  name: string;
  elo: number;
  winRate: number;
  matches: number;
  side: 'Drive' | 'Revés';
  bestShot: string;
  trend: 'up' | 'down' | 'same';
}

export type Gender = 'Masculino' | 'Femenino';
export type Category = '1era' | '2da' | '3ra' | '4ta' | '5ta' | '6ta';
export type ViewState = 'overview' | 'detail' | 'onboarding' | 'americanos-live' | 'admin-dashboard' | 'admin-login';

export const CATEGORIES: Category[] = ['1era', '2da', '3ra', '4ta', '5ta', '6ta'];

export const SHOTS = ['Víbora', 'Remate x3', 'Bandeja', 'Chiquita', 'Globo', 'Bajada de pared', 'Volea', 'Dejada'];

const NAMES_M = ['Carlos', 'Luis', 'Jorge', 'Fernando', 'Alejandro', 'Roberto', 'Miguel', 'Daniel', 'Andrés', 'Diego', 'Martín', 'Hugo', 'Julio', 'Pedro', 'Santiago', 'Ricardo', 'Manuel', 'Javier', 'Renato', 'Víctor'];
const NAMES_F = ['Ana', 'María', 'Lucía', 'Sofía', 'Martina', 'Valeria', 'Camila', 'Elena', 'Carmen', 'Laura', 'Isabella', 'Daniela', 'Marta', 'Paula', 'Julia', 'Andrea', 'Rosa', 'Clara', 'Sara', 'Victoria'];
const LAST_NAMES = ['Mendoza', 'Cárdenas', 'Villar', 'Paz', 'Cruz', 'Luna', 'Soto', 'Ríos', 'Silva', 'Torres', 'Vera', 'Ramos', 'Navarro', 'Castro', 'Ruiz', 'Díaz', 'Vega', 'León', 'Rojas', 'Peña'];

const generateMockPlayers = (gender: Gender, baseElo: number, count: number): Player[] => {
  const names = gender === 'Masculino' ? NAMES_M : NAMES_F;
  return Array.from({ length: count }).map((_, i) => ({
    id: `${gender}-${baseElo}-${i}`,
    name: `${names[(baseElo + i) % names.length]} ${LAST_NAMES[(baseElo * 2 + i) % LAST_NAMES.length]}`,
    elo: baseElo - (i * 15 + (i % 3) * 5),
    winRate: Math.max(85 - i * 2, 45),
    matches: Math.max(120 - i * 3, 15),
    side: (baseElo + i) % 2 === 0 ? 'Drive' : 'Revés',
    bestShot: SHOTS[(baseElo + i) % SHOTS.length],
    trend: i % 5 === 0 ? 'up' : i % 4 === 0 ? 'down' : 'same',
  }));
};

export const MOCK_DATA: Record<Gender, Record<Category, Player[]>> = {
  Masculino: {
    '1era': generateMockPlayers('Masculino', 2200, 15),
    '2da': generateMockPlayers('Masculino', 1900, 18),
    '3ra': generateMockPlayers('Masculino', 1600, 20),
    '4ta': generateMockPlayers('Masculino', 1400, 25),
    '5ta': generateMockPlayers('Masculino', 1200, 30),
    '6ta': generateMockPlayers('Masculino', 1000, 35),
  },
  Femenino: {
    '1era': generateMockPlayers('Femenino', 2150, 12),
    '2da': generateMockPlayers('Femenino', 1850, 15),
    '3ra': generateMockPlayers('Femenino', 1550, 18),
    '4ta': generateMockPlayers('Femenino', 1350, 20),
    '5ta': generateMockPlayers('Femenino', 1150, 25),
    '6ta': generateMockPlayers('Femenino', 950, 30),
  },
};

export const NEWS_MOCK = [
  {
    id: 1,
    title: 'Pareja Mendoza/Luna se coronan campeones del Americano de 5ta Categoría',
    excerpt: 'Una final de infarto que se decidió en el tie-break del tercer set en The Urban Padel Hub.',
    image: 'https://images.unsplash.com/photo-1622279457486-640c43431653?q=80&w=600&auto=format&fit=crop',
    date: 'Hace 2 días',
  },
  {
    id: 2,
    title: 'Resumen del torneo de fin de semana en Padel Club Trujillo',
    excerpt: 'Más de 50 parejas se dieron cita en el torneo de otoño. Revisa los resultados y subidas de ELO.',
    image: 'https://images.unsplash.com/photo-1622279261882-965a38bb0f1c?q=80&w=600&auto=format&fit=crop',
    date: 'Hace 4 días',
  },
  {
    id: 3,
    title: 'Nueva actualización de categorías: 15 jugadores ascienden a 3ra',
    excerpt: 'El nivel competitivo en la ciudad sigue subiendo. Felicitamos a los jugadores que han mejorado su rango.',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34d8?q=80&w=600&auto=format&fit=crop',
    date: 'Hace 1 semana',
  },
];
