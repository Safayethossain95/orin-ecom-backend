const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB object id.");

const idParam = z.object({
  params: z.object({ id: objectId }),
});

const paginationQuery = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sort: z.string().optional(),
    fields: z.string().optional(),
    keyword: z.string().optional(),
  })
  .passthrough();

module.exports = {
  objectId,
  idParam,
  paginationQuery,
};
