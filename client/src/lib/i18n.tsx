import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "pl" | "en";

const DICT: Record<Lang, Record<string, string>> = {
  pl: {
    "app.title": "Piekarnia · Zamówienia",
    "nav.dashboard": "Pulpit",
    "nav.order": "Nowe zamówienie",
    "nav.archive": "Archiwum",
    "nav.manager": "Manager",
    "nav.admin": "Administracja",
    "login": "Zaloguj się",
    "logout": "Wyloguj",
    "theme.dark": "Ciemny motyw",
    "theme.light": "Jasny motyw",
    "lang": "Język",
    "push": "Powiadomienia",
    "app.smoke": "Sprawdź login",
    "app.login": "Logowanie",
    "app.logout": "Wylogowanie",
    "app.errors": "Błędy",
    "app.2fa": "2FA",
    "app.2fa.setup": "Włącz 2FA",
    "app.2fa.verify": "Weryfikuj 2FA",
    "app.webhooks": "Webhooki",
    "app.api-keys": "Klucze API",
    "app.backup": "Kopia zapasowa",
    "app.export": "Eksport",
    "app.print": "Druk",
    "app.offline": "Offline",
    "app.offline.title": "Tryb offline",
    "app.offline.subtitle": "Dane dostępne bez połączenia z serwerem",
    "app.offline.subtitle2": "API działa w trybie cache-first",
    "app.offline.subtitle3": "Połączenie API: offline",
    "app.offline.subtitle4": "Połączenie: online",
    "app.errors.invalid_creds": "Nieprawidłowy login lub hasło",
    "app.login.loading": "Logowanie…",
  },
  en: {
    "app.title": "Bakery · Orders",
    "nav.dashboard": "Dashboard",
    "nav.order": "New order",
    "nav.archive": "Archive",
    "nav.manager": "Manager",
    "nav.admin": "Administration",
    "login": "Sign in",
    "logout": "Sign out",
    "theme.dark": "Dark mode",
    "theme.light": "Light mode",
    "lang": "Language",
    "push": "Notifications",
    "app.smoke": "Smoke test",
    "app.login": "Login",
    "app.logout": "Logout",
    "app.errors": "Errors",
    "app.2fa": "2FA",
    "app.2fa.setup": "Enable 2FA",
    "app.2fa.verify": "Verify 2FA",
    "app.webhooks": "Webhooks",
    "app.api-keys": "API keys",
    "app.backup": "Backup",
    "app.export": "Export",
    "app.print": "Print",
    "app.offline": "Offline",
    "app.offline.title": "Offline mode",
    "app.offline.subtitle": "Data available without server connection",
    "app.offline.subtitle2": "API works in cache-first mode",
    "app.offline.subtitle3": "API connection: offline",
    "app.offline.subtitle4": "Connection: online",
    "app.errors.invalid_creds": "Invalid login or password",
    "app.login.loading": "Signing in…",
  },
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; }
const C = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "pl");
  const set = (l: Lang) => { setLang(l); localStorage.setItem("lang", l); };
  const t = (k: string) => DICT[lang][k] ?? k;
  return <C.Provider value={{ lang, setLang: set, t }}>{children}</C.Provider>;
}

export function useT() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useT outside provider");
  return ctx;
}