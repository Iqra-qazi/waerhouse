const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  items: { type: [orderItemSchema], required: true, validate: [(value) => value.length > 0, "At least one item is required"] },
  status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
  totalAmount: { type: Number, required: true, min: 0 },
  shippingAddress: { type: String, required: true, trim: true, maxlength: 500 },
  note: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);