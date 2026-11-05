const jwt = require("jsonwebtoken");
const USERS = [
  { id: "u1", login: "anna.sklep1", password: "demo", name: "Anna Nowak", role: "user", shops: ["s1"] },
  { id: "u2", login: "piotr.sklep2", password: "demo", name: "Piotr Kowalski", role: "user", shops: ["s2"] },
  { id: "u3", login: "maria.manager", password: "demo", name: "Maria Wiśniewska", role: "manager", shops: ["s1","s2","s3"] },
  { id: "u4", login: "admin", password: "demo", name: "Administrator", role: "admin", shops: ["s1","s2","s3","s4"] },
];

function sign(user) {
  return jwt.sign({ id: user.id, login: user.login, role: user.role, shops: user.shops }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "8h" });
}

function auth(req, res, next) {
  const t = (req.headers.authorization || "").replace("Bearer ", "");
  if (!t) return res.status(401).json({ error: "no token" });
  try { req.user = jwt.verify(t, process.env.JWT_SECRET || "dev-secret"); next(); }
  catch { res.status(401).json({ error: "invalid token" }); }
}

module.exports = { USERS, sign, auth };
