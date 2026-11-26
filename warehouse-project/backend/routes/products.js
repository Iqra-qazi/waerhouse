const express = require("express");
const Product = require("../models/Product");
const { authenticate, authorize } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };
    const products = await Product.find(filter).populate("supplier", "name email").populate("warehouse", "name code").sort({ name: 1 });
    return success(res, 200, "Products retrieved", products);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("supplier", "name email").populate("warehouse", "name code");
    if (!product) throw error(404, "Product not found", "NOT_FOUND");
    return success(res, 200, "Product retrieved", product);
  } catch (err) { next(err); }
});

router.post("/", authenticate, authorize("admin", "supplier"), async (req, res, next) => {
  try {
    const { name, sku, category, description, price, cost, unit, lowStockThreshold, imageUrl, supplier, warehouse } = req.body;
    if (!name || !sku || price === undefined) throw error(400, "name, sku and price are required", "VALIDATION_ERROR");
    if (Number(price) < 0) throw error(400, "Price cannot be negative", "VALIDATION_ERROR");
    const product = await Product.create({
      name, sku, category, description, price, cost, unit, lowStockThreshold, imageUrl, warehouse,
      supplier: req.user.role === "supplier" ? req.user._id : supplier,
    });
    return success(res, 201, "Product created", product);
  } catch (err) { next(err); }
});

router.patch("/:id", authenticate, authorize("admin", "supplier"), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw error(404, "Product not found", "NOT_FOUND");
    if (req.user.role === "supplier" && String(product.supplier) !== String(req.user._id)) throw error(403, "You can only modify your own products", "FORBIDDEN");
    const allowed = ["name", "sku", "category", "description", "price", "cost", "unit", "lowStockThreshold", "imageUrl", "warehouse", "isActive"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(updates).length) throw error(400, "No valid fields supplied", "VALIDATION_ERROR");
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    return success(res, 200, "Product updated", updated);
  } catch (err) { next(err); }
});

router.delete("/:id", authenticate, authorize("admin", "supplier"), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw error(404, "Product not found", "NOT_FOUND");
    if (req.user.role === "supplier" && String(product.supplier) !== String(req.user._id)) throw error(403, "You can only remove your own products", "FORBIDDEN");
    product.isActive = false;
    await product.save();
    return success(res, 200, "Product deactivated", product);
  } catch (err) { next(err); }
});

module.exports = router;