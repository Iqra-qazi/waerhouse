require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Warehouse = require("./models/Warehouse");
const Product = require("./models/Product");
const Stock = require("./models/Stock");

async function seed() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Warehouse.deleteMany({}),
    Product.deleteMany({}),
    Stock.deleteMany({}),
  ]);

  const users = await User.create([
    { name: "System Admin", email: "admin@warehouse.local", password: "Admin123!", role: "admin" },
    { name: "Warehouse Manager", email: "manager@warehouse.local", password: "Manager123!", role: "manager" },
    { name: "Sales Staff", email: "sales@warehouse.local", password: "Sales123!", role: "sales" },
    { name: "Demo Supplier", email: "supplier@warehouse.local", password: "Supplier123!", role: "supplier" },
  ]);
  const warehouse = await Warehouse.create({ name: "Main Warehouse", code: "MAIN", address: "Main storage facility", manager: users[1]._id });

  const products = await Product.create([
    { name: "Laptop", sku: "LAPTOP-001", category: "Electronics", price: 800, cost: 650, supplier: users[3]._id, warehouse: warehouse._id, lowStockThreshold: 5 },
    { name: "USB Cable", sku: "CABLE-001", category: "Accessories", price: 15, cost: 8, supplier: users[3]._id, warehouse: warehouse._id, lowStockThreshold: 10 },
  ]);
  await Stock.create([
    { product: products[0]._id, warehouse: warehouse._id, quantity: 25 },
    { product: products[1]._id, warehouse: warehouse._id, quantity: 4 },
  ]);

  console.log("Seed complete");
  console.log("admin@warehouse.local / Admin123!");
  console.log("manager@warehouse.local / Manager123!");
  console.log("sales@warehouse.local / Sales123!");
  console.log("supplier@warehouse.local / Supplier123!");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});