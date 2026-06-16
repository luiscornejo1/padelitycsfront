# Scope: E2E Testing Track

## Architecture
- Backend: Local Supabase running in Docker.
- Testing Framework: Vitest (separated from unit tests) or Node.js scripts. E2E tests will run against the local Docker-based Supabase instance.
- Setup/Teardown: Automated test user creation, seeding initial data, cleanup after tests.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Test Design & Architecture | Design 4-tier E2E tests and create/document them in TEST_INFRA.md. | None | DONE |
| 2 | E2E Test Suite Implementation | Write all test cases (Tier 1-4) in a designated directory (e.g., `tests/e2e/`). | M1 | IN_PROGRESS |
| 3 | Execution & Verification | Configure test scripts, run tests against Supabase Docker, verify pass/fail signals. | M2 | PLANNED |
| 4 | Final Validation & TEST_READY | Generate TEST_READY.md at project root, perform integrity checks, and report. | M3 | PLANNED |

## Interface Contracts
- Tests must use Supabase JS client to perform authentication and database queries/mutations.
- Test runner must not execute or interfere with existing unit tests (`src/lib/standingsLogic.test.ts`).
- Exit code must accurately report pass/fail status.
