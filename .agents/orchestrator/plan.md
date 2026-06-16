# Migration Plan: Padelitycs to Supabase

## Overview
This plan outlines the steps to migrate Padelitycs local prototype to a production-ready full-stack application using local Supabase (Docker) for backend, auth, and real-time database capabilities.

## Phase 1: Exploration
- Discover current state of the codebase.
- Locate database models, state storage (localStorage), mock data, and auth flows.
- Map the backend data models (profiles, reservations, yape_payments).

## Phase 2: Backend Infrastructure (Supabase CLI)
- Initialize Supabase inside the project directory.
- Create migrations for core database schemas (`profiles`, `reservations`, `yape_payments`).
- Define constraints, foreign keys, and triggers.

## Phase 3: Row Level Security (RLS)
- Implement strict RLS policies:
  - Players cannot modify others' profiles or points.
  - Players cannot approve/modify yape payments or reservations for others.
  - Standard users cannot arbitrarily update `points` balance.
  - Standard users cannot update `yape_payment` status to `approved`.
  - Admins have read/write access.

## Phase 4: Authentication & Routing
- Integrate Supabase Auth into the frontend.
- Configure Google Auth and Email login.
- Define routing based on role (Admin vs Player).

## Phase 5: Real-time Frontend Migration
- Refactor frontend components (specifically TournamentContext and state management).
- Replace `localStorage` with live Supabase subscriptions/queries.
- Update UI on backend changes (e.g. payment approval).

## Phase 6: Verification
- Create validation scripts to confirm RLS policies reject illegal operations.
- Ensure no hardcoded tokens/mock credentials remain.
- Execute full test suite.
