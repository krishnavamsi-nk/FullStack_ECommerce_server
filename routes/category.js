const { Category } = require("../models/category");
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

var categoryEditId = null;
var imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const createCategories = (categories, parentId = null) => {
  let categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter(
      (cat) => cat.parentId == null || cat.parentId == ""
    );
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cat of category) {
    const { _id, name, images, color, slug, items } = cat;
    categoryList.push({
      _id,
      name,
      images,
      color,
      slug,
      items,
      children: createCategories(categories, _id),
    });
  }

  return categoryList;
};

router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList || categoryList.length === 0) {
      return res.status(404).json({ msg: "No items found", success: false });
    }

    const categoryData = createCategories(categoryList);

    return res.status(200).json({
      categoryList: categoryData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching categories." });
  }
});



router.get("/get/count", async(req,res)=>{
  const categorysCount = await Category.countDocuments({parentId:undefined});

  if(!categorysCount){
    return res.status(500).json({success:false});
  }
  return res.send({
    categorysCount: categorysCount
  })
})




router.get("/subCat/get/count", async (req, res) => {
  try {
    const catCount = await Category.find();

    if (!catCount || catCount.length === 0) {
      return res.status(404).json({ success: false, message: "No categories found" });
    }

    // Filter categories with a defined parentId (subcategories)
    const subCatList = catCount.filter(cat => cat.parentId !== undefined);

    return res.status(200).json({ success: true, subCategoryCount: subCatList.length });
  } catch (error) {
    return res.status(500).json({ success: false, error: "An error occurred while fetching subcategory count." });
  }
});


router.post("/upload", upload.array("images"), async (req, res) => {
  imagesArr = [];
  try {
    if (categoryEditId) {
      const category = await Category.findById(categoryEditId);
      const imageArr = category.images;

      console.log("initial img Array :", imageArr);
      const images = imageArr;

      if (images.length !== 0) {
        for (const image of images) {
          try {
            fs.unlinkSync(`uploads/${image}`);
          } catch (err) {
            console.error(
              `Failed to delete file: ${image}, error: ${err.message}`
            );
          }
        }
        categoryEditId = "";
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

router.post("/create", async (req, res) => {
  let catObj = {};

  if (imagesArr.length > 0) {
    catObj = {
      name: req.body.name,
      images: imagesArr,
      color: req.body.color,
      slug: req.body.slug,
      items: req.body.items,
    };
  } else {
    catObj = {
      name: req.body.name,
      slug: req.body.slug,
    };
  }

  if (req.body.parentId) {
    catObj.parentId = req.body.parentId;
  }

  let category = new Category(catObj);

  if (!category) {
    res.status(500).json({
      error: err,
      success: false,
    });
  }

  category = await category.save();
  imagesArr = [];

  res.status(201).json(category);
});

router.get("/:id", async (req, res) => {
  try {
    categoryEditId = req.params.id;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "The Category with the given ID is not found." });
    }
    return res.status(200).send(category);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the category." });
  }
});

// Delete a category by ID
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    console.log("this is the images in the category", category.images);
    console.log("this is the images in the imagArr", imagesArr);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    const images = category.images;
    console.log("this is the images in the category", images);

    // Delete images from Cloudinary
    const deletePromises = images.map((imageUrl) => {
      // Extract the public ID from the URL
      const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0]; // Get the last part of the URL and remove the extension
      console.log("This is the Public id:", publicId);
      return cloudinary.uploader.destroy(publicId); // Pass the public ID to Cloudinary
    });

    // Wait for all delete operations to complete
    await Promise.all(deletePromises);

    const deleteCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deleteCategory) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Category Deleted!",
    });
  } catch (error) {
    console.error("Error deleting category:", error); // Log the error
    res
      .status(500)
      .json({ error: "An error occurred while deleting the category." });
  }
});

// Update By ID
router.put("/:id", async (req, res) => {
  try {
    let catObj = {};

    const item = Category.findById(req.params.id);

    if (!req.body.parentId) {
      catObj = {
        name: req.body.name,
        images: req.body.images,
        color: req.body.color,
        slug: req.body.slug,
        items: req.body.items,
        
      };
    } else {
      catObj = {
        name: req.body.name,
        slug: req.body.slug,
        parentId : req.body.parentId,
      };
    }



    // Find and update the category by ID
    const updateCat = await Category.findByIdAndUpdate(req.params.id, catObj, {
      new: true,
    });

    if (updateCat) {
      return res
        .status(200)
        .json({ msg: "Updated successfully", success: true, updateCat });
    } else {
      return res
        .status(404)
        .json({ msg: "Category not found", success: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        msg: "Something went wrong!",
        success: false,
        error: error.message,
      });
  }
});

module.exports = router;
