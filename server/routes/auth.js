const express = require("express");
const { z } = require("zod");
const { USERS, sign, auth } = require("../middleware/auth");
const router = express.Router();

const loginSchema = z.object({
  login: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Nieprawidłowe dane" });
  const { login, password } = parsed.data;
  const u = USERS.find((x) => x.login === login && x.password === password);
  if (!u) return res.status(401).json({ error: "invalid credentials" });
  const { password: _p, ...safe } = u;
  res.json({ token: sign(safe), user: safe });
});

router.get("/me", auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
