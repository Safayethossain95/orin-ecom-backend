const Coupon = require("./coupon.model");
const AppError = require("../../utils/app-error");
const asyncHandler = require("../../utils/async-handler");
const sendResponse = require("../../utils/send-response");

const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  sendResponse(res, 200, "Coupons fetched.", { coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  sendResponse(res, 201, "Coupon created.", { coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw new AppError("Coupon not found.", 404);

  sendResponse(res, 200, "Coupon updated.", { coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError("Coupon not found.", 404);

  sendResponse(res, 204, "Coupon deleted.");
});

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
