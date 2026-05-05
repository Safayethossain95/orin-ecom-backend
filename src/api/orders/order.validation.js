const { z } = require("zod");
const { objectId } = require("../../validators/common");

const shippingAddress = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(5),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(2),
  country: z.string().min(2),
});

const createOrderSchema = z.object({
  body: z.object({
    shippingAddress,
    paymentMethod: z.enum(["cod", "card", "bank_transfer"]).optional(),
    couponCode: z.string().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum([
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ]),
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
