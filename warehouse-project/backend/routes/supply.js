const express = require("express");
const SupplyRequest = require("../models/SupplyRequest");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const Stock = require("../models/Stock");
const StockTransaction = require("../models/StockTransaction");
const { authenticate, authorize } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("supplier"), async (req, res, next) => {
  try {
    const { product, warehouse, quantity, note } = req.body;
    if (!product || !warehouse || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) throw error(400, "product, warehouse and positive integer quantity are required", "VALIDATION_ERROR");
    const productDoc = await Product.findById(product);
    if (!productDoc) throw error(404, "Product not found", "NOT_FOUND");
    if (String(productDoc.supplier) !== String(req.user._id)) throw error(403, "You can only request supply for your own products", "FORBIDDEN");
    if (!await Warehouse.findById(warehouse)) throw error(404, "Warehouse not found", "NOT_FOUND");
    const request = await SupplyRequest.create({ supplier: req.user._id, product, warehouse, quantity: Number(quantity), note });
    return success(res, 201, "Supply request created", request);
  } catch (err) { next(err); }
});

router.get("/my", authorize("supplier"), async (req, res, next) => {
  try {
    const requests = await SupplyRequest.find({ supplier: req.user._id }).populate("product", "name sku").populate("warehouse", "name code").sort({ createdAt: -1 });
    return success(res, 200, "Supply requests retrieved", requests);
  } catch (err) { next(err); }
});

router.get("/", authorize("admin", "manager"), async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const requests = await SupplyRequest.find(filter).populate("supplier", "name email").populate("product", "name sku").populate("warehouse", "name code").sort({ createdAt: -1 });
    return success(res, 200, "Supply requests retrieved", requests);
  } catch (err) { next(err); }
});

router.patch("/:id/review", authorize("admin", "manager"), async (req, res, next) => {
  try {
    if (!["approved", "rejected"].includes(req.body.status)) throw error(400, "Status must be approved or rejected", "VALIDATION_ERROR");
    const request = await SupplyRequest.findById(req.params.id);
    if (!request) throw error(404, "Supply request not found", "NOT_FOUND");
    if (request.status !== "pending") throw error(409, "Supply request has already been reviewed", "INVALID_REQUEST_STATE");
    request.status = req.body.status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();
    if (req.body.status === "approved") {
      await Stock.findOneAndUpdate(
        { product: request.product, warehouse: request.warehouse },
        { $inc: { quantity: request.quantity } },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
      );
      await StockTransaction.create({ product: request.product, warehouse: request.warehouse, type: "IN", quantity: request.quantity, reason: "Approved supply request", performedBy: req.user._id });
    }
    return success(res, 200, "Supply request reviewed", request);
  } catch (err) { next(err); }
});

module.exports = router;