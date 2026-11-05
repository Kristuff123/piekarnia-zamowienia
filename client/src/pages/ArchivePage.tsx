import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { SHOPS, PRODUCTS, ORDERS, Order } from "../lib/data";

export default function ArchivePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const visible = ORDERS.filter((o) =>
    user?.role === "admin" ? true : user?.shops.includes(o.shop)
  );

  return (
    <div className="stack">
      <div>
        <h1 className="title">Archiwum zamówień</h1>
        <p className="muted">Historia zamówień. Użyj istniejącego zamówienia jako szablonu nowego.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr><th>Nr</th><th>Sklep</th><th>Pozycje</th><th>Data</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map((o: Order) => {
                const shop = SHOPS.find((s) => s.id === o.shop);
                return (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td>{shop?.name}</td>
                    <td style={{ fontSize: 13 }}>{o.lines.map((l) => `${l.label} ×${l.qty}`).join(", ")}</td>
                    <td>{o.createdAt}</td>
                    <td>
                      <span className={`pill ${o.status === "zrealizowane" ? "pill-positive" : o.status === "w realizacji" ? "pill-warning" : "pill-neutral"}`}>{o.status}</span>
                      <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                        {o.history.map((h) => `${h.status} (${h.at})`).join(" → ")}
                      </div>
                    </td>
                    <td>
                      <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={() => navigate("/zamowienie", { state: { template: o } })}>
                        Użyj jako szablon
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && <tr><td colSpan={6} className="muted">Brak zamówień</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
