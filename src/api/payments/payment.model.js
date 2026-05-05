const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["manual", "stripe", "sslcommerz"], default: "manual" },
    providerPaymentId: String,
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true },
    status: {
      type: String,
      enum: ["requires_payment", "processing", "succeeded", "failed", "refunded"],
      default: "requires_payment",
    },
    metadata: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
