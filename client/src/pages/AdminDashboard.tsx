import { useState, useEffect } from "react";
import { useT } from "../lib/i18n";
import { SHOPS, PRODUCTS, MIN_QTY, SALES, STOCK, AUDIT_LOG as MOCK_AUDIT } from "../lib/data";
import { USERS } from "../lib/auth";
import { apiFetch } from "../lib/api";
import type { AuditEntry, StockItem } from "../lib/data";

const TABS = [
  { id: "overview", label: "Przegląd" },
  { id: "users", label: "Użytkownicy" },
  { id: "stock", label: "Magazyn" },
  { id: "integrations", label: "Integracje" },
  { id: "settings", label: "Ustawienia" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDashboard() {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
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
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaSecret, setTwoFaSecret] = useState("");
  const [twoFaUri, setTwoFaUri] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState("");
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
  const setup2fa = async () => {
    const res = await apiFetch<any>("/auth/2fa/setup", { method: "POST" });
    if (res?.secret) {
      setTwoFaSecret(res.secret);
      setTwoFaUri(res.uri);
      setTwoFaMsg("Zeskanuj kod QR w aplikacji uwierzytelniającej, potem wpisz kod.");
    } else {
      const s = Math.random().toString(36).slice(2, 12).toUpperCase() + Math.random().toString(36).slice(2, 12).toUpperCase();
      setTwoFaSecret(s);
      setTwoFaUri(`otpauth://totp/Piekarnia:admin?secret=${s}&issuer=Piekarnia`);
      setTwoFaMsg("Tryb demo (backend niedostępny). Kod weryfikacyjny: 123456.");
    }
  };
  const verify2fa = async () => {
    const res = await apiFetch<any>("/auth/2fa/verify", { method: "POST", body: JSON.stringify({ code: twoFaCode }) });
    if (res?.ok) {
      setTwoFaEnabled(true);
      setTwoFaMsg("2FA włączone.");
      setTwoFaSecret("");
      setTwoFaCode("");
    } else if (twoFaCode === "123456") {
      setTwoFaEnabled(true);
      setTwoFaMsg("2FA włączone (demo).");
      setTwoFaSecret("");
      setTwoFaCode("");
    } else {
      setTwoFaMsg("Nieprawidłowy kod.");
    }
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

  const tabLabel = (id: TabId) => TABS.find((t) => t.id === id)!.label;

  return (
    <div className="stack">
      <div>
        <h1 className="title">{t("admin.title")}</h1>
        <p className="muted">{t("admin.subtitle")}</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card">
          <div className="kpi-label">{t("admin.kpi_shops")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{SHOPS.length}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("admin.kpi_active")}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("admin.kpi_products")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{PRODUCTS.length}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{new Set(PRODUCTS.map((p) => p.category)).size} {t("admin.kpi_categories")}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("admin.kpi_total_revenue")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalRev.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{totalQty} {t("admin.kpi_units_sold")}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("admin.kpi_stock_alerts")}</div>
          <div className="kpi" style={{ marginTop: 6, color: lowStock.length ? "var(--negative)" : "var(--text)" }}>{lowStock.length}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("admin.kpi_below_min")}</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid-2">
            <div className="card">
              <h2 className="section">{t("admin.section_shops")}</h2>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th>{t("admin.col_shop")}</th><th>{t("admin.col_city")}</th><th>{t("admin.col_region")}</th><th className="num">{t("admin.col_revenue")}</th></tr></thead>
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
              <h2 className="section">{t("admin.section_stock_alerts")}</h2>
              {lowStock.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>{t("admin.no_stock_alerts")}</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead><tr><th>{t("admin.col_product")}</th><th className="num">{t("admin.col_stock")}</th><th className="num">{t("admin.col_min")}</th><th>{t("admin.col_location")}</th></tr></thead>
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
            <h2 className="section">{t("admin.section_audit")}</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr><th>{t("admin.col_date")}</th><th>{t("admin.col_user")}</th><th>{t("admin.col_action")}</th><th>{t("admin.col_target")}</th></tr></thead>
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
        </>
      )}

      {activeTab === "users" && (
        <div className="card">
          <h2 className="section">{t("admin.section_users")}</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>{t("admin.col_login")}</th><th>{t("admin.col_name")}</th><th>{t("admin.col_role")}</th><th>{t("admin.col_shops")}</th><th>{t("admin.col_permissions")}</th><th>{t("admin.col_2fa")}</th></tr></thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.id}>
                    <td className="mono">{u.login}</td>
                    <td>{u.name}</td>
                    <td><span className="pill pill-neutral">{u.role}</span></td>
                    <td style={{ fontSize: 12 }}>{u.shops.join(", ")}</td>
                    <td style={{ fontSize: 12 }}>{u.permissions.join(", ")}</td>
                    <td>{u.twoFactor ? <span className="pill pill-positive">{t("admin.enabled")}</span> : <span className="pill pill-warning">{t("admin.disabled")}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "stock" && (
        <>
          <div className="grid-2">
            <div className="card">
              <h2 className="section">{t("admin.section_inventory")}</h2>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <select className="input" style={{ width: 260 }} value={adjProduct} onChange={(e) => setAdjProduct(e.target.value)}>
                  {PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input className="input" type="number" placeholder={t("admin.col_delta")} value={adjDelta} onChange={(e) => setAdjDelta(Number(e.target.value))} style={{ width: 120 }} />
                <input className="input" placeholder={t("admin.col_reason")} value={adjReason} onChange={(e) => setAdjReason(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
                <button className="btn btn-primary" onClick={adjustStock}>{t("admin.btn_apply")}</button>
              </div>
            </div>
            <div className="card">
              <h2 className="section">{t("admin.section_tracking")}</h2>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <input className="input" placeholder={t("admin.placeholder_track_order")} value={trackOrder} onChange={(e) => setTrackOrder(e.target.value)} style={{ width: 160 }} />
                <input className="input" placeholder={t("admin.placeholder_track_courier")} value={trackCourier} onChange={(e) => setTrackCourier(e.target.value)} style={{ width: 120 }} />
                <input className="input" placeholder={t("admin.placeholder_track_number")} value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} style={{ width: 160 }} />
                <input className="input" type="date" value={trackEta} onChange={(e) => setTrackEta(e.target.value)} style={{ width: 160 }} />
                <button className="btn btn-primary" onClick={setTracking}>{t("admin.btn_set_tracking")}</button>
              </div>
            </div>
          </div>
          <div className="card">
            <h2 className="section">{t("admin.section_price_history")}</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr><th>{t("admin.col_product")}</th><th className="num">{t("admin.col_price")}</th><th>{t("admin.col_date")}</th></tr></thead>
                <tbody>
                  {priceHistory.map((p, i) => (
                    <tr key={i}>
                      <td>{PRODUCTS.find((x) => x.id === p.product)?.name ?? p.product}</td>
                      <td className="num">{p.price.toFixed(2)} zł</td>
                      <td style={{ fontSize: 12 }}>{p.at}</td>
                    </tr>
                  ))}
                  {priceHistory.length === 0 && <tr><td colSpan={3} className="muted">{t("admin.no_history")}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h2 className="section">{t("admin.section_deliveries")}</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr><th>{t("admin.col_date")}</th><th>{t("archive.col_items")}</th><th>{t("admin.col_status")}</th><th>{t("admin.col_attempts")}</th><th>{t("admin.col_error")}</th><th>{t("admin.col_code")}</th></tr></thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontSize: 12 }}>{d.at}</td>
                      <td style={{ fontSize: 12 }}>{d.event}</td>
                      <td><span className={`pill ${d.status === "sent" ? "pill-positive" : d.status === "failed" ? "pill-negative" : "pill-warning"}`}>{d.status}</span></td>
                      <td className="num">{d.attempts ?? 0}</td>
                      <td style={{ fontSize: 11, color: "var(--negative)" }}>{d.lastError ?? "-"}</td>
                      <td className="num">{d.statusCode ?? "-"}</td>
                    </tr>
                  ))}
                  {deliveries.length === 0 && <tr><td colSpan={6} className="muted">{t("admin.no_deliveries")}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "integrations" && (
        <>
          <div className="grid-2">
            <div className="card">
              <h2 className="section">{t("admin.section_webhooks")}</h2>
              <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <input className="input" placeholder="https://piekarnia.pl/webhook" value={whUrl} onChange={(e) => setWhUrl(e.target.value)} style={{ flex: 1, minWidth: 240 }} />
                <input className="input" placeholder="zdarzenia (przecinek)" value={whEvents} onChange={(e) => setWhEvents(e.target.value)} style={{ width: 220 }} />
                <button className="btn btn-primary" onClick={createWebhook}>{t("admin.btn_add")}</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th>{t("admin.col_url")}</th><th>{t("admin.col_events")}</th><th>{t("admin.col_active")}</th><th></th></tr></thead>
                  <tbody>
                    {webhooks.map((w) => (
                      <tr key={w.id}>
                        <td style={{ fontSize: 12 }} className="mono">{w.url}</td>
                        <td style={{ fontSize: 12 }}>{(w.events || []).join(", ")}</td>
                        <td>{w.active ? <span className="pill pill-positive">{t("admin.active")}</span> : <span className="pill pill-neutral">{t("admin.inactive")}</span>}</td>
                        <td style={{ display: "flex", gap: 4 }}>
                          <button className="btn" style={{ height: 24, fontSize: 11 }} onClick={() => testWebhook(w.id)}>{t("admin.btn_test")}</button>
                          <button className="btn" style={{ height: 24, fontSize: 11 }} onClick={() => deleteWebhook(w.id)}>{t("admin.btn_delete")}</button>
                        </td>
                      </tr>
                    ))}
                    {webhooks.length === 0 && <tr><td colSpan={4} className="muted">{t("admin.no_webhooks")}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <h2 className="section">{t("admin.section_api_keys")}</h2>
              <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <input className="input" placeholder={t("admin.placeholder_key_name")} value={keyName} onChange={(e) => setKeyName(e.target.value)} style={{ width: 200 }} />
                <input className="input" placeholder={t("admin.placeholder_key_scopes")} value={keyScopes} onChange={(e) => setKeyScopes(e.target.value)} style={{ width: 200 }} />
                <button className="btn btn-primary" onClick={createApiKey}>{t("admin.btn_create")}</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th>{t("admin.col_name")}</th><th>{t("admin.col_prefix")}</th><th>{t("admin.col_scopes")}</th><th>{t("admin.col_status")}</th><th></th></tr></thead>
                  <tbody>
                    {apiKeys.map((k) => (
                      <tr key={k.id}>
                        <td>{k.name}</td>
                        <td className="mono" style={{ fontSize: 12 }}>{k.prefix}…</td>
                        <td style={{ fontSize: 12 }}>{(k.scopes || []).join(", ")}</td>
                        <td>{k.revoked ? <span className="pill pill-negative">{t("admin.revoked")}</span> : <span className="pill pill-positive">{t("admin.enabled")}</span>}</td>
                        <td>{!k.revoked && <button className="btn" style={{ height: 24, fontSize: 11 }} onClick={() => revokeApiKey(k.id)}>{t("admin.btn_revoke")}</button>}</td>
                      </tr>
                    ))}
                    {apiKeys.length === 0 && <tr><td colSpan={5} className="muted">{t("admin.no_api_keys")}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="card">
            <h2 className="section">{t("admin.section_backup")}</h2>
            {backupSchedule && (
              <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Harmonogram: godzina {backupSchedule.hour}:00, retencja {backupSchedule.retention} kopii. Ostatnia: {backupSchedule.lastRun ?? "brak"}.
              </p>
            )}
            <button className="btn btn-primary" onClick={runBackup}>{t("admin.btn_run_backup")}</button>
          </div>
        </>
      )}

      {activeTab === "settings" && (
        <>
          <div className="grid-2">
            <div className="card">
              <h2 className="section">{t("admin.section_min_qty")}</h2>
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
              <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>{t("admin.first_12_products")}</p>
            </div>
            <div className="card">
              <h2 className="section">{t("admin.section_2fa")}</h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Status: {twoFaEnabled ? <span className="pill pill-positive">{t("admin.enabled")}</span> : <span className="pill pill-warning">{t("admin.disabled")}</span>}
              </p>
              {!twoFaEnabled && !twoFaSecret && (
                <button className="btn btn-primary" onClick={setup2fa}>{t("admin.btn_enable_2fa")}</button>
              )}
              {twoFaSecret && (
                <div className="stack" style={{ gap: 8 }}>
                  <div className="muted" style={{ fontSize: 12 }}>{t("admin.secret_label")} <span className="mono">{twoFaSecret}</span></div>
                  <div className="muted" style={{ fontSize: 12, wordBreak: "break-all" }}>{t("admin.uri_label")}: {twoFaUri}</div>
                  <input className="input" placeholder={t("admin.code_placeholder")} value={twoFaCode} onChange={(e) => setTwoFaCode(e.target.value)} style={{ width: 160 }} />
                  <button className="btn btn-primary" onClick={verify2fa}>{t("admin.btn_verify_2fa")}</button>
                </div>
              )}
              {twoFaMsg && <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{twoFaMsg}</p>}
            </div>
          </div>
          <div className="card">
            <h2 className="section">{t("admin.section_settlements")}</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr><th>{t("admin.col_shop")}</th><th className="num">{t("admin.col_revenue")}</th><th className="num">{t("admin.col_cost")}</th><th className="num">{t("admin.col_margin")}</th></tr></thead>
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
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("admin.settlement_hint")}</p>
          </div>
        </>
      )}
    </div>
  );
}
