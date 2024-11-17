const { HomeBanner } = require("../models/banner");
const express = require("express");
const router = express.Router();
const { imagesupload } = require("../models/imagesupload");

const multer = require("multer");
const fs = require("fs");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var bannerEditId = null;
var imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname); // Including original name for clarity
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("images"), async (req, res) => {
  imagesArr = [];
  try {
    if (bannerEditId) {
      const homeBanner = await HomeBanner.findById(bannerEditId);
      const imageArr = homeBanner.images;
      // console.log("inside HomeBanner the images :",HomeBanner.images);
      console.log("initial img Array :", imageArr);
      const images = imageArr;

      if (images.length !== 0) {
        // Attempt to delete previous images if they exist
        for (const image of images) {
          try {
            fs.unlinkSync(`uploads/${image}`);
          } catch (err) {
            console.error(
              `Failed to delete file: ${image}, error: ${err.message}`
            );
          }
        }
        bannerEditId = "";
      }
    }

    for (let i = 0; i < req.files.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      const img = await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return;
          }
          imagesArr.push(result.secure_url);
          try {
            fs.unlinkSync(`uploads/${req.files[i].filename}`);
          } catch (err) {
            console.error(
              `Failed to delete file: ${req.files[i].filename}, error: ${err.message}`
            );
          }
        }
      );
    }

    let imagesuploaded = new imagesupload({
      images: imagesArr,
    });

    imagesuploaded = await imagesuploaded.save();
    return res.status(200).json({ uploadedImages: imagesArr });
  } catch (error) {
    console.error("Error in upload route:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const perPage = isNaN(parseInt(req.query.perPage)) ? 4 : parseInt(req.query.perPage);

    const totalPosts = await HomeBanner.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    // Handle case where there are no categories
    if (totalPosts === 0) {
      return res.status(200).json({
        bannerList: [],
        totalPages: 0,
        page: 1,
        perpage: perPage,
      });
    }

    // Handle case where requested page is greater than total pages
    if (page > totalPages) {
      return res.status(404).json({ message: "Page Not Found" });
    }

    // Fetch paginated HomeBanner list
    const bannerList = await HomeBanner.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      bannerList: bannerList,
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

// Create a new HomeBanner

router.post("/create", async (req, res) => {
  try {
    // Create a new HomeBanner with the uploaded images' URLs
    const homeBanner = new HomeBanner({
      images: imagesArr,
    });

    await homeBanner.save();
    imagesArr = [];

    // Respond with success
    return res.status(201).json(HomeBanner);
  } catch (err) {
    console.error("Error creating HomeBanner:", err);
    return res.status(500).json({
      error: "An error occurred while creating the HomeBanner",
      success: false,
    });
  }
});

// Get a HomeBanner by ID
router.get("/:id", async (req, res) => {
  try {
    bannerEditId = req.params.id;
    const homeBanner = await HomeBanner.findById(req.params.id);
    if (!homeBanner) {
      return res
        .status(404)
        .json({ message: "The HomeBanner with the given ID is not found." });
    }
    return res.status(200).send(homeBanner);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the HomeBanner." });
  }
});

// Delete a HomeBanner by ID
router.delete("/:id", async (req, res) => {
  try {
    const homeBanner = await HomeBanner.findById(req.params.id);

    if (!homeBanner) {
      return res.status(404).json({ message: "HomeBanner not found." });
    }
    const images = homeBanner.images;
    console.log("this is the images in the HomeBanner", images);

    // Delete images from Cloudinary
    const deletePromises = images.map((imageUrl) => {
      // Extract the public ID from the URL
      const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0]; // Get the last part of the URL and remove the extension
      console.log("This is the Public id:", publicId);
      return cloudinary.uploader.destroy(publicId); // Pass the public ID to Cloudinary
    });

    // Wait for all delete operations to complete
    await Promise.all(deletePromises);

    const deleteBanner = await HomeBanner.findByIdAndDelete(req.params.id);

    if (!deleteBanner) {
      return res.status(404).json({
        message: "HomeBanner not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "HomeBanner Deleted!",
    });
  } catch (error) {
    console.error("Error deleting HomeBanner:", error); // Log the error
    res
      .status(500)
      .json({ error: "An error occurred while deleting the HomeBanner." });
  }
});

// Update By ID
router.put("/:id", async (req, res) => {
  try {
    const homeBanner = await HomeBanner.findByIdAndUpdate(
      req.params.id,
      {
        images: req.body.images,
      },
      { new: true }
    );

    if (!homeBanner) {
      return res.status(500).json({
        message: "HomeBanner cannot be updated!",
        success: false,
      });
    }

    res.status(200).json(homeBanner); // Send the updated HomeBanner
  } catch (error) {
    console.error("Error updating HomeBanner:", error);
    res.status(500).json({
      error: "An error occurred while updating the HomeBanner",
      success: false,
    });
  }
});

module.exports = router;
