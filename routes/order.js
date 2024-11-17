const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const perPage = 6;

    const totalPosts = await Order.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    // Handle case where there are no categories
    if (totalPosts === 0) {
      return res.status(200).json({
        orderList: [],
        totalPages: 0,
        page: 1,
        perpage: perPage,
      });
    }

    // Handle case where requested page is greater than total pages
    if (page > totalPages) {
      return res.status(404).json({ message: "Page Not Found" });
    }

    // Fetch paginated order list
    const orderList = await Order.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      orderList: orderList,
      totalPages: totalPages,
      page: page,
      perpage: perPage,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching categories." });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve order count",
      error: error.message,
    });
  }
});


// router.post("/add", async (req, res) => {
//   try {
//     const newOrder = new Order({
//       name: req.body.name,
//       phoneNumber: req.body.phoneNumber,
//       pincode: req.body.pincode,
//       amount: req.body.amount,
//       paymentId: req.body.paymentId,
//       email: req.body.email,
//       userId: req.body.userId,
//       products: req.body.products,
//       date: req.body.date, // Optional, will default to current date if not provided
//     });

//     const savedOrder = await newOrder.save();
//     res.status(201).json({ success: true, data: savedOrder });
//   } catch (err) {
//     console.error("Error creating Order:", err);
//     return res.status(500).json({
//       error: "An error occurred while creating the Order",
//       success: false,
//     });
//   }
// });

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: "The Order with the given ID is not found." });
    }
    return res.status(200).send(order);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the order." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleteorder = await Order.findByIdAndDelete(req.params.id);

    if (!deleteorder) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order Deleted!",
    });
  } catch (error) {
    console.error("Error deleting order:", error); // Log the error
    res
      .status(500)
      .json({ error: "An error occurred while deleting the order." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    // Await the retrieval of the order by ID
    const order = await Order.findById(req.params.id);

    if (order) {
      // Update the order and set the new option to true
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          pincode: req.body.pincode,
          amount: req.body.amount,
          paymentId: req.body.paymentId,
          email: req.body.email,
          userId: req.body.userId,
          products: req.body.products,
          status: req.body.status,
          date: req.body.date,
        },
        {
          new: true,
        }
      );

      // Send the response with the updated order data
      return res.status(201).json({ msg: "Order is updated", success: true, updatedOrder });
    } else {
      return res.status(404).json({ msg: "Order Not found", success: false });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal server issues!", success: false });
  }
});


module.exports = router;
