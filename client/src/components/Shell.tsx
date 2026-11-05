import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { SHOPS, STOCK, PRODUCTS } from "../lib/data";
import { LogOut, LayoutDashboard, ShoppingCart, Archive, BarChart3, Settings, Store, Bell, X, Sun, Moon } from "lucide-react";

export default function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  if (!user) return null;

  const alerts = STOCK.filter((s) => s.qty < s.min).map((s) => {
    const p = PRODUCTS.find((x) => x.id === s.product);
    return { id: s.product, text: `${p?.name ?? s.product}: stan ${s.qty}, min ${s.min} (${s.location})` };
  });

  const shops = SHOPS.filter((s) => user.shops.includes(s.id));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, letterSpacing: "-0.02em" }}>
          Piekarnia
          <div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>Zamówienia</div>
        </div>
        <NavLink to="/" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
          <LayoutDashboard size={16} /> Pulpit
        </NavLink>
        <NavLink to="/zamowienie" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
          <ShoppingCart size={16} /> Nowe zamówienie
        </NavLink>
        <NavLink to="/archiwum" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
          <Archive size={16} /> Archiwum
        </NavLink>
        {user.role !== "user" && (
          <NavLink to="/manager" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
            <BarChart3 size={16} /> Manager
          </NavLink>
        )}
        {user.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
            <Settings size={16} /> Administracja
          </NavLink>
        )}
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--rule)" }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Moje sklepy</div>
          {shops.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", fontSize: 13 }}>
              <Store size={13} /> {s.name}
            </div>
          ))}
          <button
            className="nav-item"
            onClick={() => { logout(); navigate("/login"); }}
            style={{ marginTop: 8 }}
          >
            <LogOut size={16} /> Wyloguj
          </button>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header className="topbar">
          <input className="input" placeholder="Szukaj asortymentu…" style={{ maxWidth: 420 }} />
          <div style={{ position: "relative" }}>
            <button className="btn btn-ghost" aria-label="Powiadomienia" style={{ position: "relative" }} onClick={() => setNotifOpen((v) => !v)}>
              <Bell size={16} />
              {alerts.length > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: "var(--negative)", color: "#fff", borderRadius: 999, fontSize: 10, padding: "1px 5px" }}>
                  {alerts.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="card" style={{ position: "absolute", right: 0, top: 40, width: 320, zIndex: 60, boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Powiadomienia</span>
                  <button className="btn btn-ghost" style={{ height: 24 }} onClick={() => setNotifOpen(false)} aria-label="Zamknij"><X size={14} /></button>
                </div>
                {alerts.length === 0 ? (
                  <p className="muted" style={{ fontSize: 13 }}>Brak alertów</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>
                    {alerts.map((a) => <li key={a.id} style={{ color: "var(--negative)", marginBottom: 4 }}>{a.text}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button className="btn btn-ghost" aria-label="Przełącz motyw" onClick={() => setDark((v) => !v)}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="muted" style={{ fontSize: 13 }}>
            {user.name} · {user.role}
          </div>
        </header>
        <main className="sheet">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
