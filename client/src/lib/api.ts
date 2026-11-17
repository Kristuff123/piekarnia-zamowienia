const BASE = "/api";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(BASE + path, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers || {}) },
    });
    if (res.status === 401) {
      // sesja wygasła / odrzucona – wyczyść stan i wróć do logowania
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return null;
    }
    if (!res.ok) {
      console.warn(`apiFetch ${path} -> ${res.status}`);
      return null;
    }
    // niektóre endpointy zwracają 204 No Content
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`apiFetch ${path} failed`, err);
    return null;
  }
}
