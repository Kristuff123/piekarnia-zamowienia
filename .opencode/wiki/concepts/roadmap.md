---
title: Ścieżka rozwoju aplikacji
tags: [roadmap, architecture, planning]
sourceRefs: [README.md, AGENTS.md, client/src, server]
lastReviewed: 2026-11-17
---

# Ścieżka rozwoju aplikacji

Propozycja dalszego rozwoju portalu zamówień B2B (piekarnia → sklepy zdalne), oparta na aktualnym stanie kodu (prototyp z mock data, bogaty zestaw funkcji frontendowych, częściowa integracja API).

## Stan obecny

Mocne strony:
- Pełny przepływ zamówień, tortów, archiwum, pulpitów per rola.
- Bezpieczeństwo bazowe: helmet, CORS, rate-limit login, zod, scoping sklepów, uprawnienia stock/adjust.
- i18n PL/EN, PWA offline, 2FA, webhooki HMAC, klucze API, backup, historia cen, śledzenie dostaw.
- 48 testów serwerowych (Jest) + 3 E2E.

Główne luki:
- Zamówienia są tylko w pamięci klienta (`ORDERS` w `client/src/lib/data.ts`); brak `POST /orders`.
- Dane mock w dwóch miejscach (`client/src/lib/data.ts` i `server/routes/data.js`) — ryzyko rozjazdu.
- Brak CI/lintu; E2E tylko smoke.
- `mssql.js` zwraca `null` w trybie mock; brak realnych zapytań i schematu DB.
- `apiFetch` połyka błędy (`null`), brak obsługi 401/odświeżania.
- API keys nie są używane do autoryzacji maszynowej.

## Faza 1 — Stabilizacja i jakość (1–2 tygodnie)

1. CI: GitHub Actions — `npm run typecheck`, `npm test`, Playwright smoke na PR.
2. Lint (ESLint + Prettier) dla client/server; format w pre-commit.
3. Rozszerzyć testy serwerowe: zamówienia (create/list/status/cancel), uprawnienia.
4. E2E: pełne przepływy — zamówienie, korekta magazynu, admin (webhooki, 2FA).
5. Ujednolicić obsługę błędów w `apiFetch` (kody, 401 → logout, typy).

## Faza 2 — Persystencja zamówień i integracja ERP (2–4 tygodnie)

1. Dodać endpoints zamówień: `POST /orders`, `GET /orders`, `PATCH /orders/:id/status`, anulowanie.
2. Przenieść logikę `ORDERS` z klienta do serwera; klient tylko przez API.
3. Zastąpić mock w `mssql.js` realnymi zapytaniami (produkty, stany, zamówienia) + transakcje, FEFO.
4. Schemat DB + migracje; synchronizacja `MIN_QTY` z ERP.
5. Usunąć duplikację mock data: jeden źródło prawdy (server/ERP), klient fetchuje.

## Faza 3 — Produkcja i bezpieczeństwo (1–2 tygodnie)

1. Wymusić `JWT_SECRET` w prod, `secure` cookies, HTTPS, CORS whitelist.
2. Middleware autoryzacji API keys (scopes) dla integracji maszynowych.
3. Rozszerzyć rate-limit (per endpoint), walidację webhooków (allowlist), audit log persisted.
4. Observability: structured logging (pino), health/readiness, metryki.
5. Backup realny (dump DB) zamiast mock snapshotu.

## Faza 4 — UX i operacje

1. Offline queue zamówień (PWA) + retry sync.
2. Web Push (realne powiadomienia) zamiast Notification API.
3. Dokończyć i18n (hardcoded PL w komponentach), a11y, responsywność mobile.
4. Skaner kodów: fallback dla przeglądarek bez BarcodeDetector.

## Faza 5 — Analityka biznesowa

1. Raporty marży/ABC w czasie rzeczywistym, prognozy zapasów.
2. Eksport CSV/PDF, faktury (VAT), rozliczenia.
3. Dashboard KPI dla admina/managera z trendami.

## Najbliższy krok (rekomendowany)

Zacząć od **Fazy 1 + 2 równolegle w małym zakresie**: dodać `POST /orders` i `GET /orders` (serwer) oraz podłączyć `OrderPage` do API, jednocześnie dodać testy i CI. To usuwa największe ryzyko (zamówienia giną po odświeżeniu) i daje bazę pod ERP.

## Otwarte pytania

- Czy docelowe wdrożenie to on-prem (ERP on-site) czy chmura?
- Czy potrzebne SSO (Azure AD) zamiast login/hasło?
- Priorytet: mobile-first dla sklepów czy desktop dla managera/admina?
