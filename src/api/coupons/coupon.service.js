const Coupon = require("./coupon.model");
const AppError = require("../../utils/app-error");

const getValidCoupon = async (code, subtotal) => {
  if (!code) return { coupon: null, discount: 0 };

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new AppError("Coupon is invalid.", 400);

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new AppError("Coupon is not active yet.", 400);
  if (coupon.expiresAt && coupon.expiresAt < now) throw new AppError("Coupon has expired.", 400);
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit reached.", 400);
  }
  if (subtotal < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount for this coupon is ${coupon.minOrderAmount}.`, 400);
  }

  return { coupon, discount: coupon.calculateDiscount(subtotal) };
};

module.exports = {
  getValidCoupon,
};
