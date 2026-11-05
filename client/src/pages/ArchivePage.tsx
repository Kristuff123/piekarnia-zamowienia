import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { SHOPS, PRODUCTS, ORDERS, Order } from "../lib/data";
import { Download, XCircle } from "lucide-react";

export default function ArchivePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const visible = ORDERS.filter((o) =>
    user?.role === "admin" ? true : user?.shops.includes(o.shop)
  );

  const cancel = (o: Order) => {
    if (o.status !== "wysłane") return;
    o.status = "anulowane";
    o.history.push({ status: "anulowane", at: new Date().toISOString().slice(0, 16).replace("T", " ") });
  };

  const exportCsv = () => {
    const rows = ["Nr,Sklep,Pozycje,Data,Status,Notatka"];
    visible.forEach((o) => {
      const shop = SHOPS.find((s) => s.id === o.shop)?.name ?? o.shop;
      const items = o.lines.map((l) => `${l.label} x${l.qty}`).join("; ");
      rows.push(`"${o.id}","${shop}","${items}","${o.createdAt}","${o.status}","${o.note ?? ""}"`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "zamowienia.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="title">Archiwum zamówień</h1>
          <p className="muted">Historia zamówień. Użyj istniejącego zamówienia jako szablonu nowego.</p>
        </div>
        <button className="btn" onClick={exportCsv}><Download size={14} /> Eksport CSV</button>
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
                    <td style={{ fontSize: 13 }}>
                      {o.lines.map((l) => `${l.label} ×${l.qty}`).join(", ")}
                      {o.note && <div className="muted" style={{ fontSize: 11 }}>Notatka: {o.note}</div>}
                    </td>
                    <td>{o.createdAt}</td>
                    <td>
                      <span className={`pill ${o.status === "zrealizowane" ? "pill-positive" : o.status === "w realizacji" ? "pill-warning" : o.status === "anulowane" ? "pill-negative" : "pill-neutral"}`}>{o.status}</span>
                      {o.recurring && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>Cykliczne: {o.recurring.every === "weekly" ? "co tydzień" : "co miesiąc"}, następne: {o.recurring.nextRun}</div>}
                      <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                        {o.history.map((h) => `${h.status} (${h.at})`).join(" → ")}
                      </div>
                    </td>
                    <td style={{ display: "flex", gap: 4 }}>
                      <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={() => navigate("/zamowienie", { state: { template: o } })}>
                        Szablon
                      </button>
                      {o.status === "wysłane" && (
                        <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={() => cancel(o)}>
                          <XCircle size={12} /> Anuluj
                        </button>
                      )}
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
