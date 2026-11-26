const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 40 },
  category: { type: String, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, min: 0, default: 0 },
  unit: { type: String, trim: true, maxlength: 30, default: "piece" },
  lowStockThreshold: { type: Number, min: 0, default: 10 },
  imageUrl: { type: String, trim: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);