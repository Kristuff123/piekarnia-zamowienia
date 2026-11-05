import { useAuth } from "../lib/auth";
import { SHOPS, PRODUCTS, SALES, ORDERS } from "../lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const shops = SHOPS.filter((s) => user?.shops.includes(s.id));

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
        <h1 className="title">Panel managera</h1>
        <p className="muted">Zbiorczy widok {shops.length} przypisanych sklepów</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card">
          <div className="kpi-label">Przychód łączny</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalRev.toFixed(0)} zł</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>+12% vs poprzedni tydzień</div>
        </div>
        <div className="card">
          <div className="kpi-label">Sprzedane sztuki</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalQty}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{byShop.length} sklepów</div>
        </div>
        <div className="card">
          <div className="kpi-label">Zamówienia</div>
          <div className="kpi" style={{ marginTop: 6 }}>{totalOrders}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>w tym tygodniu</div>
        </div>
        <div className="card">
          <div className="kpi-label">Najlepszy sklep</div>
          <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600 }}>{byShop.slice().sort((a, b) => b.przychód - a.przychód)[0]?.name ?? "—"}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>wg przychodu</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section">Przychód wg sklepu</h2>
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
          <h2 className="section">Najlepiej sprzedające się pozycje</h2>
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
        <h2 className="section">Analiza ABC (wg przychodu)</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Klasa</th><th>Produkty</th><th className="num">Przychód</th><th className="num">Udział</th></tr></thead>
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
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>A = 80% przychodu, B = kolejne 15%, C = reszta.</p>
      </div>

      <div className="card">
        <h2 className="section">Porównanie okresów (obecny vs poprzedni tydzień)</h2>
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
        <h2 className="section">Porównanie sklepów</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr><th>Sklep</th><th>Miasto</th><th className="num">Przychód</th><th className="num">Sztuki</th><th className="num">Zamówienia</th><th className="num">Pozycji</th></tr>
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
