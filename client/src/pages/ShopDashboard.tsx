import { useAuth } from "../lib/auth";
import { useT } from "../lib/i18n";
import { SHOPS, PRODUCTS, SALES, MIN_QTY, ORDERS, STOCK } from "../lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function ShopDashboard() {
  const { user } = useAuth();
  const { t } = useT();
  const shopId = user?.shops[0] ?? "s1";
  const shop = SHOPS.find((s) => s.id === shopId)!;

  const shopSales = SALES.filter((s) => s.shop === shopId);
  const totalRev = shopSales.reduce((a, b) => a + b.revenue, 0);
  const totalQty = shopSales.reduce((a, b) => a + b.qty, 0);
  const sorted = shopSales.slice().sort((a, b) => b.qty - a.qty);
  const topProduct = sorted[0];
  const topName = PRODUCTS.find((p) => p.id === topProduct?.product)?.name ?? "—";
  const avgOrder = totalRev / Math.max(1, ORDERS.filter((o) => o.shop === shopId).length);
  const myOrders = ORDERS.filter((o) => o.shop === shopId);

  const chartData = shopSales.map((s) => ({
    name: PRODUCTS.find((p) => p.id === s.product)?.name?.split(" ")[0] ?? s.product,
    ilość: s.qty,
    przychód: s.revenue,
  }));

  const pieData = shopSales.map((s) => ({
    name: PRODUCTS.find((p) => p.id === s.product)?.name?.split(" ")[0] ?? s.product,
    value: s.qty,
  }));
  const COLORS = ["#1b6c80", "#2f70bb", "#a86f0c", "#1e7b4f", "#c4242a", "#5d5f60", "#92400e", "#353736"];

  const trendData = [
    { d: "Pn", rev: totalRev * 0.82 },
    { d: "Wt", rev: totalRev * 0.91 },
    { d: "Śr", rev: totalRev * 0.95 },
    { d: "Cz", rev: totalRev * 1.0 },
    { d: "Pt", rev: totalRev * 1.08 },
    { d: "Sb", rev: totalRev * 1.15 },
    { d: "Nd", rev: totalRev * 0.7 },
  ];

  const lowStock = STOCK.filter((s) => s.qty < s.min && s.product);

  return (
    <div className="stack">
      <div>
        <h1 className="title">{t("shop.title", { shop: shop.name })}</h1>
        <p className="muted">{t("shop.subtitle", { city: shop.city, region: shop.region })}</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card">
          <div className="kpi-label">{t("shop.kpi_revenue")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalRev.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("shop.kpi_vs_prev_day")}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("shop.kpi_items_sold")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalQty}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("shop.kpi_positions", { count: shopSales.length })}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("shop.kpi_top_seller")}</div>
          <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600 }}>{topName}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("shop.kpi_units", { qty: topProduct?.qty ?? 0 })}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{t("shop.kpi_avg_order")}</div>
          <div className="kpi" style={{ marginTop: 6 }}>{avgOrder.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t("shop.kpi_orders", { count: myOrders.length })}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section">{t("shop.section_sales_by_product")}</h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#f0f1f2" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5d5f60" }} />
                <YAxis tick={{ fontSize: 11, fill: "#5d5f60" }} />
                <Tooltip />
                <Bar dataKey="ilość" fill="#1b6c80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="przychód" fill="#2f70bb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2 className="section">{t("shop.section_sales_share")}</h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 11 }}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section">{t("shop.section_weekly_trend")}</h2>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke="#f0f1f2" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#5d5f60" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5d5f60" }} />
              <Tooltip />
              <Line type="monotone" dataKey="rev" stroke="#1b6c80" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="section">{t("shop.section_forecast")}</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>{t("shop.col_product")}</th><th className="num">{t("shop.col_qty")}</th><th className="num">{t("shop.forecast_suggested")}</th></tr></thead>
            <tbody>
              {shopSales.map((s) => {
                const p = PRODUCTS.find((x) => x.id === s.product);
                const suggested = Math.ceil(s.qty * 1.15);
                return (
                  <tr key={s.product}>
                    <td>{p?.name}</td>
                    <td className="num">{s.qty}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{suggested}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t("shop.forecast_hint")}</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section">{t("shop.section_last_orders")}</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>{t("archive.col_nr")}</th><th>{t("archive.col_items")}</th><th>{t("archive.col_date")}</th><th>{t("archive.col_status")}</th></tr></thead>
              <tbody>
                {myOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td style={{ fontSize: 13 }}>{o.lines.map((i) => `${i.label} ×${i.qty}`).join(", ")}</td>
                    <td style={{ fontSize: 12 }}>{o.createdAt}</td>
                    <td><span className={`pill ${o.status === "zrealizowane" ? "pill-positive" : o.status === "w realizacji" ? "pill-warning" : "pill-neutral"}`}>{o.status}</span></td>
                  </tr>
                ))}
                {myOrders.length === 0 && <tr><td colSpan={4} className="muted">{t("archive.no_orders")}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h2 className="section">{t("shop.section_fefo")}</h2>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {STOCK.filter((s) => s.expiry).map((s) => {
              const p = PRODUCTS.find((x) => x.id === s.product);
              const days = Math.ceil((new Date(s.expiry!).getTime() - Date.now()) / 86400000);
              const color = days <= 2 ? "var(--negative)" : days <= 5 ? "var(--warning)" : "var(--text)";
              return <li key={s.product} style={{ color, marginBottom: 4 }}>{t("shop.stock_item", { name: String(p?.name ?? s.product ?? ""), date: String(s.expiry ?? ""), days })}</li>;
            })}
          </ul>
        </div>

        <div className="card">
          <h2 className="section">{t("shop.section_stock_alerts")}</h2>
          {lowStock.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>{t("shop.no_alerts")}</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              {lowStock.map((s) => {
                const p = PRODUCTS.find((x) => x.id === s.product);
                return <li key={s.product} style={{ color: "var(--negative)", marginBottom: 4 }}>{t("shop.stock_alert_item", { name: p?.name ?? s.product, qty: s.qty, min: s.min })}</li>;
              })}
            </ul>
          )}
          <h2 className="section" style={{ marginTop: 16 }}>{t("shop.section_recommendations")}</h2>
          <p className="muted" style={{ fontSize: 13 }} dangerouslySetInnerHTML={{ __html: t("shop.recommendation_text", { name: String(topName) }) }} />
        </div>
      </div>
    </div>
  );
}
