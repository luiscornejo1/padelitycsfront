# Padelitycs — Guía de Setup Local con Supabase

## Requisitos Previos

1. **Docker Desktop** instalado y corriendo
2. **Supabase CLI** instalado:
   ```powershell
   # En Windows (con winget)
   winget install Supabase.CLI
   
   # O con npm (alternativa)
   npm install -g supabase
   ```
3. **Node.js 18+**

---

## Paso 1: Iniciar Supabase Local

```powershell
cd "C:\Users\luisc\OneDrive\Escritorio\Padelitycs"

# Inicia la instancia local de Supabase (la primera vez descarga imágenes Docker)
supabase start
```

Al finalizar, obtendrás un output como este:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Anon key: eyJhbGciO...  ← COPIA ESTO
Service role key: eyJhbGciO...  ← COPIA ESTO PARA LOS TESTS
```

---

## Paso 2: Configurar Variables de Entorno

Crea (o edita) el archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<pega tu anon key aquí>

# Solo para los tests de seguridad RLS
SUPABASE_SERVICE_ROLE_KEY=<pega tu service role key aquí>
```

> ⚠️ NUNCA subas `.env.local` a Git. Ya está en `.gitignore`.

---

## Paso 3: Aplicar Migraciones (Crear las Tablas)

```powershell
supabase db push
```

Esto aplicará automáticamente todos los archivos de la carpeta `supabase/migrations/` en orden:
- `20260616223500_init_schema.sql` — Crea todas las tablas
- `20260616230000_rls_policies.sql` — Activa RLS con todas las políticas de seguridad

---

## Paso 4: Correr la App

```powershell
npm run dev
```

---

## Paso 5: Verificar la Seguridad RLS

```powershell
node --env-file=.env.local tests/rls-security.test.mjs
```

Deberías ver todos los tests en ✅ PASS.

---

## Configurar Google Auth (OAuth)

1. Ve a [Supabase Studio local](http://127.0.0.1:54323) → **Authentication** → **Providers**
2. Habilita **Google**
3. Sigue las instrucciones para crear credenciales OAuth en [Google Cloud Console](https://console.cloud.google.com)
4. Agrega la URL de callback: `http://127.0.0.1:54321/auth/v1/callback`

---

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `supabase start` | Inicia el entorno local |
| `supabase stop` | Detiene el entorno local |
| `supabase status` | Muestra las URLs y claves actuales |
| `supabase db reset` | Reinicia la DB y aplica todas las migraciones desde cero |
| `supabase studio` | Abre el panel de administración en el browser |

---

## Estructura del Proyecto (Backend)

```
supabase/
  config.toml              ← Configuración del proyecto Supabase
  migrations/
    20260616223500_init_schema.sql     ← Tablas: profiles, yape_payments, etc.
    20260616230000_rls_policies.sql    ← Seguridad RLS + funciones seguras

src/
  lib/
    supabaseClient.ts      ← Cliente Supabase (usa .env.local, NUNCA hardcodeado)
  context/
    AuthContext.tsx        ← Estado global de autenticación (Google/Email/SMS)
  components/
    AuthModal.tsx          ← UI de Login/Registro

tests/
  rls-security.test.mjs   ← Prueba objetiva que ningún jugador puede hackear su saldo
```
