const { Mylist } = require("../models/mylist");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const mylist = await Mylist.find(req.query);

    if(!mylist || mylist.length === 0){
      return res.status(404).json({success:false,msg:"The item is not Found in list"})
    }


    return res.status(200).json(mylist);
  } catch (error) {
    return res
      .status(500)
      .json({success:false,msg:"error", error: "An error occurred while fetching categories." });
  }
});

// Create a new category

router.post("/add", async (req, res) => {
  const { name, images, rating, price, prodId, userId } = req.body;

  try {
    // Check if the product is already in the cart for this user
    const item = await Mylist.findOne({ prodId });
    if (!item) {
      // Create a new cart item if it doesn't exist
      let listItem = new Mylist({
        name,
        images,
        rating,
        price,
        prodId,
        userId,
      });

      listItem = await listItem.save();

      return res.status(201).json({
        msg: "Item added to Mylist successfully",
        listItem,
        success: true,
      });
    } else {
      // If the item is already in the cart
      return res.status(201).json({
        msg: "The item is already added to the My List",
        success: false,
      });
    }
  } catch (err) {
    console.error("Error creating Mylist:", err);
    return res.status(500).json({
      msg: "An error occurred while creating the Mylist",
      success: false,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const cartitem = await Mylist.findById(req.params.id);

    if (!cartitem) {
      return res.status(404).json({
        msg: "The Mylist With Given Id Not Found",
        success: false,
      });
    }

    const deleteCart = await Mylist.findByIdAndDelete(req.params.id);

    if (!deleteCart) {
      return res.status(404).json({
        msg: "Mylist Item can not delete",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Mylist item Deleted!",
    });
  } catch (error) {
    console.error("Error deleting Mylist Item:", error); // Log the error
    return res.status(500).json({
      msg: "An error occurred while deleting the Mylist Item.",
      success: false,
    });
  }
});


router.get("/count", async (req, res) => {
  const listCount = await Mylist.countDocuments();

  if (!listCount) {
    return res.status(404).json({ msg: "No Item Found", success: false });
  }

  res.status(200).json(listCount);
});

router.get("/:id", async (req, res) => {
  const listItem = await Mylist.findById(req.params.id);

  if (!listItem) {
    return res
      .status(404)
      .json({ msg: "The item  with the given id an not found in mylist" });
  }

  return res.status(200).send(listItem);
});

module.exports = router;
