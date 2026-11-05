import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useT } from "../lib/i18n";
import { SHOPS, PRODUCTS, ORDERS, Order } from "../lib/data";
import { Download, XCircle, Printer } from "lucide-react";

export default function ArchivePage() {
  const { user } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const visible = ORDERS.filter((o) =>
    user?.role === "admin" ? true : user?.shops.includes(o.shop)
  );

  const cancel = (o: Order) => {
    if (o.status !== "wysłane") return;
    o.status = "anulowane";
    o.history.push({ status: "anulowane", at: new Date().toISOString().slice(0, 16).replace("T", " ") });
  };

  const printInvoice = (o: Order) => {
    const shop = SHOPS.find((s) => s.id === o.shop);
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = o.lines.map((l) => `<tr><td>${l.label}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${l.unitPrice.toFixed(2)}</td><td style="text-align:right">${(l.qty * l.unitPrice).toFixed(2)}</td></tr>`).join("");
    const total = o.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0).toFixed(2);
    w.document.write(`<!DOCTYPE html><html><head><title>${t("archive.invoice_title", { id: o.id })}</title><style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px}th{background:#f4f6f8}</style></head><body><h1>${t("archive.invoice_title", { id: o.id })}</h1><p><strong>${t("archive.invoice_shop", { name: shop?.name ?? "", city: shop?.city ?? "" })}</strong></p><p>${t("archive.invoice_date", { date: o.createdAt })}</p><p>${t("archive.invoice_status", { status: o.status })}</p><table><thead><tr><th>${t("archive.invoice_item")}</th><th>${t("archive.invoice_qty")}</th><th>${t("archive.invoice_price")}</th><th>${t("archive.invoice_value")}</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3" style="text-align:right;font-weight:bold">${t("archive.invoice_total")}</td><td style="text-align:right;font-weight:bold">${total} zł</td></tr></tfoot></table>${o.note ? `<p><strong>${t("archive.invoice_note", { note: o.note })}</strong></p>` : ""}<p style="margin-top:24px;font-size:12px;color:#666">${t("archive.invoice_footer")}</p></body></html>`);
    w.document.close();
    w.print();
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
          <h1 className="title">{t("archive.title")}</h1>
          <p className="muted">{t("archive.subtitle")}</p>
        </div>
        <button className="btn" onClick={exportCsv}><Download size={14} /> {t("archive.btn_export_csv")}</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr><th>{t("archive.col_nr")}</th><th>{t("archive.col_shop")}</th><th>{t("archive.col_items")}</th><th>{t("archive.col_date")}</th><th>{t("archive.col_status")}</th><th>{t("archive.col_action")}</th></tr>
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
                      {o.note && <div className="muted" style={{ fontSize: 11 }}>{t("archive.note_label")} {o.note}</div>}
                    </td>
                    <td>{o.createdAt}</td>
                    <td>
                      <span className={`pill ${o.status === "zrealizowane" ? "pill-positive" : o.status === "w realizacji" ? "pill-warning" : o.status === "anulowane" ? "pill-negative" : "pill-neutral"}`}>{o.status}</span>
                      {o.recurring && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{t("archive.recurring", { freq: o.recurring.every === "weekly" ? t("order.recurring_weekly") : t("order.recurring_monthly"), next: o.recurring.nextRun })}</div>}
                      {o.tracking && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{t("archive.delivery", { courier: o.tracking.courier, number: o.tracking.number, eta: o.tracking.eta })}</div>}
                      <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                        {o.history.map((h) => `${h.status} (${h.at})`).join(" → ")}
                      </div>
                    </td>
                    <td style={{ display: "flex", gap: 4 }}>
                      <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={() => navigate("/zamowienie", { state: { template: o } })}>
                        {t("archive.btn_template")}
                      </button>
                      <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={() => printInvoice(o)}>
                        <Printer size={12} /> {t("archive.btn_invoice")}
                      </button>
                      {o.status === "wysłane" && (
                        <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={() => cancel(o)}>
                          <XCircle size={12} /> {t("archive.btn_cancel")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && <tr><td colSpan={6} className="muted">{t("archive.no_orders")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
