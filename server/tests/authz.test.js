const request = require("supertest");
const app = require("../server");

const ANNA = { login: "anna.sklep1", password: "demo" }; // user, shops: [s1]
const JAN = { login: "jan.sklep1", password: "demo" }; // user, shops: [s1], tylko "view"
const MARIA = { login: "maria.manager", password: "demo" }; // manager, shops: [s1,s2,s3]
const ADMIN = { login: "admin", password: "demo" }; // admin, wszystkie sklepy

async function tokenFor(credentials) {
  const res = await request(app).post("/api/auth/login").send(credentials);
  expect(res.status).toBe(200);
  return res.body.token;
}

function get(path, token) {
  const req = request(app).get(path);
  return token ? req.set("Authorization", `Bearer ${token}`) : req;
}

function adjust(token, product = "p4", delta = 1) {
  const req = request(app)
    .post("/api/stock/adjust")
    .send({ product, delta, reason: "inwentaryzacja" });
  return token ? req.set("Authorization", `Bearer ${token}`) : req;
}

describe("zakres sklepów: /api/min-qty/:shopId", () => {
  let anna, maria, admin;

  beforeAll(async () => {
    [anna, maria, admin] = await Promise.all([tokenFor(ANNA), tokenFor(MARIA), tokenFor(ADMIN)]);
  });

  it("pozwala na własny sklep", async () => {
    const res = await get("/api/min-qty/s1", anna);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ p1: expect.any(Number) });
  });

  it("blokuje cudzy sklep", async () => {
    const res = await get("/api/min-qty/s2", anna);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ error: "forbidden" });
  });

  it("manager widzi przydzielone sklepy, ale nie pozostałe", async () => {
    expect((await get("/api/min-qty/s3", maria)).status).toBe(200);
    expect((await get("/api/min-qty/s4", maria)).status).toBe(403);
  });

  it("admin widzi każdy sklep", async () => {
    expect((await get("/api/min-qty/s2", admin)).status).toBe(200);
    expect((await get("/api/min-qty/s4", admin)).status).toBe(200);
  });

  it("nadal odrzuca nieprawidłowy shopId", async () => {
    expect((await get("/api/min-qty/bad", admin)).status).toBe(400);
  });

  it("nadal wymaga tokenu", async () => {
    expect((await get("/api/min-qty/s1")).status).toBe(401);
  });
});

describe("zakres sklepów: /api/dashboard/:shopId", () => {
  let anna, maria, admin;

  beforeAll(async () => {
    [anna, maria, admin] = await Promise.all([tokenFor(ANNA), tokenFor(MARIA), tokenFor(ADMIN)]);
  });

  it("pozwala na własny sklep", async () => {
    const res = await get("/api/dashboard/s1", anna);
    expect(res.status).toBe(200);
    expect(res.body.shop).toBe("s1");
  });

  it("blokuje cudzy sklep", async () => {
    expect((await get("/api/dashboard/s2", anna)).status).toBe(403);
    expect((await get("/api/dashboard/s4", maria)).status).toBe(403);
  });

  it("pozwala managerowi i adminowi w ich zakresie", async () => {
    expect((await get("/api/dashboard/s3", maria)).status).toBe(200);
    expect((await get("/api/dashboard/s4", admin)).status).toBe(200);
  });

  it("nadal wymaga tokenu", async () => {
    expect((await get("/api/dashboard/s1")).status).toBe(401);
  });
});

describe("korekta stanu: /api/stock/adjust tylko dla admina", () => {
  let anna, jan, maria, admin;

  beforeAll(async () => {
    [anna, jan, maria, admin] = await Promise.all([
      tokenFor(ANNA),
      tokenFor(JAN),
      tokenFor(MARIA),
      tokenFor(ADMIN),
    ]);
  });

  it("odrzuca konto z samym uprawnieniem view", async () => {
    const before = await get("/api/stock", jan);
    const res = await adjust(jan);
    expect(res.status).toBe(403);
    // stan magazynu nie może się zmienić po odrzuconym żądaniu
    const after = await get("/api/stock", jan);
    expect(after.body).toEqual(before.body);
  });

  it("odrzuca użytkownika sklepu i managera", async () => {
    expect((await adjust(anna)).status).toBe(403);
    expect((await adjust(maria)).status).toBe(403);
  });

  it("nadal wymaga tokenu", async () => {
    expect((await adjust(null)).status).toBe(401);
  });

  it("pozwala adminowi i zapisuje wpis w audycie", async () => {
    const before = await get("/api/stock", admin);
    const beforeQty = before.body.find((s) => s.product === "p4").qty;
    const res = await adjust(admin, "p4", 2);
    expect(res.status).toBe(200);
    expect(res.body.item).toMatchObject({ product: "p4", qty: beforeQty + 2 });
    expect(res.body.entry).toMatchObject({ user: "admin", action: "Korekta stanu" });
  });
});
