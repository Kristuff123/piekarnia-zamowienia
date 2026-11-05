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
  const token = sign(safe);
  const cookieMode = process.env.AUTH_COOKIE_MODE || "off";
  if (cookieMode === "dual" || cookieMode === "only") {
    res.cookie("kortex_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
    });
  }
  if (cookieMode === "only") {
    res.json({ user: safe });
  } else {
    res.json({ token, user: safe });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("kortex_session");
  res.json({ ok: true });
});

const { OTPAuth } = require("otpauth");

router.post("/2fa/setup", auth, (req, res) => {
  const u = USERS.find((x) => x.id === req.user.id);
  if (!u) return res.status(404).json({ error: "not found" });
  const totp = new OTPAuth.TOTP({ issuer: "Piekarnia", label: u.login, algorithm: "SHA1", digits: 6, period: 30 });
  u.otpSecret = totp.secret.base32;
  res.json({ secret: u.otpSecret, uri: totp.toString() });
});

router.post("/2fa/verify", auth, (req, res) => {
  const { code } = req.body || {};
  const u = USERS.find((x) => x.id === req.user.id);
  if (!u || !u.otpSecret) return res.status(400).json({ error: "2FA not set up" });
  const totp = new OTPAuth.TOTP({ issuer: "Piekarnia", label: u.login, algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(u.otpSecret) });
  const ok = totp.validate({ token: code, window: 1 }) !== null;
  if (ok) u.twoFactor = true;
  res.json({ ok });
});

router.get("/me", auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
