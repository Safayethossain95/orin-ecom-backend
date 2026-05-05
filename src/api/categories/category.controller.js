const Category = require("./category.model");
const AppError = require("../../utils/app-error");
const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().populate("parent", "name slug").sort("name");
  sendResponse(res, 200, "Categories fetched.", { categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  sendResponse(res, 201, "Category created.", { category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError("Category not found.", 404);

  sendResponse(res, 200, "Category updated.", { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError("Category not found.", 404);

  sendResponse(res, 204, "Category deleted.");
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
