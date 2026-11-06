# Piekarnia · Zamówienia

Aplikacja B2B do składania zamówień przez sklepy zdalne w magazynie głównym piekarni/cukierni.

## Architektura

- **Klient** — React 18 + Vite + TypeScript, IBM Plex, styl "Framed sheet", PWA (manifest + service worker, tryb offline)
- **API** — Node.js + Express (CommonJS), JWT, role: user / manager / admin, httpOnly cookies (opcjonalnie), 2FA TOTP, webhooki z HMAC, klucze API
- **Dane** — MS SQL (ERP) przez API; w trybie mock (brak `MSSQL_SERVER`) działają dane demonstracyjne

## Uruchomienie

### Klient
```bash
cd client
npm install
npm run dev   # http://localhost:5173
npm run typecheck
npm run build
npx playwright install chromium   # jednorazowo, dla testów E2E
```

### API
```bash
cd server
cp .env.example .env
npm install
npm run dev   # http://localhost:5000
npm test      # Jest, 35 testów (in-memory)
npm start     # produkcyjne
```

## Role i widoki

- **user** — pulpit sklepu, nowe zamówienie (z ilościami minimalnymi), historia
- **manager** — zbiorczy widok przypisanych sklepów, najlepiej sprzedające się pozycje, analiza ABC, śledzenie dostaw, korekta stanu magazynu (uprawnienie `approve`)
- **admin** — wszystkie sklepy, konfiguracja ilości minimalnych, audit log, 2FA, webhooki, klucze API, kopie zapasowe, historia cen

## Zmienne środowiskowe (server/.env)

| Zmienna | Domyślnie | Opis |
|---|---|---|
| PORT | 5000 | Port serwera API |
| CLIENT_ORIGIN | http://localhost:5173 | Źródło CORS dla frontendu |
| JWT_SECRET | change-me-to-a-long-random-string | Sekret JWT |
| JWT_EXPIRES_IN | 8h | Ważność tokena |
| AUTH_COOKIE_MODE | off | `off` (tylko Bearer), `dual` (Bearer + httpOnly cookie), `only` (tylko httpOnly cookie) |
| WEBHOOK_BLOCK_PRIVATE | 1 | `1` blokuje wysyłkę webhooków na adresy prywatne (SSRF guard); `0` wyłącza |
| MSSQL_* | — | MS SQL (ERP); pusty `MSSQL_SERVER` = tryb mock |

## Endpointy API (wymagają auth, oprócz logowania)

- `POST /api/auth/login` — logowanie (zod), opcjonalnie ustawia cookie `kortex_session`
- `GET /api/auth/me` — dane zalogowanego użytkownika z tokenu
- `POST /api/auth/logout` — wyczyszczenie cookie
- `POST /api/auth/2fa/setup` — wygenerowanie sekretu TOTP + URI (QR)
- `POST /api/auth/2fa/verify` — weryfikacja kodu 6-cyfrowego
- `GET /api/shops`, `GET /api/products`
- `GET /api/min-qty/:shopId`, `GET /api/dashboard/:shopId` — tylko sklepy z `req.user.shops` (admin: wszystkie), inaczej `403`
- `GET /api/stock`, `POST /api/stock/adjust` — korekta tylko dla `admin` lub uprawnienia `approve`, inaczej `403`
- `GET /api/audit`, `POST /api/audit`
- `GET /api/webhooks`, `POST /api/webhooks`, `DELETE /api/webhooks/:id`
- `POST /api/webhooks/:id/test`, `GET /api/webhooks/:id/deliveries`, `GET /api/deliveries`
- `POST /api/webhooks/emit` — wysłanie zdarzenia do subskrybentów (z retry/backoff)
- `GET /api/api-keys`, `POST /api/api-keys`, `DELETE /api/api-keys/:id`
- `GET /api/backup-schedule`, `PATCH /api/backup-schedule`, `POST /api/backup-schedule/run`
- `GET /api/price-history`, `GET /api/price-history/:productId`
- `PATCH /api/orders/:id/tracking` — ustawienie kuriera/numeru przesyłki

## Integracja MS SQL

Ustaw `MSSQL_SERVER`, `MSSQL_DATABASE`, `MSSQL_USER`, `MSSQL_PASSWORD` w `server/.env`.
Asortyment i dashboardy czerpane są z bazy ERP (zob. `server/services/mssql.js`).

## Demo

Login: `anna.sklep1` / `demo`, `maria.manager` / `demo`, `admin` / `demo`, `jan.sklep1` / `demo`.

## Testy

- Serwer: `cd server && npm test` (Jest, 35 testów w 4 zestawach: `api`, `login`, `webhook`, `authz`; in-memory)
- E2E: `cd client && npx playwright test` (wymaga uruchomionego serwera i klienta; przeglądarkę instaluje się raz przez `npx playwright install chromium`)
