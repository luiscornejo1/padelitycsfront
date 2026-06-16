import { createClient } from '@supabase/supabase-js';

// Las credenciales provienen de variables de entorno (NUNCA hardcodeadas).
// Configura estas variables en tu archivo .env.local
// Ejecuta `supabase start` para obtener los valores locales.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Padelitycs] Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY ' +
    'son requeridas. Crea un archivo .env.local con los valores de tu instancia de Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persiste la sesión en localStorage del navegador
    persistSession: true,
    // Detecta automáticamente la sesión en la URL tras redireccionamientos OAuth
    detectSessionInUrl: true,
    // Renueva automáticamente el token antes de que expire
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
