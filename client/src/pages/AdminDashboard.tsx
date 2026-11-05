import { useState, useEffect } from "react";
import { SHOPS, PRODUCTS, MIN_QTY, SALES, STOCK, AUDIT_LOG as MOCK_AUDIT } from "../lib/data";
import { USERS } from "../lib/auth";
import { apiFetch } from "../lib/api";
import type { AuditEntry, StockItem } from "../lib/data";

export default function AdminDashboard() {
  const [mins, setMins] = useState(MIN_QTY);
  const [stock, setStock] = useState<StockItem[]>(STOCK);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [adjProduct, setAdjProduct] = useState(PRODUCTS[0]?.id ?? "");
  const [adjDelta, setAdjDelta] = useState(0);
  const [adjReason, setAdjReason] = useState("");
  useEffect(() => {
    apiFetch<AuditEntry[]>("/audit").then((d) => { if (d) setAuditLog(d); });
    apiFetch<StockItem[]>("/stock").then((d) => { if (d) setStock(d); });
  }, []);
  const adjustStock = async () => {
    const res = await apiFetch<{ item: StockItem; entry: AuditEntry }>("/stock/adjust", {
      method: "POST",
      body: JSON.stringify({ product: adjProduct, delta: adjDelta, reason: adjReason }),
    });
    if (res) {
      setStock((prev) => prev.map((s) => (s.product === res.item.product ? res.item : s)));
      setAuditLog((prev) => [res.entry, ...prev]);
      setAdjDelta(0);
      setAdjReason("");
    }
  };
  const totalRev = SALES.reduce((a, b) => a + b.revenue, 0);
  const totalQty = SALES.reduce((a, b) => a + b.qty, 0);
  const lowStock = stock.filter((s) => s.qty < s.min);

  return (
    <div className="stack">
      <div>
        <h1 className="title">Administracja</h1>
        <p className="muted">Wszystkie sklepy, użytkownicy i konfiguracja asortymentu stałego</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card">
          <div className="kpi-label">Sklepy</div>
          <div className="kpi" style={{ marginTop: 6 }}>{SHOPS.length}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>aktywne</div>
        </div>
        <div className="card">
          <div className="kpi-label">Pozycje asortymentu</div>
          <div className="kpi" style={{ marginTop: 6 }}>{PRODUCTS.length}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{new Set(PRODUCTS.map((p) => p.category)).size} kategorii</div>
        </div>
        <div className="card">
          <div className="kpi-label">Przychód łączny</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalRev.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{totalQty} szt sprzedanych</div>
        </div>
        <div className="card">
          <div className="kpi-label">Alerty stanów</div>
          <div className="kpi" style={{ marginTop: 6, color: lowStock.length ? "var(--negative)" : "var(--text)" }}>{lowStock.length}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>pozycji poniżej min</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section">Sklepy</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>Nazwa</th><th>Miasto</th><th>Region</th><th className="num">Przychód</th></tr></thead>
              <tbody>
                {SHOPS.map((s) => {
                  const rev = SALES.filter((x) => x.shop === s.id).reduce((a, b) => a + b.revenue, 0);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>{s.city}</td>
                      <td>{s.region}</td>
                      <td className="num">{rev.toFixed(0)} zł</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h2 className="section">Stany magazynowe (poniżej min)</h2>
          {lowStock.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>Brak alertów</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr><th>Produkt</th><th className="num">Stan</th><th className="num">Min</th><th>Lokalizacja</th></tr></thead>
                <tbody>
                  {lowStock.map((s) => {
                    const p = PRODUCTS.find((x) => x.id === s.product);
                    return (
                      <tr key={s.product}>
                        <td>{p?.name}</td>
                        <td className="num" style={{ color: "var(--negative)" }}>{s.qty}</td>
                        <td className="num">{s.min}</td>
                        <td style={{ fontSize: 12 }}>{s.location}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section">Użytkownicy i uprawnienia</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Login</th><th>Nazwa</th><th>Rola</th><th>Sklepy</th><th>Uprawnienia</th><th>2FA</th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.id}>
                  <td className="mono">{u.login}</td>
                  <td>{u.name}</td>
                  <td><span className="pill pill-neutral">{u.role}</span></td>
                  <td style={{ fontSize: 12 }}>{u.shops.join(", ")}</td>
                  <td style={{ fontSize: 12 }}>{u.permissions.join(", ")}</td>
                  <td>{u.twoFactor ? <span className="pill pill-positive">włączone</span> : <span className="pill pill-warning">wyłączone</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Dziennik audytu</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Data</th><th>Użytkownik</th><th>Akcja</th><th>Cel</th></tr></thead>
            <tbody>
              {auditLog.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontSize: 12 }}>{a.at}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{a.user}</td>
                  <td>{a.action}</td>
                  <td style={{ fontSize: 12 }}>{a.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Korekta stanu magazynowego (inwentaryzacja)</h2>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <select className="input" style={{ width: 260 }} value={adjProduct} onChange={(e) => setAdjProduct(e.target.value)}>
            {PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="input" type="number" placeholder="Delta (+/-)" value={adjDelta} onChange={(e) => setAdjDelta(Number(e.target.value))} style={{ width: 120 }} />
          <input className="input" placeholder="Powód korekty" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <button className="btn btn-primary" onClick={adjustStock}>Zastosuj</button>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Ilości minimalne (per sklep × produkt)</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Produkt</th>
                {SHOPS.map((s) => <th key={s.id} className="num">{s.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.slice(0, 12).map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  {SHOPS.map((s) => (
                    <td key={s.id} className="num">
                      <input
                        className="input"
                        type="number"
                        min={0}
                        value={mins[s.id]?.[p.id] ?? 0}
                        onChange={(e) =>
                          setMins({ ...mins, [s.id]: { ...mins[s.id], [p.id]: Number(e.target.value) } })
                        }
                        aria-label={`Min. ${p.name} · ${s.name}`}
                        style={{ width: 64, textAlign: "right" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
          Pokazano pierwsze 12 pozycji. Zmiany zapisywane są w bazie MS SQL (ERP) — tu edycja demonstracyjna.
        </p>
      </div>
    </div>
  );
}
