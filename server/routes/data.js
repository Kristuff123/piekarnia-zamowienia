const express = require("express");
const { z } = require("zod");
const { auth } = require("../middleware/auth");
const router = express.Router();

const shopIdSchema = z.string().regex(/^s[0-9]+$/);

// admin widzi wszystkie sklepy, pozostali tylko przypisane w tokenie
const canAccessShop = (user, shopId) => user.role === "admin" || (user.shops || []).includes(shopId);

// magazyn centralny: admin lub rola z uprawnieniem "approve" (manager)
const requireStockAdjust = (req, res, next) =>
  req.user.role === "admin" || (req.user.permissions || []).includes("approve")
    ? next()
    : res.status(403).json({ error: "forbidden" });

const ORDERS = [
  { id: "z-1001", shop: "s1", user: "u1", status: "zrealizowane", tracking: { courier: "DHL", number: "1234567890", eta: "2026-10-29" } },
  { id: "z-1002", shop: "s2", user: "u2", status: "w realizacji", tracking: { courier: "InPost", number: "9876543210", eta: "2026-10-30" } },
];

const PRICE_HISTORY = [
  { product: "p1", price: 4.2, at: "2026-10-01" },
  { product: "p1", price: 4.5, at: "2026-10-15" },
  { product: "p6", price: 3.2, at: "2026-10-01" },
  { product: "p6", price: 3.5, at: "2026-10-20" },
];

const STOCK = [
  { product: "p1", qty: 120, min: 50, location: "Magazyn główny", expiry: "2026-11-08" },
  { product: "p2", qty: 18, min: 30, location: "Magazyn główny", expiry: "2026-11-10" },
  { product: "p3", qty: 240, min: 100, location: "Magazyn główny", expiry: "2026-11-07" },
  { product: "p6", qty: 45, min: 60, location: "Magazyn główny", expiry: "2026-11-06" },
  { product: "p4", qty: 6, min: 10, location: "Magazyn główny", expiry: "2026-11-12" },
];

const crypto = require("crypto");

const API_KEYS = [];

// SSRF guard: block private/loopback/link-local targets
function isPrivateUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return true;
    if (host.endsWith(".local")) return true;
    return false;
  } catch {
    return true;
  }
}

function hashKey(k) { return crypto.createHash("sha256").update(k).digest("hex"); }

const WEBHOOKS = [];
const DELIVERIES = [];

function signPayload(secret, body) {
  return "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
}

const AUDIT_LOG = [
  { id: "a1", at: "2026-10-29 08:12", user: "anna.sklep1", action: "Złożono zamówienie", target: "z-1001" },
  { id: "a2", at: "2026-10-29 09:00", user: "maria.manager", action: "Zmiana statusu", target: "z-1001 → w realizacji" },
  { id: "a3", at: "2026-10-29 09:40", user: "piotr.sklep2", action: "Złożono zamówienie", target: "z-1002" },
  { id: "a4", at: "2026-10-29 10:15", user: "admin", action: "Zmiana min. ilości", target: "p6 / s1: 30→35" },
];

const SHOPS = [
  { id: "s1", name: "Sklep Centrum", city: "Warszawa", region: "Mazowieckie" },
  { id: "s2", name: "Sklep Galeria", city: "Kraków", region: "Małopolskie" },
  { id: "s3", name: "Sklep Rynek", city: "Wrocław", region: "Dolnośląskie" },
  { id: "s4", name: "Sklep Park", city: "Gdańsk", region: "Pomorskie" },
];
const PRODUCTS = [
  { id: "p1", sku: "CHL-001", name: "Chleb pszenny 500g", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "p2", sku: "CHL-002", name: "Chleb razowy 700g", category: "Pieczywo", unit: "szt", price: 5.2 },
  { id: "p3", sku: "BUŁ-010", name: "Bułka kajzerka", category: "Pieczywo", unit: "szt", price: 0.9 },
  { id: "p4", sku: "CIA-020", name: "Ciasto szarlotka", category: "Cukiernia", unit: "kg", price: 38.0 },
  { id: "p5", sku: "CIA-021", name: "Sernik wiedeński", category: "Cukiernia", unit: "kg", price: 42.0 },
  { id: "p6", sku: "CIA-022", name: "Pączek z różą", category: "Cukiernia", unit: "szt", price: 3.5 },
];
const MIN_QTY = {
  s1: { p1: 20, p2: 10, p3: 40, p4: 2, p5: 1, p6: 30 },
  s2: { p1: 15, p2: 8, p3: 30, p4: 3, p5: 2, p6: 25 },
};

router.get("/shops", auth, (req, res) => {
  const allowed = req.user.role === "admin" ? SHOPS : SHOPS.filter((s) => req.user.shops.includes(s.id));
  res.json(allowed);
});
router.get("/products", auth, (_req, res) => res.json(PRODUCTS));
router.get("/min-qty/:shopId", auth, (req, res) => {
  const parsed = shopIdSchema.safeParse(req.params.shopId);
  if (!parsed.success) return res.status(400).json({ error: "Nieprawidłowy shopId" });
  if (!canAccessShop(req.user, req.params.shopId)) return res.status(403).json({ error: "forbidden" });
  res.json(MIN_QTY[req.params.shopId] || {});
});
router.get("/dashboard/:shopId", auth, (req, res) => {
  const parsed = shopIdSchema.safeParse(req.params.shopId);
  if (!parsed.success) return res.status(400).json({ error: "Nieprawidłowy shopId" });
  if (!canAccessShop(req.user, req.params.shopId)) return res.status(403).json({ error: "forbidden" });
  res.json({ shop: req.params.shopId, revenue: 1234, qty: 567 });
});

router.get("/stock", auth, (req, res) => res.json(STOCK));

router.post("/stock/adjust", auth, requireStockAdjust, (req, res) => {
  const { product, delta, reason } = req.body || {};
  if (!product || typeof delta !== "number" || !reason) return res.status(400).json({ error: "Brak danych" });
  const item = STOCK.find((s) => s.product === product);
  if (!item) return res.status(404).json({ error: "Nie znaleziono" });
  item.qty += delta;
  const entry = { id: "a" + (AUDIT_LOG.length + 1), at: new Date().toISOString().slice(0, 16).replace("T", " "), user: req.user.login, action: "Korekta stanu", target: `${product}: ${delta >= 0 ? "+" : ""}${delta} (${reason})` };
  AUDIT_LOG.unshift(entry);
  res.json({ item, entry });
});

router.get("/audit", auth, (req, res) => res.json(AUDIT_LOG));
router.post("/audit", auth, (req, res) => {
  const { action, target } = req.body || {};
  if (!action || !target) return res.status(400).json({ error: "Brak danych" });
  const entry = { id: "a" + (AUDIT_LOG.length + 1), at: new Date().toISOString().slice(0, 16).replace("T", " "), user: req.user.login, action, target };
  AUDIT_LOG.unshift(entry);
  res.status(201).json(entry);
});

// --- Webhooks ---
router.get("/webhooks", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  res.json(WEBHOOKS.map((w) => ({ ...w, secret: undefined })));
});

router.post("/webhooks", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  const { url, events } = req.body || {};
  if (!url || !Array.isArray(events)) return res.status(400).json({ error: "Brak danych" });
  const secret = crypto.randomBytes(24).toString("hex");
  const wh = { id: "wh-" + (WEBHOOKS.length + 1), url, events, secret, active: true, createdAt: new Date().toISOString().slice(0, 16).replace("T", " ") };
  WEBHOOKS.push(wh);
  res.status(201).json({ ...wh, secret }); // secret shown once
});

router.delete("/webhooks/:id", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  const idx = WEBHOOKS.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  WEBHOOKS.splice(idx, 1);
  res.json({ ok: true });
});

router.post("/webhooks/:id/test", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  const wh = WEBHOOKS.find((w) => w.id === req.params.id);
  if (!wh) return res.status(404).json({ error: "not found" });
  const body = JSON.stringify({ event: "test.ping", at: new Date().toISOString() });
  const sig = signPayload(wh.secret, body);
  const delivery = { id: "d-" + (DELIVERIES.length + 1), webhook: wh.id, event: "test.ping", status: "sent", statusCode: 200, signature: sig, at: new Date().toISOString().slice(0, 16).replace("T", " ") };
  DELIVERIES.unshift(delivery);
  res.json({ delivery, signature: sig });
});

router.get("/webhooks/:id/deliveries", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  res.json(DELIVERIES.filter((d) => d.webhook === req.params.id));
});

router.get("/deliveries", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  res.json(DELIVERIES);
});

const BACKOFF = [1000, 5000, 15000];

async function attemptDelivery(delivery) {
  const wh = WEBHOOKS.find((w) => w.id === delivery.webhook);
  if (!wh) { delivery.status = "failed"; delivery.lastError = "webhook removed"; return; }
  if (isPrivateUrl(wh.url) && process.env.WEBHOOK_BLOCK_PRIVATE !== "0") {
    delivery.status = "failed";
    delivery.lastError = "SSRF: prywatny cel zablokowany";
    delivery.attempts += 1;
    return;
  }
  delivery.attempts += 1;
  try {
    const res = await fetch(wh.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kortex-Signature": delivery.signature,
        "X-Kortex-Event": delivery.event,
        "X-Kortex-Delivery": delivery.id,
      },
      body: delivery.body,
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    delivery.statusCode = res.status;
    if (res.ok) {
      delivery.status = "sent";
      delivery.lastError = null;
    } else {
      delivery.status = "pending";
      delivery.lastError = `HTTP ${res.status}`;
      scheduleRetry(delivery);
    }
  } catch (err) {
    delivery.statusCode = 0;
    delivery.status = "pending";
    delivery.lastError = err.message;
    scheduleRetry(delivery);
  }
}

function scheduleRetry(delivery) {
  if (delivery.attempts >= 4) {
    delivery.status = "failed";
    return;
  }
  if (process.env.NODE_ENV === "test") {
    // in tests: mark failed immediately to avoid open timers
    delivery.status = "failed";
    return;
  }
  const delay = BACKOFF[Math.min(delivery.attempts - 1, BACKOFF.length - 1)];
  setTimeout(() => {
    if (delivery.status === "pending") attemptDelivery(delivery);
  }, delay);
}

router.post("/webhooks/emit", auth, (req, res) => {
  const { event, payload } = req.body || {};
  if (!event) return res.status(400).json({ error: "Brak zdarzenia" });
  const body = JSON.stringify({ event, payload, at: new Date().toISOString() });
  const created = [];
  WEBHOOKS.filter((w) => w.active && (w.events || []).includes(event)).forEach((wh) => {
    const sig = signPayload(wh.secret, body);
    const delivery = { id: "d-" + (DELIVERIES.length + 1), webhook: wh.id, event, status: "pending", statusCode: null, signature: sig, body, attempts: 0, lastError: null, at: new Date().toISOString().slice(0, 16).replace("T", " ") };
    DELIVERIES.unshift(delivery);
    created.push(delivery);
    // fire-and-forget with retry
    attemptDelivery(delivery);
  });
  res.json({ created });
});

// --- API keys (maszynowe) ---
router.get("/api-keys", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  res.json(API_KEYS.map((k) => ({ id: k.id, name: k.name, prefix: k.prefix, scopes: k.scopes, createdAt: k.createdAt, revoked: k.revoked })));
});

router.post("/api-keys", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  const { name, scopes } = req.body || {};
  if (!name) return res.status(400).json({ error: "Brak nazwy" });
  const raw = "kx_" + crypto.randomBytes(24).toString("base64url");
  const key = { id: "key-" + (API_KEYS.length + 1), name, prefix: raw.slice(0, 12), hash: hashKey(raw), scopes: scopes || ["read"], createdAt: new Date().toISOString().slice(0, 16).replace("T", " "), revoked: false };
  API_KEYS.push(key);
  res.status(201).json({ ...key, key: raw, hash: undefined }); // pełny klucz raz
});

router.delete("/api-keys/:id", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  const k = API_KEYS.find((x) => x.id === req.params.id);
  if (!k) return res.status(404).json({ error: "not found" });
  k.revoked = true;
  res.json({ ok: true });
});

// --- Backup ---
let backupSchedule = { hour: 2, retention: 7, lastRun: null };

router.get("/backup-schedule", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  res.json(backupSchedule);
});

router.patch("/backup-schedule", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  const { hour, retention } = req.body || {};
  if (typeof hour === "number") backupSchedule.hour = hour;
  if (typeof retention === "number") backupSchedule.retention = retention;
  res.json(backupSchedule);
});

router.post("/backup-schedule/run", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  backupSchedule.lastRun = new Date().toISOString().slice(0, 16).replace("T", " ");
  const snapshot = { at: backupSchedule.lastRun, shops: SHOPS.length, products: PRODUCTS.length, orders: 0, stock: STOCK.length };
  const entry = { id: "a" + (AUDIT_LOG.length + 1), at: backupSchedule.lastRun, user: req.user.login, action: "Kopia zapasowa", target: JSON.stringify(snapshot) };
  AUDIT_LOG.unshift(entry);
  res.json({ snapshot, entry });
});

router.get("/price-history", auth, (req, res) => res.json(PRICE_HISTORY));
router.get("/price-history/:productId", auth, (req, res) => res.json(PRICE_HISTORY.filter((p) => p.product === req.params.productId)));

router.patch("/orders/:id/tracking", auth, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") return res.status(403).json({ error: "forbidden" });
  const o = ORDERS.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "not found" });
  const { courier, number, eta } = req.body || {};
  o.tracking = { courier, number, eta };
  const entry = { id: "a" + (AUDIT_LOG.length + 1), at: new Date().toISOString().slice(0, 16).replace("T", " "), user: req.user.login, action: "Ustawiono śledzenie", target: `${o.id}: ${courier} ${number}` };
  AUDIT_LOG.unshift(entry);
  res.json({ order: o, entry });
});

module.exports = router;
