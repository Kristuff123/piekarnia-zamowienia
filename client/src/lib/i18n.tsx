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
