const express = require("express");
const { auth } = require("../middleware/auth");
const router = express.Router();

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
router.get("/min-qty/:shopId", auth, (req, res) => res.json(MIN_QTY[req.params.shopId] || {}));
router.get("/dashboard/:shopId", auth, (req, res) => {
  res.json({ shop: req.params.shopId, revenue: 1234, qty: 567 });
});

module.exports = router;
