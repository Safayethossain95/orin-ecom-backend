const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");
const productService = require("./product.service");

const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  sendResponse(res, 200, "Products fetched.", { products: result.products }, result.meta);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  sendResponse(res, 200, "Product fetched.", { product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user.id);
  sendResponse(res, 201, "Product created.", { product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user);
  sendResponse(res, 200, "Product updated.", { product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user);
  sendResponse(res, 204, "Product deleted.");
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
