import { useState, useEffect } from "react";
import { SHOPS, PRODUCTS, MIN_QTY, SALES, STOCK, AUDIT_LOG as MOCK_AUDIT } from "../lib/data";
import { USERS } from "../lib/auth";
import { apiFetch } from "../lib/api";
import type { AuditEntry, StockItem } from "../lib/data";

export default function AdminDashboard() {
  const [mins, setMins] = useState(MIN_QTY);
  const [stock, setStock] = useState<StockItem[]>(STOCK);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [keyName, setKeyName] = useState("");
  const [backupSchedule, setBackupSchedule] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [trackOrder, setTrackOrder] = useState("");
  const [trackCourier, setTrackCourier] = useState("DHL");
  const [trackNumber, setTrackNumber] = useState("");
  const [trackEta, setTrackEta] = useState("");
  const [keyScopes, setKeyScopes] = useState("read");
  const [whUrl, setWhUrl] = useState("");
  const [whEvents, setWhEvents] = useState("document.indexed");
  const [adjProduct, setAdjProduct] = useState(PRODUCTS[0]?.id ?? "");
  const [adjDelta, setAdjDelta] = useState(0);
  const [adjReason, setAdjReason] = useState("");
  useEffect(() => {
    apiFetch<AuditEntry[]>("/audit").then((d) => { if (d) setAuditLog(d); });
    apiFetch<StockItem[]>("/stock").then((d) => { if (d) setStock(d); });
    apiFetch<any[]>("/webhooks").then((d) => { if (d) setWebhooks(d); });
    apiFetch<any[]>("/api-keys").then((d) => { if (d) setApiKeys(d); });
    apiFetch<any>("/backup-schedule").then((d) => { if (d) setBackupSchedule(d); });
    apiFetch<any[]>("/price-history").then((d) => { if (d) setPriceHistory(d); });
    apiFetch<any[]>("/deliveries").then((d) => { if (d) setDeliveries(d); });
  }, []);
  const createWebhook = async () => {
    const res = await apiFetch<any>("/webhooks", { method: "POST", body: JSON.stringify({ url: whUrl, events: whEvents.split(",").map((e) => e.trim()) }) });
    if (res) { setWebhooks((prev) => [...prev, res]); setWhUrl(""); }
  };
  const testWebhook = async (id: string) => {
    const res = await apiFetch<any>(`/webhooks/${id}/test`, { method: "POST" });
    if (res) alert(`Wysłano test. Sygnatura: ${res.signature}`);
  };
  const deleteWebhook = async (id: string) => {
    await apiFetch(`/webhooks/${id}`, { method: "DELETE" });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };
  const createApiKey = async () => {
    const res = await apiFetch<any>("/api-keys", { method: "POST", body: JSON.stringify({ name: keyName, scopes: keyScopes.split(",").map((s) => s.trim()) }) });
    if (res?.key) { alert(`Klucz (pokaże się raz): ${res.key}`); setApiKeys((prev) => [...prev, res]); setKeyName(""); }
  };
  const revokeApiKey = async (id: string) => {
    await apiFetch(`/api-keys/${id}`, { method: "DELETE" });
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
  };
  const runBackup = async () => {
    const res = await apiFetch<any>("/backup-schedule/run", { method: "POST" });
    if (res) { setBackupSchedule((s: any) => ({ ...s, lastRun: res.snapshot.at })); alert(`Kopia utworzona: ${res.snapshot.at}`); }
  };
  const setTracking = async () => {
    const res = await apiFetch<any>(`/orders/${trackOrder}/tracking`, { method: "PATCH", body: JSON.stringify({ courier: trackCourier, number: trackNumber, eta: trackEta }) });
    if (res) alert("Śledzenie ustawione");
  };

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
        <h2 className="section">Webhooki (z podpisem HMAC)</h2>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <input className="input" placeholder="https://example.com/hook" value={whUrl} onChange={(e) => setWhUrl(e.target.value)} style={{ flex: 1, minWidth: 240 }} />
          <input className="input" placeholder="zdarzenia (przecinek)" value={whEvents} onChange={(e) => setWhEvents(e.target.value)} style={{ width: 220 }} />
          <button className="btn btn-primary" onClick={createWebhook}>Dodaj</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>URL</th><th>Zdarzenia</th><th>Aktywny</th><th></th></tr></thead>
            <tbody>
              {webhooks.map((w) => (
                <tr key={w.id}>
                  <td style={{ fontSize: 12 }} className="mono">{w.url}</td>
                  <td style={{ fontSize: 12 }}>{(w.events || []).join(", ")}</td>
                  <td>{w.active ? <span className="pill pill-positive">tak</span> : <span className="pill pill-neutral">nie</span>}</td>
                  <td style={{ display: "flex", gap: 4 }}>
                    <button className="btn" style={{ height: 24, fontSize: 11 }} onClick={() => testWebhook(w.id)}>Test</button>
                    <button className="btn" style={{ height: 24, fontSize: 11 }} onClick={() => deleteWebhook(w.id)}>Usuń</button>
                  </td>
                </tr>
              ))}
              {webhooks.length === 0 && <tr><td colSpan={4} className="muted">Brak webhooków</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Klucze API (maszynowe)</h2>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <input className="input" placeholder="Nazwa klucza" value={keyName} onChange={(e) => setKeyName(e.target.value)} style={{ width: 200 }} />
          <input className="input" placeholder="zakresy (przecinek)" value={keyScopes} onChange={(e) => setKeyScopes(e.target.value)} style={{ width: 200 }} />
          <button className="btn btn-primary" onClick={createApiKey}>Utwórz</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Nazwa</th><th>Prefix</th><th>Zakresy</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {apiKeys.map((k) => (
                <tr key={k.id}>
                  <td>{k.name}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{k.prefix}…</td>
                  <td style={{ fontSize: 12 }}>{(k.scopes || []).join(", ")}</td>
                  <td>{k.revoked ? <span className="pill pill-negative">unieważniony</span> : <span className="pill pill-positive">aktywny</span>}</td>
                  <td>{!k.revoked && <button className="btn" style={{ height: 24, fontSize: 11 }} onClick={() => revokeApiKey(k.id)}>Unieważnij</button>}</td>
                </tr>
              ))}
              {apiKeys.length === 0 && <tr><td colSpan={5} className="muted">Brak kluczy</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Kopie zapasowe</h2>
        {backupSchedule && (
          <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
            Harmonogram: godzina {backupSchedule.hour}:00, retencja {backupSchedule.retention} kopii. Ostatnia: {backupSchedule.lastRun ?? "brak"}.
          </p>
        )}
        <button className="btn btn-primary" onClick={runBackup}>Utwórz kopię teraz</button>
      </div>

      <div className="card">
        <h2 className="section">Historia cen</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Produkt</th><th className="num">Cena</th><th>Data</th></tr></thead>
            <tbody>
              {priceHistory.map((p, i) => (
                <tr key={i}>
                  <td>{PRODUCTS.find((x) => x.id === p.product)?.name ?? p.product}</td>
                  <td className="num">{p.price.toFixed(2)} zł</td>
                  <td style={{ fontSize: 12 }}>{p.at}</td>
                </tr>
              ))}
              {priceHistory.length === 0 && <tr><td colSpan={3} className="muted">Brak historii</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Dziennik doręczeń webhooków</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Data</th><th>Zdarzenie</th><th>Status</th><th>Kod</th></tr></thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontSize: 12 }}>{d.at}</td>
                  <td style={{ fontSize: 12 }}>{d.event}</td>
                  <td><span className={`pill ${d.status === "sent" ? "pill-positive" : "pill-negative"}`}>{d.status}</span></td>
                  <td className="num">{d.statusCode}</td>
                </tr>
              ))}
              {deliveries.length === 0 && <tr><td colSpan={4} className="muted">Brak doręczeń</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Śledzenie dostaw</h2>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <input className="input" placeholder="Nr zamówienia (z-1001)" value={trackOrder} onChange={(e) => setTrackOrder(e.target.value)} style={{ width: 160 }} />
          <input className="input" placeholder="Kurier" value={trackCourier} onChange={(e) => setTrackCourier(e.target.value)} style={{ width: 120 }} />
          <input className="input" placeholder="Numer przesyłki" value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} style={{ width: 160 }} />
          <input className="input" type="date" value={trackEta} onChange={(e) => setTrackEta(e.target.value)} style={{ width: 160 }} />
          <button className="btn btn-primary" onClick={setTracking}>Ustaw</button>
        </div>
      </div>

      <div className="card">
        <h2 className="section">Rozliczenia (szacunek)</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Sklep</th><th className="num">Przychód</th><th className="num">Koszt (60%)</th><th className="num">Marża</th></tr></thead>
            <tbody>
              {SHOPS.map((s) => {
                const rev = SALES.filter((x) => x.shop === s.id).reduce((a, b) => a + b.revenue, 0);
                const cost = rev * 0.6;
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="num">{rev.toFixed(0)} zł</td>
                    <td className="num">{cost.toFixed(0)} zł</td>
                    <td className="num" style={{ fontWeight: 600 }}>{(rev - cost).toFixed(0)} zł</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Szacunek na podstawie sprzedaży. Koszt = 60% przychodu.</p>
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
