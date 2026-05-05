const { z } = require("zod");
const { objectId } = require("../../validators/common");

const createReviewSchema = z.object({
  params: z.object({ productId: objectId }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional(),
    comment: z.string().min(2).max(2000),
  }),
});

module.exports = {
  createReviewSchema,
};
