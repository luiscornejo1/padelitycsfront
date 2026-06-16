# Handoff Report — Explorer Exploration

This handoff details the findings from the exploration of the Padelitycs repository (`c:\Users\luisc\OneDrive\Escritorio\Padelitycs`), mapping local state patterns, entity structures, authentication mocks, and detailing the path to migrate the project to local Supabase running in Docker.

## 1. Observation

- **State and local storage**:
  - `src/context/TournamentContext.tsx` contains definitions for React state variables and effect hooks syncing to `localStorage`.
    - Line 87-91:
      ```typescript
      const storedPairs = localStorage.getItem('padelitycs_pairs');
      const storedPlayers = localStorage.getItem('padelitycs_players');
      const storedTournaments = localStorage.getItem('padelitycs_tournaments');
      const storedCashUsers = localStorage.getItem('padelitycs_cash_users');
      const storedYapePayments = localStorage.getItem('padelitycs_yape_payments');
      ```
    - Lines 185-213 contain `useEffect` hooks saving state updates back to `localStorage`.
    - Lines 216-232 listen to the HTML5 `storage` event to sync cash users and payments across tabs.
  - Other views read/write `localStorage` directly or using `useLocalStorage` (`src/hooks/useLocalStorage.ts`):
    - `src/components/admin/MicPadelLeagueView.tsx`: `localStorage.getItem('padelitycs_mpl_tournament')`, etc.
    - `src/components/admin/InventoryPOSView.tsx`: `useLocalStorage<Product[]>('padel_inventory_products', ...)`
    - `src/components/admin/InscriptionsView.tsx`: `useLocalStorage<Inscription[]>('americano-inscriptions-v2', ...)`
    - `src/components/admin/AdminDashboard.tsx`: `useLocalStorage<number>('padel_total_revenue', 0)`

- **Entity structures and types**:
  - `src/types/padelCashTypes.ts` defines `PadelCashCoupon`, `PadelCashUser`, `YapeBookingDetails`, and `YapePaymentRequest`.
    - Lines 11-19:
      ```typescript
      export interface PadelCashUser {
        id: string;
        name: string;
        phone: string;
        points: number;
        completedReservationsCount: number;
        level: PadelUserLevel;
        coupons: PadelCashCoupon[];
      }
      ```
    - Lines 31-40:
      ```typescript
      export interface YapePaymentRequest {
        id: string;
        userId: string;
        userName: string;
        bookingDetails: YapeBookingDetails;
        screenshotUrl: string;
        status: YapePaymentStatus;
        rejectionReason?: string;
        dateCreated: string;
      }
      ```

- **Authentication & Authorization**:
  - Simulated inside `src/components/admin/AdminLogin.tsx`.
    - Lines 23-31:
      ```typescript
      setTimeout(() => {
        // Very basic mock validation
        if (email && password) {
          onLoginSuccess();
        } else {
          setError('Por favor, ingresa correo y contraseña.');
          setIsLoading(false);
        }
      }, 1500);
      ```
  - App state routing inside `src/App.tsx` controls whether admin dashboard or player views are loaded using a simple `view` state hook:
    - Line 18-22:
      ```typescript
      const getInitialView = (): 'overview' | 'detail' | 'americanos-live' | 'player-tv' | 'admin-login' | 'admin-dashboard' | 'padel-cash' => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'player-tv') return 'player-tv';
        return 'overview';
      };
      ```

- **Build and tests setup**:
  - Running `npx vitest run` triggers:
    ```
    ✓ src/lib/standingsLogic.test.ts (3 tests) 2ms
    Test Files  1 passed (1)
    Tests  3 passed (3)
    ```
  - Running `npm run build` generates static assets in `dist/` cleanly:
    ```
    dist/index.html                             1.03 kB
    dist/assets/index-DWQFHc0G.css            113.82 kB
    dist/assets/fixtureGenerator-D-asie3F.js    1.63 kB
    dist/assets/index-BE5uUF_g.js             616.44 kB
    ✓ built in 215ms
    ```

## 2. Logic Chain

1. **Observations on local storage** (`TournamentContext.tsx`, `MicPadelLeagueView.tsx`, `InventoryPOSView.tsx`) show that state is currently persisted per-browser locally. 
2. Therefore, to sync multiple users and devices (such as a customer reserving and an admin approving in separate browsers), we must migrate all state storage from `localStorage`/`useLocalStorage` to a central database backend.
3. **Observations on types** (`PadelCashUser`, `YapePaymentRequest`, `YapeBookingDetails`) provide the exact column definitions required for the backend PostgreSQL database schema (`profiles`, `reservations`, `yape_payments`, `coupons`).
4. **Observations on authentication** (`AdminLogin.tsx`, `App.tsx`) show that there is no session token handling or server-side authorization checks. Therefore, to ensure data security and implement Row-Level Security (RLS) policies, we must integrate Supabase Auth in the frontend and replace mock login forms with real auth operations.
5. **Observations on build and tests** show that the project contains a fully operational development pipeline using Vite and unit tests via Vitest. Any backend changes to context logic can be verified by running the build pipeline and extending the test suites.

## 3. Caveats

- **No existing Supabase files**: We did not locate any config files for Supabase CLI (`supabase/config.toml`) or migration SQL files. They need to be created from scratch in the next milestone.
- **Mock image handling**: In the client reservation portal (`PadelCashPortal.tsx`), the Yape screenshot is generated dynamically as a canvas image. In production, this needs to hook into a file uploader that posts to Supabase Storage, updating the database record with the public storage URL.

## 4. Conclusion

The Padelitycs frontend is ready for a Supabase migration. The current architecture separates views and data contexts well. By rewriting `TournamentContext.tsx` to handle async queries/mutations and real-time subscription channels, replacing `AdminLogin.tsx` authentication with Supabase Auth, and writing PostgreSQL schemas that map the current Typescript entities, the application will successfully transition to a secure and synchronized multiplayer state.

## 5. Verification Method

To independently verify the explorer mapping:
1. **Verify build stability**: Run `npm run build` to ensure the compilation completes without error.
2. **Verify tests suite**: Run `npx vitest run` to make sure existing standings logic is verified.
3. **Inspect analysis mapping**: Review the complete file-by-file changes and keys inventory in `analysis.md` in the current folder (`.agents/explorer_exploration/analysis.md`).
