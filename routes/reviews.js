const { Reviews } = require("../models/reviews");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const reviews = req.query.productId
      ? await Reviews.find({ productId: req.query.productId })
      : await Reviews.find();

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, msg: "No reviews found" });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const count = await Reviews.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve order count",
      error: error.message,
    });
  }
});


router.get("/:id", async (req, res) => {
  const review = await Reviews.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, msg: "No Reviews Found" });
  }
  return res.status(200).json(review);
});

router.post("/add", async (req, res) => {
  let review = new Reviews({
    customerName: req.body.customerName,
    productId: req.body.productId,
    review: req.body.review,
    customerId: req.body.customerId,
    customerRating: req.body.customerRating,
  });

  if (!review) {
    return res.status(500).json({ success: false, msg: "review can not Post" });
  }

  review = await review.save();

  return res.status(201).json(review);
});

module.exports = router;
