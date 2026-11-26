const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const Order = require("../models/Order");
const Stock = require("../models/Stock");
const StockTransaction = require("../models/StockTransaction");
const SupplyRequest = require("../models/SupplyRequest");
const { authenticate, authorize } = require("../middleware/auth");
const { success } = require("../utils/response");

const router = express.Router();
router.use(authenticate, authorize("admin", "manager"));

router.get("/dashboard", async (_req, res, next) => {
  try {
    const [users, products, warehouses, orders, supplyRequests, stock, transactions] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Warehouse.countDocuments({ isActive: true }),
      Order.countDocuments(),
      SupplyRequest.countDocuments({ status: "pending" }),
      Stock.aggregate([{ $group: { _id: null, quantity: { $sum: "$quantity" } } }]),
      StockTransaction.countDocuments(),
    ]);
    return success(res, 200, "Dashboard statistics", {
      users,
      products,
      warehouses,
      orders,
      pendingSupplyRequests: supplyRequests,
      totalStockQuantity: stock[0]?.quantity || 0,
      stockTransactions: transactions,
    });
  } catch (err) { next(err); }
});

router.get("/transactions", async (_req, res, next) => {
  try {
    const transactions = await StockTransaction.find().populate("product", "name sku").populate("warehouse", "name code").populate("performedBy", "name email").sort({ createdAt: -1 }).limit(500);
    return success(res, 200, "Transactions retrieved", transactions);
  } catch (err) { next(err); }
});

router.get("/low-stock", async (_req, res, next) => {
  try {
    const stock = await Stock.find().populate("product").populate("warehouse");
    const low = stock.filter((entry) => entry.product && entry.quantity <= (entry.product.lowStockThreshold ?? 10));
    return success(res, 200, "Low stock retrieved", low);
  } catch (err) { next(err); }
});

module.exports = router;