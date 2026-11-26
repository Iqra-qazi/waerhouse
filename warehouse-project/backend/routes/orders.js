const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const StockTransaction = require("../models/StockTransaction");
const Warehouse = require("../models/Warehouse");
const generateOrderNumber = require("../utils/orderNumber");
const { authenticate, authorize } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("sales"), async (req, res, next) => {
  try {
    const { warehouse, items, shippingAddress, note } = req.body;
    if (!warehouse || !shippingAddress) throw error(400, "warehouse and shippingAddress are required", "VALIDATION_ERROR");
    if (!Array.isArray(items) || items.length === 0) throw error(400, "items must contain at least one product", "VALIDATION_ERROR");
    if (!await Warehouse.findById(warehouse)) throw error(404, "Warehouse not found", "NOT_FOUND");

    const normalizedByProduct = new Map();
    let totalAmount = 0;
    for (const item of items) {
      if (!item.product || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) throw error(400, "Each item requires product and a positive integer quantity", "VALIDATION_ERROR");
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) throw error(404, "One or more products were not found", "NOT_FOUND");
      const stock = await Stock.findOne({ product: product._id, warehouse });
      const existingQuantity = normalizedByProduct.get(String(product._id))?.quantity || 0;
      const requestedQuantity = existingQuantity + Number(item.quantity);
      if (!stock || stock.quantity < requestedQuantity) throw error(409, `Insufficient stock for ${product.name}`, "INSUFFICIENT_STOCK", { product: product._id, available: stock ? stock.quantity : 0, requested: requestedQuantity });
      normalizedByProduct.set(String(product._id), { product: product._id, quantity: requestedQuantity, unitPrice: product.price });
    }
    const normalized = Array.from(normalizedByProduct.values());
    for (const item of normalized) totalAmount += item.unitPrice * item.quantity;

    for (const item of normalized) {
      await Stock.findOneAndUpdate({ product: item.product, warehouse }, { $inc: { quantity: -item.quantity } }, { runValidators: true });
      await StockTransaction.create({ product: item.product, warehouse, type: "ORDER", quantity: item.quantity, reason: "Customer order", performedBy: req.user._id });
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: req.user._id,
      warehouse,
      items: normalized,
      shippingAddress,
      note,
      totalAmount,
    });
    return success(res, 201, "Order created", order);
  } catch (err) { next(err); }
});

router.get("/my", authorize("sales"), async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).populate("warehouse", "name code").populate("items.product", "name sku").sort({ createdAt: -1 });
    return success(res, 200, "My orders retrieved", orders);
  } catch (err) { next(err); }
});

router.get("/", authorize("admin", "manager", "sales"), async (req, res, next) => {
  try {
    const filter = req.user.role === "sales" ? { customer: req.user._id } : {};
    const orders = await Order.find(filter).populate("customer", "name email").populate("warehouse", "name code").populate("items.product", "name sku").sort({ createdAt: -1 });
    return success(res, 200, "Orders retrieved", orders);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email").populate("warehouse", "name code").populate("items.product", "name sku");
    if (!order) throw error(404, "Order not found", "NOT_FOUND");
    if (!["admin", "manager"].includes(req.user.role) && String(order.customer._id) !== String(req.user._id)) throw error(403, "You can only view your own orders", "FORBIDDEN");
    return success(res, 200, "Order retrieved", order);
  } catch (err) { next(err); }
});

router.patch("/:id/status", authorize("admin", "manager"), async (req, res, next) => {
  try {
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(req.body.status)) throw error(400, "Invalid order status", "VALIDATION_ERROR", { allowed });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) throw error(404, "Order not found", "NOT_FOUND");
    return success(res, 200, "Order status updated", order);
  } catch (err) { next(err); }
});

router.patch("/:id/cancel", authorize("sales"), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw error(404, "Order not found", "NOT_FOUND");
    if (String(order.customer) !== String(req.user._id)) throw error(403, "You can only cancel your own orders", "FORBIDDEN");
    if (order.status !== "pending") throw error(409, "Only pending orders can be cancelled", "INVALID_ORDER_STATE");
    order.status = "cancelled";
    await order.save();
    for (const item of order.items) {
      await Stock.findOneAndUpdate(
        { product: item.product, warehouse: order.warehouse },
        { $inc: { quantity: item.quantity } },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
      );
      await StockTransaction.create({ product: item.product, warehouse: order.warehouse, type: "IN", quantity: item.quantity, reason: `Restocked cancelled order ${order.orderNumber}`, performedBy: req.user._id });
    }
    return success(res, 200, "Order cancelled", order);
  } catch (err) { next(err); }
});

module.exports = router;