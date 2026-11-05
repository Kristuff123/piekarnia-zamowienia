const express = require("express");
const { USERS, sign, auth } = require("../middleware/auth");
const router = express.Router();

router.post("/login", (req, res) => {
  const { login, password } = req.body || {};
  const u = USERS.find((x) => x.login === login && x.password === password);
  if (!u) return res.status(401).json({ error: "invalid credentials" });
  const { password: _p, ...safe } = u;
  res.json({ token: sign(safe), user: safe });
});

router.get("/me", auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
