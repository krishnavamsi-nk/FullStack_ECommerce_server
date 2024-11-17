const { ProductWeight } = require("../models/productWEIGHT");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const productWeightList = await ProductWeight.find();
        if (!productWeightList) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(productWeightList);
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

router.post("/create", async (req, res) => {
    try {
        let productWeight = new ProductWeight({
            productWEIGHT: req.body.productWEIGHT,
        });
        productWeight = await productWeight.save();
        res.status(201).json(productWeight);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deleteProduct = await ProductWeight.findByIdAndDelete(req.params.id);
        if (!deleteProduct) {
            return res.status(404).json({
                message: "ProductWeight not found",
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
        const item = await ProductWeight.findByIdAndUpdate(
            prodId,
            { productWEIGHT: req.body.productWEIGHT },
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
