const { z } = require("zod");

const couponBody = z.object({
  code: z.string().min(2).max(40),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

const createCouponSchema = z.object({ body: couponBody });
const updateCouponSchema = z.object({ body: couponBody.partial() });

module.exports = {
  createCouponSchema,
  updateCouponSchema,
};
