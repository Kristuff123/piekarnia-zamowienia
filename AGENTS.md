# AGENTS.md

## Project

B2B ordering portal for remote bakery/pastry shops ordering from the central warehouse. Monorepo: `client/` (React 18 + Vite + TS) and `server/` (Node/Express, CommonJS). Data is mock in both `client/src/lib/data.ts` and `server/routes/data.js` (keep in sync); MS SQL (ERP) integration point is `server/services/mssql.js` (mock mode when `MSSQL_SERVER` is unset).

## Commands

- Client dev: `cd client && npm install && npm run dev` (port 5173, proxies `/api` → :5000 via `vite.config.ts`)
- API dev: `cd server && cp .env.example .env && npm install && npm run dev` (port 5000)
- Client typecheck: `cd client && npm run typecheck` (`tsc --noEmit`)
- Client build: `cd client && npm run build` (runs `tsc --noEmit && vite build`; typecheck is part of build)
- API start (prod): `cd server && npm start` (`node server.js`)
- API tests: `cd server && npm test` (Jest, 12 tests, in-memory; `server.js` only listens when run directly, so `supertest` can import it without starting the server)
- E2E tests: `cd client && npx playwright test` (requires both dev servers running on :5173 and :5000)

No lint script. No CI workflows.

## Architecture

- `client/src/pages` — LoginPage, ShopDashboard, OrderPage (asortyment + torty konfigurator + szablon z archiwum), ArchivePage, ManagerDashboard, AdminDashboard (lazy-loaded via `React.lazy`)
- `client/src/components/Shell.tsx` — app shell (sidebar, top bar, notifications, theme toggle)
- `client/src/lib/auth.tsx` — auth context (USERS, roles, permissions); login falls back to mock USERS if API unreachable; stores `auth_token` + `auth_user` in localStorage
- `client/src/lib/data.ts` — mock data + types (Order, OrderLine, Cake, Stock, AuditEntry, …)
- `client/src/lib/api.ts` — `apiFetch` helper (adds `auth_token` Bearer header + `credentials: include`)
- `client/src/lib/i18n.tsx` — `useT()` / `LanguageProvider` (PL/EN); wrap app in `LanguageProvider`
- `server/server.js` — helmet, CORS (`CLIENT_ORIGIN`), rate-limit 20/15min on `/api/auth/login`, cookie-parser, body limit 1MB, `Cache-Control: no-store`, 404/500 handlers; exports `app`, listens only when run directly
- `server/routes/auth.js` — login/logout/2FA (zod validation), optional httpOnly cookie (`AUTH_COOKIE_MODE`)
- `server/routes/data.js` — shops/products/min-qty/dashboard/audit/stock/webhooks/api-keys/backup/price-history/orders-tracking; zod validation on `:shopId` params
- `server/middleware/auth.js` — JWT verify (`auth`), `USERS`, `sign` (accepts Bearer token or `kortex_session` cookie)

## Roles & permissions

Roles: `user` / `manager` / `admin`. Granular permissions: `view`, `order`, `approve`, `admin`. Order submission gated on `order` permission. Manager sees assigned shops; admin sees all. Demo logins: `anna.sklep1/demo`, `piotr.sklep2/demo`, `maria.manager/demo` (2FA), `admin/demo` (2FA), `jan.sklep1/demo` (view-only).

## Design

Design direction "Framed sheet" (light): tokens in `client/src/styles.css` (`--ground`, `--surface`, `--accent` #1b6c80, IBM Plex Sans/Mono). 8px sheet inset, 16px radius, no shadows at rest, single 24px gap. Dark mode via `html.dark` class toggled in Shell (persisted in localStorage). Do not introduce gradients, shadows, or icon-in-tinted-square cards. Graphics sourced from bagietka.pl.

## Security (already wired)

- `server/server.js`: helmet, strict CORS (`CLIENT_ORIGIN`), rate-limit on `/api/auth/login`, body limit 1MB, `Cache-Control: no-store`, 404/500 handlers.
- `routes/auth.js`: zod validation on login body.
- `routes/data.js`: zod validation on `:shopId` params.
- Secrets only in `server/.env` (never commit). Root `.env.example` + `server/.env.example`.
- `.gitignore` excludes `.env`, `dist/`, `node_modules/`, `test-results/`, `.taste-skill/`.

## Conventions

- Polish UI copy; keep terms consistent (sklep, zamówienie, asortyment, magazyn, tort).
- Client uses mock data; backend is the integration point for MS SQL. When wiring real data, update both `client/src/lib/data.ts` and `server/routes/data.js`.
- Env: server reads `server/.env` via dotenv. Set `MSSQL_SERVER` etc. to leave mock mode. Key vars: `PORT`, `CLIENT_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AUTH_COOKIE_MODE` (off/dual/only), `WEBHOOK_BLOCK_PRIVATE` (1/0).
- GitHub: https://github.com/Kristuff123/piekarnia-zamowienia (branch `main`).
