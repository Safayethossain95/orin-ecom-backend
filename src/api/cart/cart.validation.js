const { z } = require("zod");
const { objectId } = require("../../validators/common");

const addCartItemSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.number().int().positive(),
  }),
});

const updateCartItemSchema = z.object({
  params: z.object({ productId: objectId }),
  body: z.object({
    quantity: z.number().int().positive(),
  }),
});

module.exports = {
  addCartItemSchema,
  updateCartItemSchema,
};
