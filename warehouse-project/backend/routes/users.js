const express = require("express");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();
router.use(authenticate);

router.get("/", authorize("admin"), async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return success(res, 200, "Users retrieved", users);
  } catch (err) { next(err); }
});

router.get("/:id", authorize("admin"), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) throw error(404, "User not found", "NOT_FOUND");
    return success(res, 200, "User retrieved", user);
  } catch (err) { next(err); }
});

router.post("/", authorize("admin"), async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) throw error(400, "name, email, password and role are required", "VALIDATION_ERROR");
    if (password.length < 8) throw error(400, "Password must be at least 8 characters", "VALIDATION_ERROR");
    if (!["admin", "manager", "sales", "supplier"].includes(role)) throw error(400, "Invalid role", "VALIDATION_ERROR");
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) throw error(409, "Email is already registered", "DUPLICATE_VALUE");
    const user = await User.create({ name, email, password, role, phone });
    const result = await User.findById(user._id).select("-password");
    return success(res, 201, "User created", result);
  } catch (err) { next(err); }
});

router.patch("/:id", authorize("admin"), async (req, res, next) => {
  try {
    const allowed = ["name", "email", "role", "phone", "isActive"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(updates).length) throw error(400, "No valid fields supplied", "VALIDATION_ERROR");
    if (updates.role && !["admin", "manager", "sales", "supplier"].includes(updates.role)) throw error(400, "Invalid role", "VALIDATION_ERROR");
    if (updates.email) updates.email = updates.email.toLowerCase().trim();
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password");
    if (!user) throw error(404, "User not found", "NOT_FOUND");
    return success(res, 200, "User updated", user);
  } catch (err) { next(err); }
});

router.delete("/:id", authorize("admin"), async (req, res, next) => {
  try {
    if (String(req.user._id) === String(req.params.id)) throw error(400, "You cannot delete your own account", "VALIDATION_ERROR");
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password");
    if (!user) throw error(404, "User not found", "NOT_FOUND");
    return success(res, 200, "User deactivated", user);
  } catch (err) { next(err); }
});

module.exports = router;