const jwt = require("jsonwebtoken");

const USERS = [
  { id: "u1", login: "anna.sklep1", password: "demo", name: "Anna Nowak", role: "user", shops: ["s1"], permissions: ["view", "order"], twoFactor: false },
  { id: "u2", login: "piotr.sklep2", password: "demo", name: "Piotr Kowalski", role: "user", shops: ["s2"], permissions: ["view", "order"], twoFactor: false },
  { id: "u3", login: "maria.manager", password: "demo", name: "Maria Wiśniewska", role: "manager", shops: ["s1", "s2", "s3"], permissions: ["view", "order", "approve"], twoFactor: true },
  { id: "u4", login: "admin", password: "demo", name: "Administrator", role: "admin", shops: ["s1", "s2", "s3", "s4"], permissions: ["view", "order", "approve", "admin"], twoFactor: true },
  { id: "u5", login: "jan.sklep1", password: "demo", name: "Jan Kowalczyk", role: "user", shops: ["s1"], permissions: ["view"], twoFactor: false },
];

function sign(user) {
  return jwt.sign({ id: user.id, login: user.login, role: user.role, shops: user.shops, permissions: user.permissions }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "8h" });
}

function auth(req, res, next) {
  const bearer = (req.headers.authorization || "").replace("Bearer ", "");
  const cookieToken = req.cookies?.kortex_session;
  const t = bearer || cookieToken;
  if (!t) return res.status(401).json({ error: "no token" });
  try { req.user = jwt.verify(t, process.env.JWT_SECRET || "dev-secret"); next(); }
  catch { res.status(401).json({ error: "Token is not valid" }); }
}

module.exports = { USERS, sign, auth };
