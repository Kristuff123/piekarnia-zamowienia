import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { useT } from "../lib/i18n";
import { SHOPS, PRODUCTS, SALES, ORDERS, STOCK } from "../lib/data";
import type { StockItem } from "../lib/data";
import { apiFetch } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { t } = useT();
  const shops = SHOPS.filter((s) => user?.shops.includes(s.id));

  // Korekta magazynu: admin lub rola z uprawnieniem "approve" (zgodnie z API).
  const canAdjustStock = !!user && (user.role === "admin" || user.permissions.includes("approve"));
  const [stock, setStock] = useState<StockItem[]>(STOCK);
  const [adjProduct, setAdjProduct] = useState(PRODUCTS[0]?.id ?? "");
  const [adjDelta, setAdjDelta] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjSaving, setAdjSaving] = useState(false);
  const [adjState, setAdjState] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!canAdjustStock) return;
    apiFetch<StockItem[]>("/stock").then((d) => { if (d) setStock(d); });
  }, [canAdjustStock]);

  const adjustStock = async () => {
    const delta = Number(adjDelta);
    if (!adjProduct || !Number.isFinite(delta) || delta === 0 || !adjReason.trim()) {
      setAdjState({ kind: "error", text: t("manager.stock_validate") });
      return;
    }
    setAdjSaving(true);
    const res = await apiFetch<{ item: StockItem }>("/stock/adjust", {
      method: "POST",
      body: JSON.stringify({ product: adjProduct, delta, reason: adjReason.trim() }),
    });
    setAdjSaving(false);
    if (!res?.item) {
      setAdjState({ kind: "error", text: t("manager.stock_error") });
      return;
    }
    setStock((prev) => prev.map((s) => (s.product === res.item.product ? res.item : s)));
    const name = PRODUCTS.find((p) => p.id === adjProduct)?.name ?? adjProduct;
    setAdjState({ kind: "ok", text: t("manager.stock_saved", { product: name, delta: delta > 0 ? `+${delta}` : String(delta) }) });
    setAdjDelta("");
    setAdjReason("");
  };

  const byShop = shops.map((s) => {
    const sales = SALES.filter((x) => x.shop === s.id);
    return { name: s.name, przychód: sales.reduce((a, b) => a + b.revenue, 0), ilość: sales.reduce((a, b) => a + b.qty, 0), zamówienia: ORDERS.filter((o) => o.shop === s.id).length };
  });

  const totalRev = byShop.reduce((a, b) => a + b.przychód, 0);
  const totalQty = byShop.reduce((a, b) => a + b.ilość, 0);
  const totalOrders = byShop.reduce((a, b) => a + b.zamówienia, 0);

  const byProduct = PRODUCTS.map((p) => {
    const qty = SALES.filter((s) => shops.map((x) => x.id).includes(s.shop) && s.product === p.id).reduce((a, b) => a + b.qty, 0);
    return { name: p.name, ilość: qty };
  }).filter((x) => x.ilość > 0).sort((a, b) => b.ilość - a.ilość).slice(0, 8);

  const trendData = [
    { d: "Pn", obecny: totalRev * 0.85, poprzedni: totalRev * 0.78 },
    { d: "Wt", obecny: totalRev * 0.92, poprzedni: totalRev * 0.83 },
    { d: "Śr", obecny: totalRev * 0.97, poprzedni: totalRev * 0.88 },
    { d: "Cz", obecny: totalRev * 1.0, poprzedni: totalRev * 0.9 },
    { d: "Pt", obecny: totalRev * 1.08, poprzedni: totalRev * 0.95 },
    { d: "Sb", obecny: totalRev * 1.15, poprzedni: totalRev * 1.02 },
    { d: "Nd", obecny: totalRev * 0.72, poprzedni: totalRev * 0.65 },
  ];

  return (
    <div className="stack">
      <div>
        <h1 className="title">{t("manager.title")}</h1>
        <p className="muted">{t("manager.subtitle", { count: shops.length })}</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card">
          <div className="kpi-label">{t("manager.kpi_total_revenue")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalRev.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>+12% vs poprzedni tydzień</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("manager.kpi_units_sold")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalQty}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{byShop.length} sklepów</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("manager.kpi_orders")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalOrders}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("manager.kpi_this_week")}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("manager.kpi_best_shop")}</div>
          <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600 }}>{byShop.slice().sort((a, b) => b.przychód - a.przychód)[0]?.name ?? "-"}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("manager.kpi_by_revenue")}</div>
        </div>
      </div>

      {canAdjustStock && (
        <div className="card">
          <h2 className="section">{t("manager.section_stock")}</h2>
          <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <select
              className="input"
              style={{ width: 240 }}
              value={adjProduct}
              onChange={(e) => setAdjProduct(e.target.value)}
              aria-label={t("manager.stock_product")}
            >
              {PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input
              className="input"
              type="number"
              step="1"
              placeholder={t("manager.stock_delta")}
              value={adjDelta}
              onChange={(e) => setAdjDelta(e.target.value)}
              style={{ width: 130 }}
              aria-label={t("manager.stock_delta")}
            />
            <input
              className="input"
              placeholder={t("manager.stock_reason")}
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
              aria-label={t("manager.stock_reason")}
            />
            <button className="btn btn-primary" onClick={adjustStock} disabled={adjSaving}>
              {adjSaving ? t("manager.stock_saving") : t("manager.stock_apply")}
            </button>
          </div>
          {adjState && (
            <p
              role="status"
              style={{ fontSize: 12, marginTop: 0, marginBottom: 8, color: adjState.kind === "ok" ? "var(--accent)" : "var(--negative)" }}
            >
              {adjState.text}
            </p>
          )}
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>{t("manager.stock_product")}</th>
                  <th className="num">{t("manager.stock_qty")}</th>
                  <th className="num">{t("manager.stock_min")}</th>
                  <th>{t("manager.stock_location")}</th>
                  <th>{t("manager.stock_expiry")}</th>
                  <th>{t("manager.stock_status")}</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((s) => {
                  const low = s.qty < s.min;
                  return (
                    <tr key={s.product}>
                      <td style={{ fontWeight: 500 }}>{PRODUCTS.find((p) => p.id === s.product)?.name ?? s.product}</td>
                      <td className="num">{s.qty}</td>
                      <td className="num">{s.min}</td>
                      <td>{s.location}</td>
                      <td>{s.expiry ?? "—"}</td>
                      <td style={{ color: low ? "var(--negative)" : "var(--muted)" }}>{low ? t("manager.stock_low") : t("manager.stock_ok")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("manager.stock_hint")}</p>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h2 className="section">{t("manager.section_revenue_by_shop")}</h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byShop}>
                <CartesianGrid stroke="#f0f1f2" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5d5f60" }} />
                <YAxis tick={{ fontSize: 11, fill: "#5d5f60" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="przychód" fill="#1b6c80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ilość" fill="#2f70bb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2 className="section">{t("manager.section_top_products")}</h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProduct} layout="vertical">
                <CartesianGrid stroke="#f0f1f2" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#5d5f60" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#5d5f60" }} width={150} />
                <Tooltip />
                <Bar dataKey="ilość" fill="#a86f0c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section">{t("manager.section_abc")}</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>{t("manager.abc_class")}</th><th>{t("manager.abc_products")}</th><th className="num">{t("manager.abc_revenue")}</th><th className="num">{t("manager.abc_share")}</th></tr></thead>
            <tbody>
              {(() => {
                const sorted = byProduct.map((p) => ({ ...p, rev: p.ilość * (PRODUCTS.find((x) => x.name === p.name)?.price ?? 1) })).sort((a, b) => b.rev - a.rev);
                const total = sorted.reduce((a, b) => a + b.rev, 0);
                let cum = 0;
                const classes: Record<string, { count: number; rev: number }> = { A: { count: 0, rev: 0 }, B: { count: 0, rev: 0 }, C: { count: 0, rev: 0 } };
                sorted.forEach((p) => {
                  cum += p.rev;
                  const pct = (cum / total) * 100;
                  const cls = pct <= 80 ? "A" : pct <= 95 ? "B" : "C";
                  classes[cls].count += 1;
                  classes[cls].rev += p.rev;
                });
                return (["A", "B", "C"] as const).map((c) => (
                  <tr key={c}>
                    <td style={{ fontWeight: 600 }}>{c}</td>
                    <td>{classes[c].count}</td>
                    <td className="num">{classes[c].rev.toFixed(0)} zł</td>
                    <td className="num">{total ? ((classes[c].rev / total) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("manager.abc_hint")}</p>
      </div>

      <div className="card">
        <h2 className="section">{t("manager.section_period_compare")}</h2>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke="#f0f1f2" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#5d5f60" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5d5f60" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="obecny" stroke="#1b6c80" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="poprzedni" stroke="#cdced1" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="section">{t("manager.section_shop_compare")}</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr><th>{t("manager.compare_shop")}</th><th>{t("manager.compare_city")}</th><th className="num">{t("manager.compare_revenue")}</th><th className="num">{t("manager.compare_units")}</th><th className="num">{t("manager.compare_orders")}</th><th className="num">{t("manager.compare_items")}</th></tr>
            </thead>
            <tbody>
              {byShop.map((s) => {
                const sh = shops.find((x) => x.name === s.name)!;
                const items = new Set(SALES.filter((x) => x.shop === sh.id).map((x) => x.product)).size;
                return (
                  <tr key={sh.id}>
                    <td style={{ fontWeight: 500 }}>{sh.name}</td>
                    <td>{sh.city}</td>
                    <td className="num">{s.przychód.toFixed(0)} zł</td>
                    <td className="num">{s.ilość}</td>
                    <td className="num">{s.zamówienia}</td>
                    <td className="num">{items}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
