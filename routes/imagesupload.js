const express = require("express");
const router = express.Router();
exports.router = router;
const { imagesupload } = require("../models/imagesupload");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name:process.env.cloudinary_Config_Cloud_Name,
  api_key:process.env.cloudinary_Config_api_key,
  api_secret:process.env.cloudinary_Config_api_secret,
  secure:true
})


router.get("/", async (req, res) => {
  try {
    const images = await imagesupload.find();

    return res.status(200).json({
      images: images,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching images." });
  }
});


router.delete("/deleteimage", async (req, res) => {
  // Ensure the body contains the image URL
  const imageUrl = req.body.image; // Assuming req.body.image is the URL of the image



  if (!imageUrl) {
    return res.status(400).json({ message: "Image URL is required" });
  }

  // Extract the public ID from the image URL
  const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0]; 
  

  try {
    // const deletedImage = await imagesupload.findOneAndDelete({ imageUrl });
    // if (!deletedImage) {
    //   return res.status(404).json({
    //     message:"No image",
    //     error:true
    //   })

    // }
    const result = await cloudinary.uploader.destroy(publicId);
    

    if (result.result === 'ok') {
      return res.status(200).json({ message: 'Image deleted successfully', result });
    } else {
      return res.status(404).json({ message: 'Image not found or not deleted', result });
    }
  } catch (error) {
    console.error("Error deleting image:", error.message);
    return res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
});


router.delete("/deleteAllImages", async (req, res) => {
  try {
    const deleteResult = await imagesupload.deleteMany({}); 

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        message: "No images found to delete.",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: `${deleteResult.deletedCount} image(s) deleted!`,
    });
  } catch (error) {
    console.error("Error deleting images:", error); // Log the error
    res.status(500).json({
      error: "An error occurred while deleting the images."
    });
  }
});

module.exports = router;