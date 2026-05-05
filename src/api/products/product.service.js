const Product = require("./product.model");
const ApiFeatures = require("../../utils/api-features");
const AppError = require("../../utils/app-error");

const listProducts = async (queryString) => {
  const baseQuery = Product.find({ isPublished: true }).populate("category", "name slug");
  const features = new ApiFeatures(baseQuery, queryString)
    .filter()
    .search(["name", "description", "brand", "tags"])
    .sort()
    .limitFields()
    .paginate();

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments({ isPublished: true }),
  ]);

  return {
    products,
    meta: { ...features.pagination, total },
  };
};

const getProduct = async (idOrSlug) => {
  const query = /^[a-f\d]{24}$/i.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  const product = await Product.findOne(query)
    .populate("category", "name slug")
    .populate("seller", "name");

  if (!product) throw new AppError("Product not found.", 404);
  return product;
};

const createProduct = async (payload, sellerId) => Product.create({ ...payload, seller: sellerId });

const updateProduct = async (productId, payload, user) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found.", 404);

  const isOwner = product.seller.toString() === user.id;
  if (!isOwner && user.role !== "admin") {
    throw new AppError("Only the seller or admin can update this product.", 403);
  }

  Object.assign(product, payload);
  await product.save();
  return product;
};

const deleteProduct = async (productId, user) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found.", 404);

  const isOwner = product.seller.toString() === user.id;
  if (!isOwner && user.role !== "admin") {
    throw new AppError("Only the seller or admin can delete this product.", 403);
  }

  await product.deleteOne();
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
