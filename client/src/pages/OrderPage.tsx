import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useT } from "../lib/i18n";
import { PRODUCTS, MIN_QTY, SHOPS, Order, ORDERS, CAKES, ALLERGIES, Cake, CakeConfig, OrderLine, TEMPLATES, reserveStock } from "../lib/data";
import { apiFetch } from "../lib/api";
import { Plus, Trash2 } from "lucide-react";

export default function OrderPage() {
  const { user } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = user?.shops[0] ?? "s1";
  const shop = SHOPS.find((s) => s.id === shopId)!;
  const mins = MIN_QTY[shopId] ?? {};

  const [tab, setTab] = useState<"produkty" | "torty">("produkty");
  const [catFilter, setCatFilter] = useState<string>("Wszystkie");
  const [qty, setQty] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    PRODUCTS.forEach((p) => (init[p.id] = mins[p.id] ?? 0));
    return init;
  });
  const [cakeLines, setCakeLines] = useState<OrderLine[]>([]);
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState<"none" | "weekly" | "monthly">("none");
  const [submitted, setSubmitted] = useState<Order | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [templateName, setTemplateName] = useState("");

  const repeatLast = () => {
    const last = ORDERS.find((o) => o.shop === shopId);
    if (!last) return;
    const newQty = { ...qty };
    const newCakes: OrderLine[] = [];
    last.lines.forEach((l) => {
      if (l.kind === "product") newQty[l.ref] = (newQty[l.ref] ?? 0) + l.qty;
      else newCakes.push({ ...l });
    });
    setQty(newQty);
    setCakeLines(newCakes);
  };

  const saveTemplate = () => {
    const lines: OrderLine[] = [
      ...PRODUCTS.filter((p) => qty[p.id] > 0).map((p) => ({ kind: "product" as const, ref: p.id, label: p.name, qty: qty[p.id], unitPrice: p.price })),
      ...cakeLines,
    ];
    if (lines.length === 0) return;
    TEMPLATES.unshift({ id: "t-" + Date.now(), shop: shopId, user: user!.id, name: templateName || `Szablon ${TEMPLATES.length + 1}`, lines, createdAt: new Date().toISOString().slice(0, 16).replace("T", " ") });
    setTemplateName("");
  };

  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const newQty: Record<string, number> = {};
    PRODUCTS.forEach((p) => (newQty[p.id] = mins[p.id] ?? 0));
    const newCakes: OrderLine[] = [];
    t.lines.forEach((l) => {
      if (l.kind === "product") newQty[l.ref] = (newQty[l.ref] ?? 0) + l.qty;
      else newCakes.push({ ...l });
    });
    setQty(newQty);
    setCakeLines(newCakes);
  };

  // cake configurator state
  const [activeCake, setActiveCake] = useState<Cake | null>(null);
  const [cakeSize, setCakeSize] = useState("");
  const [cakeFlavor, setCakeFlavor] = useState("");
  const [inscription, setInscription] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cakeQty, setCakeQty] = useState(1);

  // barcode scanner
  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        const BD = (window as any).BarcodeDetector;
        if (!BD) { alert("BarcodeDetector nie jest wspierany w tej przeglądarce"); setScanning(false); return; }
        const detector = new BD({ formats: ["ean_13", "code_128", "qr_code"] });
        const tick = async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              const val = codes[0].rawValue;
              const prod = PRODUCTS.find((p) => p.sku === val);
              if (prod) setQty((q) => ({ ...q, [prod.id]: (q[prod.id] ?? 0) + 1 }));
              setScanning(false);
            }
          } catch {}
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        alert("Brak dostępu do kamery");
        setScanning(false);
      }
    };
    start();
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); cancelAnimationFrame(raf); };
  }, [scanning]);

  // prefill from archived order
  useEffect(() => {
    const tpl = (location.state as { template?: Order } | null)?.template;
    if (!tpl) return;
    const newQty = { ...qty };
    const newCakes: OrderLine[] = [];
    tpl.lines.forEach((l) => {
      if (l.kind === "product") {
        newQty[l.ref] = (newQty[l.ref] ?? 0) + l.qty;
      } else {
        newCakes.push({ ...l });
      }
    });
    setQty(newQty);
    setCakeLines(newCakes);
  }, []);

  const openConfigurator = (c: Cake) => {
    setActiveCake(c);
    setCakeSize(c.sizes[0].id);
    setCakeFlavor(c.flavors[0].id);
    setInscription("");
    setExtras([]);
    setAllergies([]);
    setCakeQty(1);
  };

  const addCake = () => {
    if (!activeCake) return;
    const size = activeCake.sizes.find((s) => s.id === cakeSize)!;
    const flavor = activeCake.flavors.find((f) => f.id === cakeFlavor)!;
    const line: OrderLine = {
      kind: "cake",
      ref: activeCake.id,
      label: `${activeCake.name} · ${size.label} · ${flavor.label}`,
      qty: cakeQty,
      unitPrice: size.price,
      cakeConfig: {
        size: size.label,
        flavor: flavor.label,
        inscription: inscription.trim() || undefined,
        extras,
        allergies,
      },
    };
    setCakeLines((prev) => [...prev, line]);
    setActiveCake(null);
  };

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const total =
    PRODUCTS.reduce((a, p) => a + qty[p.id] * p.price, 0) +
    cakeLines.reduce((a, l) => a + l.qty * l.unitPrice, 0);

  const submit = () => {
    const lines: OrderLine[] = [
      ...PRODUCTS.filter((p) => qty[p.id] > 0).map((p) => ({
        kind: "product" as const,
        ref: p.id,
        label: p.name,
        qty: qty[p.id],
        unitPrice: p.price,
      })),
      ...cakeLines,
    ];
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const order: Order = {
      id: "z-" + (1000 + ORDERS.length + 1),
      shop: shopId,
      user: user!.id,
      lines,
      createdAt: now,
      status: "wysłane",
      note: note.trim() || undefined,
      recurring: recurring !== "none" ? { every: recurring, nextRun: new Date(Date.now() + (recurring === "weekly" ? 7 : 30) * 86400000).toISOString().slice(0, 10) } : undefined,
      history: [{ status: "wysłane", at: now }],
    };
    reserveStock(lines);
    ORDERS.unshift(order);
    apiFetch("/webhooks/emit", { method: "POST", body: JSON.stringify({ event: "document.indexed", payload: { orderId: order.id } }) }).catch(() => {});
    setSubmitted(order);
  };

  if (submitted) {
    return (
      <div className="card" style={{ maxWidth: 520 }}>
        <h1 className="title">{t("order.order_sent")}</h1>
        <p className="muted">{t("order.order_sent_detail", { id: submitted.id, name: user?.name ?? "" })}</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setSubmitted(null); navigate("/archiwum"); }}>
          {t("order.btn_see_archive")}
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <h1 className="title">{t("order.title", { shop: shop.name })}</h1>
        <p className="muted">{t("order.subtitle")}</p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className={`btn ${tab === "produkty" ? "btn-primary" : ""}`} onClick={() => setTab("produkty")}>{t("order.tab_products")}</button>
        <button className={`btn ${tab === "torty" ? "btn-primary" : ""}`} onClick={() => setTab("torty")}>{t("order.tab_cakes")}</button>
        <button className="btn" onClick={() => setScanning(true)}>{t("order.btn_scan")}</button>
        <button className="btn" onClick={repeatLast}>{t("order.btn_repeat")}</button>
        <select className="input" style={{ width: 200 }} onChange={(e) => loadTemplate(e.target.value)} defaultValue="">
          <option value="">{t("order.load_template")}</option>
          {TEMPLATES.filter((t) => t.shop === shopId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input className="input" style={{ width: 160 }} placeholder={t("order.template_name")} value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
        <button className="btn" onClick={saveTemplate}>{t("order.btn_save_template")}</button>
      </div>

      {scanning && (
        <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }} />
          <button className="btn" style={{ position: "absolute", top: 8, right: 8 }} onClick={() => setScanning(false)}>{t("order.btn_close")}</button>
        </div>
      )}

      {tab === "produkty" && (
        <>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {["Wszystkie", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))].map((c) => (
              <button key={c} className={`btn ${catFilter === c ? "btn-primary" : ""}`} style={{ height: 28, fontSize: 12 }} onClick={() => setCatFilter(c)}>{c === "Wszystkie" ? t("order.filter_all") : c}</button>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr><th>{t("order.table_product")}</th><th>{t("order.table_category")}</th><th className="num">{t("order.table_price")}</th><th className="num">{t("order.table_min_qty")}</th><th className="num">{t("order.table_order_qty")}</th><th className="num">{t("order.table_value")}</th></tr>
              </thead>
              <tbody>
                {PRODUCTS.filter((p) => catFilter === "Wszystkie" || p.category === catFilter).map((p) => (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: 500 }}>{p.name}</div><div className="muted mono" style={{ fontSize: 11 }}>{p.sku}</div></td>
                    <td>{p.category}</td>
                    <td className="num">{p.price.toFixed(2)} zł</td>
                    <td className="num">{mins[p.id] ?? 0}</td>
                    <td className="num">
                      <input className="input" type="number" min={mins[p.id] ?? 0} value={qty[p.id]} onChange={(e) => setQty({ ...qty, [p.id]: Number(e.target.value) })} aria-label={`Ilość ${p.name}`} style={{ width: 80, textAlign: "right" }} />
                    </td>
                    <td className="num">{(qty[p.id] * p.price).toFixed(2)} zł</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {tab === "torty" && (
        <div className="stack">
          <div className="grid-3">
            {CAKES.map((c) => (
              <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <img src="https://bagietka.pl/wp-content/uploads/2025/03/4f238c_02b3c95c67894423af92b5e9ac9eec58mv2-2.avif" alt={c.name} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>{c.description}</p>
                <button className="btn btn-primary" onClick={() => openConfigurator(c)} style={{ width: "100%", justifyContent: "center" }}>
                  <Plus size={14} /> Konfiguruj
                </button>
              </div>
              </div>
            ))}
          </div>

          {cakeLines.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th>Tort</th><th className="num">Ilość</th><th className="num">Cena</th><th></th></tr></thead>
                  <tbody>
                    {cakeLines.map((l, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{l.label}</div>
                          {l.cakeConfig?.inscription && <div className="muted" style={{ fontSize: 12 }}>{t("order.cake_inscription_label")} „{l.cakeConfig.inscription}"</div>}
                          {l.cakeConfig?.extras?.length ? <div className="muted" style={{ fontSize: 12 }}>{t("order.cake_extras_label")} {l.cakeConfig.extras.join(", ")}</div> : null}
                          {l.cakeConfig?.allergies?.length ? <div className="muted" style={{ fontSize: 12 }}>{t("order.cake_allergies_label")} {l.cakeConfig.allergies.join(", ")}</div> : null}
                        </td>
                        <td className="num">{l.qty}</td>
                        <td className="num">{(l.qty * l.unitPrice).toFixed(2)} zł</td>
                        <td className="num"><button className="btn btn-ghost" onClick={() => setCakeLines((p) => p.filter((_, idx) => idx !== i))} aria-label="Usuń"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCake && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 50 }} onClick={() => setActiveCake(null)}>
          <div className="card" style={{ width: 480, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 className="section">{activeCake.name}</h2>
            <div className="stack">
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="kpi-label">{t("order.cake_size")}</span>
                <select className="input" value={cakeSize} onChange={(e) => setCakeSize(e.target.value)}>
                  {activeCake.sizes.map((s) => <option key={s.id} value={s.id}>{s.label} — {s.price.toFixed(2)} zł</option>)}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="kpi-label">{t("order.cake_flavor")}</span>
                <select className="input" value={cakeFlavor} onChange={(e) => setCakeFlavor(e.target.value)}>
                  {activeCake.flavors.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="kpi-label">{t("order.cake_qty")}</span>
                <input className="input" type="number" min={1} value={cakeQty} onChange={(e) => setCakeQty(Number(e.target.value))} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="kpi-label">{t("order.cake_inscription")}</span>
                <input className="input" placeholder={t("order.cake_inscription_placeholder")} value={inscription} onChange={(e) => setInscription(e.target.value)} />
              </label>
              <div>
                <div className="kpi-label" style={{ marginBottom: 6 }}>{t("order.cake_extras")}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {activeCake.extras.map((ex) => (
                    <button key={ex} className={`btn ${extras.includes(ex) ? "btn-primary" : ""}`} style={{ height: 28, fontSize: 12 }} onClick={() => toggle(extras, ex, setExtras)}>{ex}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="kpi-label" style={{ marginBottom: 6 }}>{t("order.cake_allergies")}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ALLERGIES.map((a) => (
                    <button key={a} className={`btn ${allergies.includes(a) ? "btn-primary" : ""}`} style={{ height: 28, fontSize: 12 }} onClick={() => toggle(allergies, a, setAllergies)}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
                <button className="btn" onClick={() => setActiveCake(null)}>{t("order.btn_cancel")}</button>
                <button className="btn btn-primary" onClick={addCake}>{t("order.btn_add_cake")}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="kpi-label">{t("order.order_value")}</div>
            <div className="kpi">{total.toFixed(2)} zł</div>
          </div>
          <div className="stack" style={{ alignItems: "flex-end" }}>
            <textarea className="input" placeholder={t("order.note_placeholder")} value={note} onChange={(e) => setNote(e.target.value)} style={{ width: 320, height: 60, padding: 8 }} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={recurring !== "none"} onChange={(e) => setRecurring(e.target.checked ? "weekly" : "none")} />
              {t("order.recurring_label")}
            </label>
            {recurring !== "none" && (
              <select className="input" value={recurring} onChange={(e) => setRecurring(e.target.value as "weekly" | "monthly")} style={{ width: 200 }}>
                <option value="weekly">{t("order.recurring_weekly")}</option>
                <option value="monthly">{t("order.recurring_monthly")}</option>
              </select>
            )}
            {!(user?.permissions?.includes("order") || user?.role === "admin" || user?.role === "manager") && (
              <div style={{ color: "var(--negative)", fontSize: 12 }}>{t("order.order_no_permission")}</div>
            )}
            <button className="btn btn-primary" onClick={submit} disabled={!(user?.permissions?.includes("order") || user?.role === "admin" || user?.role === "manager")}>{t("order.btn_send")}</button>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>{t("order.order_signed_as", { name: user?.name ?? "", login: user?.login ?? "" })}</p>
      </div>
    </div>
  );
}
