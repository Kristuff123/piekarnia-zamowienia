const request = require("supertest");
const app = require("../server");

describe("health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("auth", () => {
  it("rejects invalid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ login: "nope", password: "x" });
    expect(res.status).toBe(401);
  });
  it("logs in admin", async () => {
    const res = await request(app).post("/api/auth/login").send({ login: "admin", password: "demo" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("admin");
  });
  it("validates login body", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
  it("requires auth for /me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("data", () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({ login: "admin", password: "demo" });
    token = res.body.token;
  });
  it("lists shops", async () => {
    const res = await request(app).get("/api/shops").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it("lists products", async () => {
    const res = await request(app).get("/api/products").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
  it("rejects bad shopId", async () => {
    const res = await request(app).get("/api/min-qty/bad").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
  it("requires auth for data", async () => {
    const res = await request(app).get("/api/shops");
    expect(res.status).toBe(401);
  });
});
