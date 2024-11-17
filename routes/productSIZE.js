const { ProductSize } = require("../models/productSIZE");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const productSizeList = await ProductSize.find();
        if (!productSizeList) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(productSizeList);
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

router.post("/create", async (req, res) => {
    try {
        let productSIZE = new ProductSize({
            productSIZE: req.body.productSIZE,
        });
        productSIZE = await productSIZE.save();
        res.status(201).json(productSIZE);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deleteProduct = await ProductSize.findByIdAndDelete(req.params.id);
        if (!deleteProduct) {
            return res.status(404).json({
                message: "ProductSize not found",
                success: false,
            });
        }
        res.status(200).json({
            success: true,
            message: "Item Deleted!",
        });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

router.put("/:id", async (req, res) => {
    const prodId = req.params.id;

    try {
        const item = await ProductSize.findByIdAndUpdate(
            prodId,
            { productSIZE: req.body.productSIZE },
            { new: true }
        );

        if (!item) {
            return res.status(404).json({
                message: "The item is not found",
                success: false,
            });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

module.exports = router;
