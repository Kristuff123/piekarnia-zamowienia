# AGENTS.md

## Project

B2B ordering portal for remote bakery/pastry shops ordering from the central warehouse. Frontend: React 18 + Vite. API: Node.js/Express with JWT. Data comes from MS SQL (ERP) via `server/services/mssql.js`; when `MSSQL_SERVER` is unset the server runs on mock data.

## Commands

- Client dev: `cd client && npm install && npm run dev` (http://localhost:5173, proxies `/api` to :5000)
- API dev: `cd server && cp .env.example .env && npm install && npm run dev` (http://localhost:5000)
- Client typecheck: `cd client && npm run typecheck`
- Client build: `cd client && npm run build`

No test suite and no lint script yet — do not claim tests pass.

## Structure

- `client/src/pages` — LoginPage, ShopDashboard, OrderPage (asortyment + torty + szablon z archiwum), ArchivePage, ManagerDashboard, AdminDashboard
- `client/src/components/Shell.tsx` — app shell (sidebar + top bar + sheet)
- `client/src/lib/auth.tsx` — mock auth context (users/roles). Replace with real API calls when backend auth is wired.
- `client/src/lib/data.ts` — mock data mirroring the server; keep in sync with `server/routes/data.js`
- `server/routes` — auth, data (shops, products, min-qty, dashboard)
- `server/services/mssql.js` — MS SQL integration point; mock mode when `MSSQL_SERVER` unset

## Roles

`user` (shop staff) · `manager` (multiple shops) · `admin` (all). Role gates routes in `App.tsx` and the sidebar.

## Design

Design direction is "Framed sheet" (light): tokens in `client/src/styles.css` (`--ground`, `--surface`, `--accent` #1b6c80, IBM Plex Sans/Mono). Follow the sheet: 8px sheet inset, 16px radius, no shadows at rest, one gap (24px). Do not introduce gradients, shadows, or icon-in-tinted-square cards.

## Conventions

- Polish UI copy; keep terms consistent (sklep, zamówienie, asortyment, magazyn).
- Frontend uses mock data; backend is the integration point for MS SQL. When wiring real data, update both `client/src/lib/data.ts` and `server/routes/data.js`.
- Env: server reads `server/.env`; never commit it.
