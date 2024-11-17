const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ msg: "Query is required" });
    }

    const items = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { catName: { $regex: query, $options: "i" } }
      ],
    }).populate("subCat");


    
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Issues" });
  }
});

module.exports = router;
