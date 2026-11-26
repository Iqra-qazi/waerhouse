const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  type: { type: String, enum: ["IN", "OUT", "ADJUSTMENT", "ORDER"], required: true },
  quantity: { type: Number, required: true, min: 1 },
  reason: { type: String, trim: true, maxlength: 300 },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);