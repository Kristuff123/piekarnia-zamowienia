const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server");

const ADMIN = { login: "admin", password: "demo" };

function sessionCookie(res) {
  const raw = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.find((c) => c.startsWith("kortex_session=")) || null;
}

function cookiePair(cookie) {
  return cookie.split(";")[0];
}

describe("login end-to-end", () => {
  const initialMode = process.env.AUTH_COOKIE_MODE;

  afterEach(() => {
    if (initialMode === undefined) delete process.env.AUTH_COOKIE_MODE;
    else process.env.AUTH_COOKIE_MODE = initialMode;
  });

  it("returns a verifiable token and no cookie in the default (off) mode", async () => {
    delete process.env.AUTH_COOKIE_MODE;
    const res = await request(app).post("/api/auth/login").send(ADMIN);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.split(".")).toHaveLength(3);
    expect(res.body.user).toMatchObject({ login: "admin", role: "admin" });
    expect(res.body.user.password).toBeUndefined();
    expect(sessionCookie(res)).toBeNull();

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || "dev-secret");
    expect(decoded).toMatchObject({
      login: "admin",
      role: "admin",
      shops: ["s1", "s2", "s3", "s4"],
    });
    expect(decoded).toHaveProperty("exp");
  });

  it("accepts the issued token on /api/auth/me", async () => {
    const login = await request(app).post("/api/auth/login").send(ADMIN);
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({ login: "admin", role: "admin" });
    expect(me.body.user.password).toBeUndefined();
  });

  it("rejects a tampered token", async () => {
    const login = await request(app).post("/api/auth/login").send(ADMIN);
    const tampered = `${login.body.token.slice(0, -3)}abc`;
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tampered}`);

    expect(me.status).toBe(401);
  });

  it("rejects wrong credentials without issuing a session cookie", async () => {
    process.env.AUTH_COOKIE_MODE = "dual";
    const res = await request(app)
      .post("/api/auth/login")
      .send({ login: "admin", password: "nieprawidlowe" });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
    expect(sessionCookie(res)).toBeNull();
  });

  it("dual mode: sets an httpOnly session cookie that authenticates on its own", async () => {
    process.env.AUTH_COOKIE_MODE = "dual";
    const res = await request(app).post("/api/auth/login").send(ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const cookie = sessionCookie(res);
    expect(cookie).not.toBeNull();
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");

    const me = await request(app).get("/api/auth/me").set("Cookie", cookiePair(cookie));
    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({ login: "admin", role: "admin" });
  });

  it("only mode: returns no token in the body but still authorises via cookie", async () => {
    process.env.AUTH_COOKIE_MODE = "only";
    const res = await request(app).post("/api/auth/login").send(ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user).toMatchObject({ login: "admin", role: "admin" });

    const cookie = sessionCookie(res);
    expect(cookie).not.toBeNull();

    const anonymous = await request(app).get("/api/auth/me");
    expect(anonymous.status).toBe(401);

    const me = await request(app).get("/api/auth/me").set("Cookie", cookiePair(cookie));
    expect(me.status).toBe(200);
    expect(me.body.user.login).toBe("admin");
  });

  it("clears the session cookie on logout", async () => {
    process.env.AUTH_COOKIE_MODE = "dual";
    const login = await request(app).post("/api/auth/login").send(ADMIN);
    const cookie = sessionCookie(login);

    const res = await request(app).post("/api/auth/logout").set("Cookie", cookiePair(cookie));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const cleared = sessionCookie(res);
    expect(cleared).not.toBeNull();
    expect(cleared).toMatch(/^kortex_session=;/);
    expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970/);
  });

  it("gives a logged-in shop user only their own shops", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ login: "anna.sklep1", password: "demo" });

    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe("user");

    const shops = await request(app)
      .get("/api/shops")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(shops.status).toBe(200);
    expect(shops.body.map((s) => s.id)).toEqual(["s1"]);
  });
});
