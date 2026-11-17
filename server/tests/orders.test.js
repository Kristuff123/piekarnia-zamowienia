const request = require("supertest");
const app = require("../server");

const ANNA = { login: "anna.sklep1", password: "demo" };
const JAN = { login: "jan.sklep1", password: "demo" };
const MARIA = { login: "maria.manager", password: "demo" };
const ADMIN = { login: "admin", password: "demo" };

async function tokenFor(credentials) {
  const res = await request(app).post("/api/auth/login").send(credentials);
  expect(res.status).toBe(200);
  return res.body.token;
}

function authReq(req, token) {
  return token ? req.set("Authorization", `Bearer ${token}`) : req;
}

const validOrder = {
  shop: "s1",
  lines: [{ kind: "product", ref: "p1", label: "Chleb pszenny 500g", qty: 2, unitPrice: 4.5 }],
  note: "test",
};

describe("zamówienia: tworzenie", () => {
  let anna, jan;
  beforeAll(async () => {
    [anna, jan] = await Promise.all([tokenFor(ANNA), tokenFor(JAN)]);
  });

  it("wymaga tokenu", async () => {
    const res = await request(app).post("/api/orders").send(validOrder);
    expect(res.status).toBe(401);
  });

  it("odrzuca użytkownika bez uprawnienia order", async () => {
    const res = await authReq(request(app).post("/api/orders").send(validOrder), jan);
    expect(res.status).toBe(403);
  });

  it("odrzuca nieprawidłowe dane", async () => {
    const res = await authReq(request(app).post("/api/orders").send({ shop: "s1", lines: [] }), anna);
    expect(res.status).toBe(400);
  });

  it("odrzuca sklep poza zakresem", async () => {
    const res = await authReq(request(app).post("/api/orders").send({ ...validOrder, shop: "s2" }), anna);
    expect(res.status).toBe(403);
  });

  it("tworzy zamówienie dla uprawnionego użytkownika", async () => {
    const res = await authReq(request(app).post("/api/orders").send(validOrder), anna);
    expect(res.status).toBe(201);
    expect(res.body.order).toMatchObject({ shop: "s1", status: "wysłane" });
    expect(res.body.order.id).toMatch(/^z-/);
    expect(res.body.order.history).toHaveLength(1);
  });
});

describe("zamówienia: listowanie i zakres", () => {
  let anna, maria, admin;
  beforeAll(async () => {
    [anna, maria, admin] = await Promise.all([tokenFor(ANNA), tokenFor(MARIA), tokenFor(ADMIN)]);
  });

  it("użytkownik widzi tylko swoje sklepy", async () => {
    const res = await authReq(request(app).get("/api/orders"), anna);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((o) => expect(["s1"]).toContain(o.shop));
  });

  it("manager widzi przydzielone sklepy", async () => {
    const res = await authReq(request(app).get("/api/orders"), maria);
    expect(res.status).toBe(200);
    res.body.forEach((o) => expect(["s1", "s2", "s3"]).toContain(o.shop));
  });

  it("admin widzi wszystkie", async () => {
    const res = await authReq(request(app).get("/api/orders"), admin);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("pojedyncze zamówienie respektuje zakres", async () => {
    const list = await authReq(request(app).get("/api/orders"), admin);
    const first = list.body[0];
    const res = await authReq(request(app).get(`/api/orders/${first.id}`), anna);
    // anna może zobaczyć tylko jeśli sklep s1
    if (first.shop === "s1") expect(res.status).toBe(200);
    else expect(res.status).toBe(403);
  });
});

describe("zamówienia: status i anulowanie", () => {
  let anna, maria, admin;
  let orderId;
  beforeAll(async () => {
    [anna, maria, admin] = await Promise.all([tokenFor(ANNA), tokenFor(MARIA), tokenFor(ADMIN)]);
    const res = await authReq(request(app).post("/api/orders").send(validOrder), anna);
    orderId = res.body.order.id;
  });

  it("użytkownik może anulować własne wysłane zamówienie", async () => {
    const res = await authReq(request(app).patch(`/api/orders/${orderId}/status`).send({ status: "anulowane" }), anna);
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("anulowane");
  });

  it("użytkownik nie może zmienić statusu na inny", async () => {
    // nowe zamówienie
    const created = await authReq(request(app).post("/api/orders").send(validOrder), anna);
    const id = created.body.order.id;
    const res = await authReq(request(app).patch(`/api/orders/${id}/status`).send({ status: "w realizacji" }), anna);
    expect(res.status).toBe(403);
  });

  it("manager/admin może zmienić status", async () => {
    const created = await authReq(request(app).post("/api/orders").send({ ...validOrder, shop: "s1" }), anna);
    const id = created.body.order.id;
    const res = await authReq(request(app).patch(`/api/orders/${id}/status`).send({ status: "w realizacji" }), maria);
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("w realizacji");
  });

  it("odrzuca nieprawidłowy status", async () => {
    const created = await authReq(request(app).post("/api/orders").send(validOrder), anna);
    const id = created.body.order.id;
    const res = await authReq(request(app).patch(`/api/orders/${id}/status`).send({ status: "foo" }), admin);
    expect(res.status).toBe(400);
  });
});
