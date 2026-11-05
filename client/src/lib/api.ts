const BASE = "/api";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(BASE + path, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers || {}) },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
