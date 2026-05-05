const express = require("express");
const reviewController = require("./review.controller");
const { createReviewSchema } = require("./review.validation");
const protect = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { idParam } = require("../../validators/common");

const router = express.Router();

router.get("/products/:productId", reviewController.listProductReviews);
router.post(
  "/products/:productId",
  protect,
  validate(createReviewSchema),
  reviewController.createReview
);
router.delete("/:id", protect, validate(idParam), reviewController.deleteReview);

module.exports = router;
