const express = require("express");
const Stock = require("../models/Stock");
const StockTransaction = require("../models/StockTransaction");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const { authenticate, authorize } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();
router.use(authenticate);
router.use(authorize("admin", "manager"));

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.product) filter.product = req.query.product;
    const stock = await Stock.find(filter).populate("product").populate("warehouse").sort({ updatedAt: -1 });
    return success(res, 200, "Stock retrieved", stock);
  } catch (err) { next(err); }
});

router.get("/low", async (_req, res, next) => {
  try {
    const stock = await Stock.find().populate("product").populate("warehouse");
    const low = stock.filter((entry) => entry.product && entry.quantity <= (entry.product.lowStockThreshold ?? 10));
    return success(res, 200, "Low stock retrieved", low);
  } catch (err) { next(err); }
});

router.get("/history", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.product) filter.product = req.query.product;
    const transactions = await StockTransaction.find(filter).populate("product", "name sku").populate("warehouse", "name code").populate("performedBy", "name email").sort({ createdAt: -1 }).limit(500);
    return success(res, 200, "Stock history retrieved", transactions);
  } catch (err) { next(err); }
});

router.post("/add", async (req, res, next) => {
  try {
    const { product, warehouse, quantity, reason } = req.body;
    if (!product || !warehouse || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) throw error(400, "product, warehouse and a positive integer quantity are required", "VALIDATION_ERROR");
    if (!await Product.findById(product)) throw error(404, "Product not found", "NOT_FOUND");
    if (!await Warehouse.findById(warehouse)) throw error(404, "Warehouse not found", "NOT_FOUND");
    const stock = await Stock.findOneAndUpdate(
      { product, warehouse },
      { $inc: { quantity: Number(quantity) } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
    await StockTransaction.create({ product, warehouse, type: "IN", quantity: Number(quantity), reason, performedBy: req.user._id });
    return success(res, 200, "Stock added", stock);
  } catch (err) { next(err); }
});

router.post("/remove", async (req, res, next) => {
  try {
    const { product, warehouse, quantity, reason } = req.body;
    if (!product || !warehouse || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) throw error(400, "product, warehouse and a positive integer quantity are required", "VALIDATION_ERROR");
    const stock = await Stock.findOne({ product, warehouse });
    if (!stock) throw error(404, "Stock record not found", "NOT_FOUND");
    if (stock.quantity < Number(quantity)) throw error(409, "Insufficient stock", "INSUFFICIENT_STOCK", { available: stock.quantity, requested: Number(quantity) });
    stock.quantity -= Number(quantity);
    await stock.save();
    await StockTransaction.create({ product, warehouse, type: "OUT", quantity: Number(quantity), reason, performedBy: req.user._id });
    return success(res, 200, "Stock removed", stock);
  } catch (err) { next(err); }
});

module.exports = router;