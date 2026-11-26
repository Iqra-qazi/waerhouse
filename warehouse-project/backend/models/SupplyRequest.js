const mongoose = require("mongoose");

const supplyRequestSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  note: { type: String, trim: true, maxlength: 1000 },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("SupplyRequest", supplyRequestSchema);