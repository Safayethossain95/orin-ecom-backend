const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.calculateDiscount = function calculateDiscount(subtotal) {
  if (this.type === "percentage") {
    const discount = subtotal * (this.value / 100);
    return this.maxDiscountAmount ? Math.min(discount, this.maxDiscountAmount) : discount;
  }

  return Math.min(this.value, subtotal);
};

module.exports = mongoose.model("Coupon", couponSchema);
