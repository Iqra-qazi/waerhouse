const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { success, error } = require("../utils/response");

const router = express.Router();

function issueToken(user) {
  if (!process.env.JWT_SECRET) throw error(500, "JWT_SECRET is not configured", "SERVER_CONFIGURATION_ERROR");
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "sales", phone } = req.body;
    if (!name || !email || !password) throw error(400, "name, email and password are required", "VALIDATION_ERROR");
    if (password.length < 8) throw error(400, "Password must be at least 8 characters", "VALIDATION_ERROR");
    if (!["sales", "supplier"].includes(role)) throw error(400, "Public registration allows only sales or supplier roles", "VALIDATION_ERROR");

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) throw error(409, "Email is already registered", "DUPLICATE_VALUE");

    const user = await User.create({ name, email, password, role, phone });
    const token = issueToken(user);
    return success(res, 201, "Registration successful", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw error(400, "Email and password are required", "VALIDATION_ERROR");
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) throw error(401, "Invalid email or password", "INVALID_CREDENTIALS");
    if (!user.isActive) throw error(403, "Account is inactive", "ACCOUNT_INACTIVE");
    const token = issueToken(user);
    return success(res, 200, "Login successful", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) { next(err); }
});

router.get("/me", authenticate, async (req, res) => {
  return success(res, 200, "Current user", req.user);
});

router.post("/logout", authenticate, (_req, res) => {
  return success(res, 200, "Logout successful", null);
});

module.exports = router;