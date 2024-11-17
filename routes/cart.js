const { Cart } = require("../models/cart");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cartList = await Cart.find(req.query);

    return res.status(200).json(cartList);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching categories." });
  }
});

// Create a new category

router.post("/add", async (req, res) => {
  const { name, images, rating, price, quantity, subTotal, prodId, userId } =
    req.body;

  try {
    // Check if the product is already in the cart for this user
    const cartItemFind = await Cart.findOne({ prodId,userId });
    if (!cartItemFind) {
      // Create a new cart item if it doesn't exist
      let cartItem = new Cart({
        name,
        images,
        rating,
        price,
        quantity,
        subTotal,
        prodId,
        userId,
      });

      cartItem = await cartItem.save();

      return res.status(201).json({
        msg: "Item added to cart successfully",
        cartItem,
        success: true,
      });
    } else {
      // If the item is already in the cart
      return res.status(201).json({
        msg: "The item is already added to the cart",
        success: false,
      });
    }
  } catch (err) {
    console.error("Error creating Cart:", err);
    return res.status(500).json({
      error: "An error occurred while creating the Cart",
      success: false,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const cartitem = await Cart.findById(req.params.id);

    if (!cartitem) {
      return res.status(404).json({
        msg: "The Cart With Given Id Not Found",
        success: false,
      });
    }

    const deleteCart = await Cart.findByIdAndDelete(req.params.id);

    if (!deleteCart) {
      return res.status(404).json({
        msg: "Cart Item can not delete",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Cart item Deleted!",
    });
  } catch (error) {
    console.error("Error deleting Cart Item:", error); // Log the error
    return res
      .status(500)
      .json({
        msg: "An error occurred while deleting the Cart Item.",
        success: false,
      });
  }
});

router.delete("/deletecart/all", async (req, res) => {
  try {
    const result = await Cart.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All cart items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete cart items",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  const { name, images, rating, price, quantity, subTotal, prodId, userId } =
    req.body;

  try {
    // Upload images with limit

    // Find and update the category
    const cartItem = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        name,
        images,
        rating,
        price,
        quantity,
        subTotal,
        prodId,
        userId,
      },
      { new: true }
    );

    if (!cartItem) {
      return res.status(500).json({
        message: "Cart Item cannot be updated!",
        success: false,
      });
    }

    res.status(200).json(cartItem); // Send the updated category
  } catch (error) {
    console.error("Error updating Cart Item:", error);
    res.status(500).json({
      error: "An error occurred while updating the Cart Item",
      success: false,
    });
  }
});

router.get("/count", async (req, res) => {
  const cartCount = await Cart.countDocuments();

  if (!cartCount) {
    return res.status(404).json({ msg: "No Item Found", success: false });
  }

  res.status(200).json(cartCount);
});

module.exports = router;

