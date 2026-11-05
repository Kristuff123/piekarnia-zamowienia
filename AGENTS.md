# AGENTS.md

## Project

B2B ordering portal for remote bakery/pastry shops ordering from the central warehouse. Monorepo: `client/` (React 18 + Vite + TS) and `server/` (Node/Express, CommonJS). Data is mock in both `client/src/lib/data.ts` and `server/routes/data.js` (keep in sync); MS SQL (ERP) integration point is `server/services/mssql.js` (mock mode when `MSSQL_SERVER` is unset).

## Commands

- Client dev: `cd client && npm install && npm run dev` (port 5173, proxies `/api` → :5000)
- API dev: `cd server && cp .env.example .env && npm install && npm run dev` (port 5000)
- Client typecheck: `cd client && npm run typecheck`
- Client build: `cd client && npm run build`
- API start (prod): `cd server && npm start`

Tests: `cd server && npm test` (Jest, 9 tests, in-memory; server.js only listens when run directly). No lint script yet.

## Architecture

- `client/src/pages` — LoginPage, ShopDashboard, OrderPage (asortyment + torty konfigurator + szablon z archiwum), ArchivePage, ManagerDashboard, AdminDashboard
- `client/src/components/Shell.tsx` — app shell (sidebar, top bar, notifications, theme toggle)
- `client/src/lib/auth.tsx` — mock auth (USERS, roles, permissions); exported `USERS`
- `client/src/lib/data.ts` — mock data + types (Order, OrderLine, Cake, Stock, AuditEntry, …)
- `server/routes` — auth (login, me), data (shops, products, min-qty, dashboard)
- `server/middleware/auth.js` — JWT verify, `auth`, `USERS`, `sign`
- `server/services/mssql.js` — MS SQL service layer (mock when `MSSQL_SERVER` unset)

## Roles & permissions

Roles: `user` / `manager` / `admin`. Granular permissions: `view`, `order`, `approve`, `admin` (see `Permission` in auth.tsx). Order submission is gated on `order` permission. Manager sees assigned shops; admin sees all.

## Design

Design direction "Framed sheet" (light): tokens in `client/src/styles.css` (`--ground`, `--surface`, `--accent` #1b6c80, IBM Plex Sans/Mono). 8px sheet inset, 16px radius, no shadows at rest, single 24px gap. Dark mode via `html.dark` class toggled in Shell (persisted in localStorage). Do not introduce gradients, shadows, or icon-in-tinted-square cards. Graphics sourced from bagietka.pl.

## Security (already wired)

- `server/server.js`: helmet, strict CORS (`CLIENT_ORIGIN`), rate-limit 20/15min on `/api/auth/login`, body limit 1MB, `Cache-Control: no-store`, 404/500 handlers.
- `routes/auth.js`: zod validation on login body.
- `routes/data.js`: zod validation on `:shopId` params.
- Secrets only in `server/.env` (never commit). Root `.env.example` + `server/.env.example`.

## Conventions

- Polish UI copy; keep terms consistent (sklep, zamówienie, asortyment, magazyn, tort).
- Client uses mock data; backend is the integration point for MS SQL. When wiring real data, update both `client/src/lib/data.ts` and `server/routes/data.js`.
- Env: server reads `server/.env` via dotenv. Set `MSSQL_SERVER` etc. to leave mock mode.
- GitHub: https://github.com/Kristuff123/piekarnia-zamowienia (branch `main`).
