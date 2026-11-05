import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useT } from "../lib/i18n";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const [l, setL] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(l, p);
    setLoading(false);
    if (ok) navigate("/");
    else setErr(t("app.errors.invalid_creds"));
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--ground)" }}>
      <div style={{ position: "relative", overflow: "hidden", background: "var(--raised)" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
        <img
          src="https://bagietka.pl/wp-content/uploads/2025/11/Chleb-pszenny-2.jpg"
          alt="Świeży chleb z piekarni"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", left: 32, bottom: 32, color: "#fff" }}>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>Piekarnia Bagietka</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Manufaktura mistrzowskich wypieków · Chojnice</div>
        </div>
      </div>
      <div style={{ display: "grid", placeItems: "center", padding: 32 }}>
      <form onSubmit={submit} className="card" style={{ width: 360 }}>
        <h1 className="title" style={{ marginBottom: 4 }}>{t("app.title")}</h1>
        <p className="muted" style={{ marginBottom: 20 }}>Zamówienia w magazynie głównym</p>
        <div className="stack">
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="kpi-label">Login</span>
            <input className="input" placeholder="np. anna.sklep1" value={l} onChange={(e) => setL(e.target.value)} aria-label="Login" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="kpi-label">Hasło</span>
            <input className="input" type="password" placeholder="••••••" value={p} onChange={(e) => setP(e.target.value)} aria-label="Hasło" />
          </label>
          {err && <div role="alert" style={{ color: "var(--negative)", fontSize: 13 }}>{err}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", minHeight: 44 }}>
            {loading ? t("app.login.loading") : t("login")}
          </button>
        </div>
        <div className="muted" style={{ marginTop: 16, fontSize: 12 }}>
          Demo: anna.sklep1 / demo · maria.manager / demo · admin / demo
        </div>
      </form>
      </div>
    </div>
  );
}
