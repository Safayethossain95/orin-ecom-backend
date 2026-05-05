const Review = require("./review.model");
const AppError = require("../../utils/app-error");
const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");

const listProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort("-createdAt");

  sendResponse(res, 200, "Reviews fetched.", { reviews });
});

const createReview = asyncHandler(async (req, res) => {
  const review = await Review.create({
    product: req.params.productId,
    user: req.user.id,
    ...req.body,
  });

  sendResponse(res, 201, "Review created.", { review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError("Review not found.", 404);

  const ownsReview = review.user.toString() === req.user.id;
  if (!ownsReview && req.user.role !== "admin") {
    throw new AppError("You are not authorized to delete this review.", 403);
  }

  await Review.findByIdAndDelete(req.params.id);
  sendResponse(res, 204, "Review deleted.");
});

module.exports = {
  listProductReviews,
  createReview,
  deleteReview,
};
