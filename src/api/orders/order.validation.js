const { z } = require("zod");
const { objectId } = require("../../validators/common");

const createOrderSchema = z.object({
  body: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    items: z.any(),
    subtotal: z.number(),
    shipping: z.any(),
    total: z.number(),
    createdAt: z.string(),
  }),
});

const createDirectOrderSchema = z.object({
  body: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    items: z.any(),
    subtotal: z.number(),
    shipping: z.any(),
    total: z.number(),
    createdAt: z.string(),
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
  createDirectOrderSchema,
  updateOrderStatusSchema,
};
