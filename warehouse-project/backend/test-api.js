require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const app = require("./app");
const User = require("./models/User");
const Warehouse = require("./models/Warehouse");
const Product = require("./models/Product");
const Stock = require("./models/Stock");

const base = "http://127.0.0.1";
const port = 5055;
let passed = 0;
let failed = 0;
const results = [];

async function request(method, path, options = {}) {
  const response = await fetch(`${base}:${port}${path}`, {
    method,
    headers: options.headers || {},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: response.status, headers: response.headers, body: json };
}

function auth(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function check(name, fn) {
  try {
    await fn();
    passed++;
    results.push(`PASS ${name}`);
  } catch (error) {
    failed++;
    results.push(`FAIL ${name}: ${error.message}`);
  }
}

function expectStatus(res, status) {
  if (res.status !== status) throw new Error(`expected ${status}, got ${res.status}: ${JSON.stringify(res.body)}`);
}

async function main() {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = "api-test-secret";
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.create([
    { name: "Admin", email: "admin@test.local", password: "Admin123!", role: "admin" },
    { name: "Manager", email: "manager@test.local", password: "Manager123!", role: "manager" },
    { name: "Sales", email: "sales@test.local", password: "Sales123!", role: "sales" },
    { name: "Supplier", email: "supplier@test.local", password: "Supplier123!", role: "supplier" },
  ]);
  const warehouse = await Warehouse.create({ name: "Test Warehouse", code: "TEST", manager: users[1]._id });
  const product = await Product.create({ name: "Test Product", sku: "TEST-001", category: "Test", price: 25, cost: 10, supplier: users[3]._id, warehouse: warehouse._id, lowStockThreshold: 5 });
  await Stock.create({ product: product._id, warehouse: warehouse._id, quantity: 20 });

  const login = async (email, password) => {
    const res = await request("POST", "/api/auth/login", { headers: { "Content-Type": "application/json" }, body: { email, password } });
    expectStatus(res, 200);
    return res.body.data.token;
  };
  const server = app.listen(port);
  await new Promise((resolve) => server.once("listening", resolve));

  const admin = await login("admin@test.local", "Admin123!");
  const manager = await login("manager@test.local", "Manager123!");
  const sales = await login("sales@test.local", "Sales123!");
  const supplier = await login("supplier@test.local", "Supplier123!");

  await check("Health endpoint", async () => {
    const res = await request("GET", "/api/health");
    expectStatus(res, 200);
    if (res.body.ok !== true) throw new Error("ok is not true");
  });
  await check("Public product catalog", async () => {
    const res = await request("GET", "/api/products");
    expectStatus(res, 200);
    if (!Array.isArray(res.body.data)) throw new Error("product data is not an array");
  });
  await check("CORS allows localhost:5173", async () => {
    const res = await request("OPTIONS", "/api/health", { headers: { Origin: "http://localhost:5173", "Access-Control-Request-Method": "GET" } });
    if (res.headers.get("access-control-allow-origin") !== "http://localhost:5173") throw new Error("CORS origin header missing");
  });
  await check("Authentication required", async () => {
    const res = await request("GET", "/api/users");
    expectStatus(res, 401);
  });
  await check("Invalid login credentials", async () => {
    const res = await request("POST", "/api/auth/login", { headers: { "Content-Type": "application/json" }, body: { email: "none@test.local", password: "badpassword" } });
    expectStatus(res, 401);
  });
  await check("Role-based access denied", async () => {
    const res = await request("GET", "/api/users", { headers: auth(sales) });
    expectStatus(res, 403);
  });
  await check("Public registration validation", async () => {
    const res = await request("POST", "/api/auth/register", { headers: { "Content-Type": "application/json" }, body: { name: "Bad", email: "bad@test.local", password: "short", role: "admin" } });
    expectStatus(res, 400);
  });
  await check("Public registration", async () => {
    const res = await request("POST", "/api/auth/register", { headers: { "Content-Type": "application/json" }, body: { name: "New Sales", email: "new-sales@test.local", password: "NewSales123!", role: "sales" } });
    expectStatus(res, 201);
  });
  await check("Current user", async () => {
    const res = await request("GET", "/api/auth/me", { headers: auth(manager) });
    expectStatus(res, 200);
  });
  await check("Admin user list", async () => {
    const res = await request("GET", "/api/users", { headers: auth(admin) });
    expectStatus(res, 200);
  });
  await check("Manager stock history", async () => {
    const res = await request("GET", "/api/stock/history", { headers: auth(manager) });
    expectStatus(res, 200);
  });
  await check("Stock add validation", async () => {
    const res = await request("POST", "/api/stock/add", { headers: auth(manager), body: { product: product._id, warehouse: warehouse._id, quantity: 0 } });
    expectStatus(res, 400);
  });
  await check("Stock add", async () => {
    const res = await request("POST", "/api/stock/add", { headers: auth(manager), body: { product: product._id, warehouse: warehouse._id, quantity: 5, reason: "Test" } });
    expectStatus(res, 200);
  });
  await check("Stock remove insufficient quantity", async () => {
    const res = await request("POST", "/api/stock/remove", { headers: auth(manager), body: { product: product._id, warehouse: warehouse._id, quantity: 999 } });
    expectStatus(res, 409);
  });
  await check("Low stock endpoint", async () => {
    const res = await request("GET", "/api/stock/low", { headers: auth(manager) });
    expectStatus(res, 200);
  });
  await check("Sales creates order", async () => {
    const res = await request("POST", "/api/orders", { headers: auth(sales), body: { warehouse: warehouse._id, items: [{ product: product._id, quantity: 2 }], shippingAddress: "Test address" } });
    expectStatus(res, 201);
  });
  await check("Sales insufficient stock order", async () => {
    const res = await request("POST", "/api/orders", { headers: auth(sales), body: { warehouse: warehouse._id, items: [{ product: product._id, quantity: 999 }], shippingAddress: "Test address" } });
    expectStatus(res, 409);
  });
  await check("Sales own orders", async () => {
    const res = await request("GET", "/api/orders/my", { headers: auth(sales) });
    expectStatus(res, 200);
  });
  await check("Manager dashboard", async () => {
    const res = await request("GET", "/api/admin/dashboard", { headers: auth(manager) });
    expectStatus(res, 200);
  });
  await check("Supplier creates supply request", async () => {
    const res = await request("POST", "/api/supply", { headers: auth(supplier), body: { product: product._id, warehouse: warehouse._id, quantity: 3, note: "Test supply" } });
    expectStatus(res, 201);
  });
  await check("Supplier request history", async () => {
    const res = await request("GET", "/api/supply/my", { headers: auth(supplier) });
    expectStatus(res, 200);
  });
  await check("Upload validation", async () => {
    const res = await request("POST", "/api/upload", { headers: auth(admin) });
    expectStatus(res, 400);
  });
  await check("Unknown route handling", async () => {
    const res = await request("GET", "/api/does-not-exist");
    expectStatus(res, 404);
  });

  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();

  console.log(results.join("\n"));
  console.log(`\nAPI test summary: ${passed} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
