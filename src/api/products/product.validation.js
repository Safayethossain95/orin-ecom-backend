const { z } = require("zod");
const { objectId, paginationQuery } = require("../../validators/common");

const productBody = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(10),
  brand: z.string().optional(),
  sku: z.string().min(2).max(80),
  category: objectId,
  images: z.array(z.string().url()).optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

const createProductSchema = z.object({ body: productBody });
const updateProductSchema = z.object({ body: productBody.partial() });
const listProductsSchema = z.object({ query: paginationQuery });

module.exports = {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
};
