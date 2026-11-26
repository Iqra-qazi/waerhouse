const express = require("express");
const Warehouse = require("../models/Warehouse");
const { authenticate, authorize } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();
router.use(authenticate);

router.get("/", async (_req, res, next) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true }).populate("manager", "name email role").sort({ name: 1 });
    return success(res, 200, "Warehouses retrieved", warehouses);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate("manager", "name email role");
    if (!warehouse) throw error(404, "Warehouse not found", "NOT_FOUND");
    return success(res, 200, "Warehouse retrieved", warehouse);
  } catch (err) { next(err); }
});

router.post("/", authorize("admin"), async (req, res, next) => {
  try {
    const { name, code, address, manager } = req.body;
    if (!name || !code) throw error(400, "name and code are required", "VALIDATION_ERROR");
    const warehouse = await Warehouse.create({ name, code, address, manager });
    return success(res, 201, "Warehouse created", warehouse);
  } catch (err) { next(err); }
});

router.patch("/:id", authorize("admin"), async (req, res, next) => {
  try {
    const allowed = ["name", "code", "address", "manager", "isActive"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(updates).length) throw error(400, "No valid fields supplied", "VALIDATION_ERROR");
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!warehouse) throw error(404, "Warehouse not found", "NOT_FOUND");
    return success(res, 200, "Warehouse updated", warehouse);
  } catch (err) { next(err); }
});

router.delete("/:id", authorize("admin"), async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!warehouse) throw error(404, "Warehouse not found", "NOT_FOUND");
    return success(res, 200, "Warehouse deactivated", warehouse);
  } catch (err) { next(err); }
});

module.exports = router;