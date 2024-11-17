const { ProductRams } = require("../models/productRAMS");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const productRamList = await ProductRams.find();
        if (!productRamList) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(productRamList);
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
});

router.post("/create", async (req, res) => {
    try {
        let productRam = new ProductRams({
            productRAM: req.body.productRAM,
        });
        productRam = await productRam.save();
        res.status(201).json(productRam);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deleteProduct = await ProductRams.findByIdAndDelete(req.params.id);
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
        const item = await ProductRams.findByIdAndUpdate(
            prodId,
            { productRAM: req.body.productRAM },
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
