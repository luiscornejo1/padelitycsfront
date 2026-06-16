# Padelitycs Code Exploration & Mapping Report

This analysis maps the existing frontend code of the Padelitycs repository (`c:\Users\luisc\OneDrive\Escritorio\Padelitycs`) to lay the groundwork for a transition from localized browser state to a Docker-hosted Supabase backend database, incorporating Row-Level Security (RLS) and real-time synchronization.

---

## 1. Database-Like State Definition & Usage

State persistence is currently handled entirely client-side using `localStorage` and React Context. There is no backend database.

### 1.1 LocalStorage Keys & Data Owners
The application saves and loads state using the following `localStorage` keys:

| Key | Description | Owner File |
|---|---|---|
| `padelitycs_pairs` | Registered tournament pairs | `TournamentContext.tsx` |
| `padelitycs_players` | Registered single players | `TournamentContext.tsx` |
| `padelitycs_tournaments` | Active tournament setups and brackets | `TournamentContext.tsx` |
| `padelitycs_cash_users` | Player profiles, points, level, and coupons | `TournamentContext.tsx` |
| `padelitycs_yape_payments` | Yape payment requests (acting as reservations) | `TournamentContext.tsx` |
| `americano-inscriptions-v2` | User inscriptions for americano tournaments | `InscriptionsView.tsx`, `AdminTournamentGenerator.tsx` |
| `padel_total_revenue` | Shift/POS sales revenue tracking | `AdminDashboard.tsx`, `InventoryPOSView.tsx` |
| `padel_inventory_products` | POS inventory items stock and pricing | `InventoryPOSView.tsx` |
| `padelitycs_mpl_tournament` | Mic Padel League Tournament details | `MicPadelLeagueView.tsx` |
| `padelitycs_mpl_stage` | Mic Padel League active stage | `MicPadelLeagueView.tsx` |
| `padelitycs_mpl_players` | Mic Padel League registered players | `MicPadelLeagueView.tsx` |
| `padelitycs_mpl_player_count` | Mic Padel League participant count | `MicPadelLeagueView.tsx` |

### 1.2 State Management & Hooks
- **`TournamentContext.tsx`**: Defines `TournamentProvider` which mounts React state hooks for pairs, players, tournaments, cash users, and payment requests. On initialization, it reads from `localStorage`.
- **`useLocalStorage.ts`**: A custom wrapper around `useState` and `localStorage` that dispatches a custom `'local-storage'` event window-wide to keep different parts of the UI synced in the same browser window.
- **Cross-Tab Synchronization**: In `TournamentContext.tsx`, an effect listens to the standard HTML5 `'storage'` event to update state instantly in client tabs if changed in the admin tab:
  ```typescript
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'padelitycs_cash_users' && e.newValue) { ... }
      if (e.key === 'padelitycs_yape_payments' && e.newValue) { ... }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  ```

---

## 2. Structure and Types of Local Entities

All types are defined in TypeScript. Below is the mapping of local schemas that must be converted to Supabase tables.

### 2.1 Profiles / Users (`PadelCashUser`)
Mapped from `src/types/padelCashTypes.ts`:
```typescript
export type PadelUserLevel = 'bronce' | 'plata' | 'oro';

export interface PadelCashUser {
  id: string;                          // Will map to auth.users.id (UUID)
  name: string;                        // Will map to profiles.full_name
  phone: string;                       // Will map to profiles.phone
  points: number;                      // Will map to profiles.points
  completedReservationsCount: number;  // Will map to profiles.completed_reservations_count
  level: PadelUserLevel;               // Will map to profiles.level
  coupons: PadelCashCoupon[];          // Will map to a separate table `coupons` linked by user_id
}
```

### 2.2 Coupons (`PadelCashCoupon`)
Mapped from `src/types/padelCashTypes.ts`:
```typescript
export interface PadelCashCoupon {
  code: string;                        // Will map to coupons.code (Primary Key)
  value: number;                       // Will map to coupons.value (numeric)
  type: 'discount' | 'credit_virtual' | 'free_court'; // Will map to coupons.type (text/enum)
  isUsed: boolean;                     // Will map to coupons.is_used (boolean)
  dateCreated: string;                 // Will map to coupons.created_at (timestamptz)
}
```

### 2.3 Reservations & Payments (`YapePaymentRequest` & `YapeBookingDetails`)
Represented in frontend as a payment request linked to court booking details.
Mapped from `src/types/padelCashTypes.ts`:
```typescript
export interface YapeBookingDetails {
  court: string;                       // Will map to reservations.court_id (or court table)
  date: string;                        // Will map to reservations.date
  time: string;                        // Will map to reservations.start_time / end_time
  originalPrice: number;
  discountedPrice: number;             // Will map to yape_payments.amount
}

export type YapePaymentStatus = 'pending' | 'approved' | 'rejected';

export interface YapePaymentRequest {
  id: string;                          // Will map to yape_payments.id (or transaction_code)
  userId: string;                      // Will map to reservations.user_id / yape_payments.user_id
  userName: string;                    // Derived from profiles (joined query)
  bookingDetails: YapeBookingDetails;  // Mapped to reservations
  screenshotUrl: string;               // Will map to yape_payments.screenshot_url (or storage bucket path)
  status: YapePaymentStatus;           // Will map to yape_payments.status / reservations.status
  rejectionReason?: string;            // Will map to yape_payments.rejection_reason
  dateCreated: string;                 // Will map to yape_payments.created_at
}
```

### 2.4 Tournament & Inscriptions Entities
Mapped from `src/context/TournamentContext.tsx` and `src/components/admin/InscriptionsView.tsx`:
```typescript
export interface RegisteredPair {
  id: string;                          // Will map to tournament_pairs.id
  p1Name: string;
  p2Name: string;
  category: Category;
  date: string;
}

export interface RegisteredPlayer {
  id: string;                          // Will map to players.id
  name: string;
  category: Category;
  date: string;
}

interface Inscription {
  id: string;                          // Will map to tournament_inscriptions.id
  p1Name: string;
  p2Name: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'reserved';
}
```

---

## 3. Authentication & Authorization

Authentication is simulated via state routing and mock components.

- **Login Mechanism**: In `src/components/admin/AdminLogin.tsx`, the function `handleLogin` sets an artificial timeout of 1.5 seconds, then verifies if the user entered *any* non-empty email and password. If true, it calls `onLoginSuccess()`.
- **Authorization & Roles**:
  - Currently, there is no real authorization.
  - The "admin" state is simulated by transitioning the `view` variable in `App.tsx` to `'admin-dashboard'`.
  - The "player/client" state is represented by transitioning `view` to `'padel-cash'`, and setting `currentPadelUser` to `Carlos Díaz` (mock ID `'p1'`) via `setCurrentPadelUserById` during lifecycle initialization.
  - No protected route guard checks tokens or actual user metadata.

---

## 4. Build & Test Setup

- **Build Config**: Powered by **Vite v8.0.12** and **TypeScript v6.0.2**.
- **Linting**: Controlled via ESLint (`npm run lint`).
- **Test Suite**: Driven by **Vitest v4.1.9**.
- **Existing Tests**: Located at `src/lib/standingsLogic.test.ts`.
- **Test execution**: Executing `npx vitest run` triggers three test cases for `standingsLogic` (calculating points/games won, sorting standings, grouping standings), which pass successfully in less than a second.

---

## 5. File-by-File Breakdown of Changes for Supabase Migration

To migrate this application to a Docker-based Supabase backend, the following modifications must be performed:

### 5.1 Configuration & Client Setup [NEW FILES]
1. **`supabase/config.toml` & `docker-compose.yml`**: Configure the Supabase local CLI environment.
2. **`supabase/migrations/`**: Schema migrations creating tables: `profiles`, `reservations`, `yape_payments`, `coupons`, `tournaments`, `inscriptions`, `products`, `sales`. Implement Postgres triggers for points/levels updates and coupon automation. Write Row Level Security (RLS) policies for each table.
3. **`src/lib/supabaseClient.ts`**: Initialize the Supabase Client using local environment variables:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   );
   ```

### 5.2 Contexts & Global State [MODIFICATION]
4. **`src/context/TournamentContext.tsx`**:
   - Import `supabase` from client setup.
   - Replace state setters loaded from `localStorage` with async `useEffect` calls fetching records from tables `profiles`, `reservations`, `yape_payments`, `tournaments`.
   - Rewrite mutation functions (`registerPair`, `createTournament`, `submitYapePayment`, `approveYapePayment`, `rejectYapePayment`, `cancelPaidBooking`, `claimPointsCoupon`) to perform `insert`, `update`, or `delete` actions against Supabase tables.
   - Set up real-time postgres channels (`supabase.channel().on('postgres_changes', ...).subscribe()`) to sync user balances, reservations, and tourney brackets. Remove the tab storage listener.

### 5.3 Authentication & App Layout [MODIFICATION]
5. **`src/App.tsx`**:
   - Track authenticated session using `supabase.auth.onAuthStateChange`.
   - Update client routing: check `profile.role` to determine if view can transition to `admin-dashboard`.
6. **`src/components/admin/AdminLogin.tsx`**:
   - Replace simulated validation with `supabase.auth.signInWithPassword({ email, password })`.
   - On success, query `profiles` table to verify if the user's role is `'admin'`. Reject authentication if not an administrator.
7. **`src/components/Navbar.tsx`**:
   - Display active user login status.
   - Add "Log Out" button that triggers `supabase.auth.signOut()`.

### 5.4 Feature Views (Padel-Cash & Admin Panel) [MODIFICATION]
8. **`src/components/PadelCashPortal.tsx`**:
   - Instead of mocking the Yape screenshot using HTML5 canvas, connect file upload to a Supabase Storage Bucket (`yape-comprobantes`).
   - Query user's real coupons and points from the DB.
9. **`src/components/admin/PadelCashAdminView.tsx`**:
   - Load image preview URLs from Supabase Storage.
   - Replace manual points adjustments (`localStorage.setItem`) with a SQL transaction or DB RPC call updating `profiles.points`.
10. **`src/components/admin/InscriptionsView.tsx`** & **`src/components/admin/AdminTournamentGenerator.tsx`**:
    - Remove direct reads/writes to `'americano-inscriptions-v2'` in `localStorage`.
    - Retrieve tournament registrations and inscriptions from the Supabase database.
11. **`src/components/admin/InventoryPOSView.tsx`** & **`src/components/admin/AdminDashboard.tsx`**:
    - Remove direct `useLocalStorage` bindings for product list and revenues.
    - Read/write inventory stock levels and log transactions to DB tables `products` and `sales`.
12. **`src/components/PlayerTvSelector.tsx`**:
    - Update explanation text on line 130 since tournaments are no longer restricted to a single PC's `localStorage` and will sync globally.
