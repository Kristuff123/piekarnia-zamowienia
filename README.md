# Piekarnia · Zamówienia

Aplikacja B2B do składania zamówień przez sklepy zdalne w magazynie głównym piekarni/cukierni.

## Architektura

- **Klient** — React 18 + Vite, IBM Plex, styl "Framed sheet"
- **API** — Node.js + Express, JWT, role: user / manager / admin
- **Dane** — MS SQL (ERP) przez API; w trybie mock (brak `MSSQL_SERVER`) działają dane demonstracyjne

## Uruchomienie

### Klient
```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

### API
```bash
cd server
cp .env.example .env
npm install
npm run dev   # http://localhost:5000
```

## Role i widoki

- **user** — pulpit sklepu, nowe zamówienie (z ilościami minimalnymi), historia
- **manager** — zbiorczy widok przypisanych sklepów, najlepiej sprzedające się pozycje
- **admin** — wszystkie sklepy, konfiguracja ilości minimalnych per lokalizacja

## Integracja MS SQL

Ustaw `MSSQL_SERVER`, `MSSQL_DATABASE`, `MSSQL_USER`, `MSSQL_PASSWORD` w `server/.env`.
Asortyment i dashboardy czerpane są z bazy ERP (zob. `server/services/mssql.js`).

## Demo

Login: `anna.sklep1` / `demo`, `maria.manager` / `demo`, `admin` / `demo`.
