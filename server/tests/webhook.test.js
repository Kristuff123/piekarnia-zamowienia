const request = require("supertest");
const app = require("../server");

describe("webhooks", () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({ login: "admin", password: "demo" });
    token = res.body.token;
  });

  it("creates a webhook and hides secret in list", async () => {
    const res = await request(app).post("/api/webhooks").set("Authorization", `Bearer ${token}`).send({ url: "https://example.com/hook", events: ["document.indexed"] });
    expect(res.status).toBe(201);
    expect(res.body.secret).toBeDefined();
    const list = await request(app).get("/api/webhooks").set("Authorization", `Bearer ${token}`);
    expect(list.body[0].secret).toBeUndefined();
  });

  it("delivers successfully when fetch ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const res = await request(app).post("/api/webhooks/emit").set("Authorization", `Bearer ${token}`).send({ event: "document.indexed", payload: { x: 1 } });
    expect(res.status).toBe(200);
    expect(res.body.created.length).toBeGreaterThan(0);
    // wait a tick for async attempt
    await new Promise((r) => setTimeout(r, 50));
    const dels = await request(app).get("/api/deliveries").set("Authorization", `Bearer ${token}`);
    const d = dels.body.find((x) => x.event === "document.indexed");
    expect(d).toBeDefined();
    expect(d.status).toBe("sent");
    expect(d.attempts).toBe(1);
  });

  it("records failure when fetch throws", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down"));
    await request(app).post("/api/webhooks/emit").set("Authorization", `Bearer ${token}`).send({ event: "document.indexed", payload: { x: 2 } });
    await new Promise((r) => setTimeout(r, 50));
    const dels = await request(app).get("/api/deliveries").set("Authorization", `Bearer ${token}`);
    const d = dels.body.find((x) => x.lastError === "network down");
    expect(d).toBeDefined();
    expect(d.status).not.toBe("sent");
    expect(d.lastError).toBe("network down");
  });
});
