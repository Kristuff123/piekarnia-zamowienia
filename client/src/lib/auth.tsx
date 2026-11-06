import { createContext, useContext, useState, ReactNode } from "react";
import { apiFetch } from "./api";

export type Role = "user" | "manager" | "admin";

export type Permission = "view" | "order" | "approve" | "admin";

export interface User {
  id: string;
  login: string;
  name: string;
  role: Role;
  shops: string[]; // shop ids
  permissions: Permission[];
  twoFactor: boolean;
}

// "ok" | "invalid" (API odrzuciło dane) | "unavailable" (brak API / błąd serwera)
export type LoginResult = "ok" | "invalid" | "unavailable";

interface AuthContextValue {
  user: User | null;
  login: (login: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const USERS: (User & { password: string })[] = [
  { id: "u1", login: "anna.sklep1", name: "Anna Nowak", role: "user", shops: ["s1"], permissions: ["view", "order"], twoFactor: false, password: "demo" },
  { id: "u2", login: "piotr.sklep2", name: "Piotr Kowalski", role: "user", shops: ["s2"], permissions: ["view", "order"], twoFactor: false, password: "demo" },
  { id: "u3", login: "maria.manager", name: "Maria Wiśniewska", role: "manager", shops: ["s1", "s2", "s3"], permissions: ["view", "order", "approve"], twoFactor: true, password: "demo" },
  { id: "u4", login: "admin", name: "Administrator", role: "admin", shops: ["s1", "s2", "s3", "s4"], permissions: ["view", "order", "approve", "admin"], twoFactor: true, password: "demo" },
  { id: "u5", login: "jan.sklep1", name: "Jan Kowalczyk", role: "user", shops: ["s1"], permissions: ["view"], twoFactor: false, password: "demo" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (l: string, p: string): Promise<LoginResult> => {
    let res: Response;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ login: l, password: p }),
      });
    } catch {
      // API unreachable (backend down / offline) – fall back to demo users
      const found = USERS.find((u) => u.login === l && u.password === p);
      if (!found) return "unavailable";
      const { password, ...safe } = found;
      setUser(safe);
      localStorage.setItem("auth_user", JSON.stringify(safe));
      return "ok";
    }
    // API answered: trust it – a rejected login must never succeed from mock data
    if (!res.ok) return res.status >= 500 ? "unavailable" : "invalid";
    try {
      const data = await res.json();
      const safe = data.user ?? data;
      if (data.token) localStorage.setItem("auth_token", data.token);
      else localStorage.removeItem("auth_token");
      setUser(safe);
      localStorage.setItem("auth_user", JSON.stringify(safe));
      return "ok";
    } catch {
      return "unavailable";
    }
  };

  const logout = () => {
    // drop the server session (httpOnly cookie) before forgetting the local token
    void apiFetch("/auth/logout", { method: "POST" });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
