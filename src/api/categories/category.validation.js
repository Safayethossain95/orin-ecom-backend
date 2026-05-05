const { z } = require("zod");
const { objectId } = require("../../validators/common");

const categoryBody = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional(),
  parent: objectId.optional(),
  isActive: z.boolean().optional(),
});

const createCategorySchema = z.object({ body: categoryBody });
const updateCategorySchema = z.object({ body: categoryBody.partial() });

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
