import { useAuth } from "../lib/auth";
import { SHOPS, PRODUCTS, SALES, MIN_QTY, ORDERS, STOCK } from "../lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function ShopDashboard() {
  const { user } = useAuth();
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
        <h1 className="title">Pulpit · {shop.name}</h1>
        <p className="muted">{shop.city} · {shop.region} · dane z ostatniego dnia</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card">
          <div className="kpi-label">Przychód</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalRev.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>+8% vs poprzedni dzień</div>
        </div>
        <div className="card">
          <div className="kpi-label">Sprzedane sztuki</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalQty}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{shopSales.length} pozycji</div>
        </div>
        <div className="card">
          <div className="kpi-label">Najlepiej sprzedający</div>
          <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600 }}>{topName}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{topProduct?.qty ?? 0} szt</div>
        </div>
        <div className="card">
          <div className="kpi-label">Śr. wartość zamówienia</div>
          <div className="kpi" style={{ marginTop: 6 }}>{avgOrder.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{myOrders.length} zamówień</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section">Sprzedaż wg asortymentu</h2>
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
          <h2 className="section">Udział w sprzedaży</h2>
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
        <h2 className="section">Trend tygodniowy (przychód)</h2>
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

      <div className="grid-2">
        <div className="card">
          <h2 className="section">Ostatnie zamówienia</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>Nr</th><th>Pozycje</th><th>Data</th><th>Status</th></tr></thead>
              <tbody>
                {myOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td style={{ fontSize: 13 }}>{o.lines.map((i) => `${i.label} ×${i.qty}`).join(", ")}</td>
                    <td style={{ fontSize: 12 }}>{o.createdAt}</td>
                    <td><span className={`pill ${o.status === "zrealizowane" ? "pill-positive" : o.status === "w realizacji" ? "pill-warning" : "pill-neutral"}`}>{o.status}</span></td>
                  </tr>
                ))}
                {myOrders.length === 0 && <tr><td colSpan={4} className="muted">Brak zamówień</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h2 className="section">Terminy ważności (FEFO)</h2>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {STOCK.filter((s) => s.expiry).map((s) => {
              const p = PRODUCTS.find((x) => x.id === s.product);
              const days = Math.ceil((new Date(s.expiry!).getTime() - Date.now()) / 86400000);
              const color = days <= 2 ? "var(--negative)" : days <= 5 ? "var(--warning)" : "var(--text)";
              return <li key={s.product} style={{ color, marginBottom: 4 }}>{p?.name} — ważność {s.expiry} ({days} dni)</li>;
            })}
          </ul>
        </div>

        <div className="card">
          <h2 className="section">Alerty stanów magazynowych</h2>
          {lowStock.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>Brak alertów</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              {lowStock.map((s) => {
                const p = PRODUCTS.find((x) => x.id === s.product);
                return <li key={s.product} style={{ color: "var(--negative)", marginBottom: 4 }}>{p?.name} — stan {s.qty}, min {s.min}</li>;
              })}
            </ul>
          )}
          <h2 className="section" style={{ marginTop: 16 }}>Rekomendacje</h2>
          <p className="muted" style={{ fontSize: 13 }}>
            Zwiększ zamówienie <strong>{topName}</strong> (wysoki obrót). Rozważ ograniczenie pozycji o niskim ruchu.
          </p>
        </div>
      </div>
    </div>
  );
}
