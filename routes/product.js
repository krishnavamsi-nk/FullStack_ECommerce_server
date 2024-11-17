const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const { RecentlyProducts } = require("../models/recentlyProducts");

const pLimit = require("p-limit");

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

var imagesArr = [];
var productEditId;

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
    if (productEditId !== undefined) {
      const product = await Product.findById(productEditId);

      const imageArr = product.images;
      const images = imageArr;

      if (images.length !== 0) {
        // Delete existing images if any
        for (let image of images) {
          try {
            fs.unlinkSync(`uploads/${image}`);
          } catch (err) {
            console.error(`Failed to delete image ${image}:`, err.message);
          }
        }
        productEditId = ""; // Reset productEditId
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
    console.error("Error is upload route:", error);
    res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
});

// Create the product with file uploads
router.post("/create", upload.array("images"), async (req, res) => {
  // Check if category exists
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(404).send("Invalid Category!");
  }

  // Prepare the images array from uploaded files
  // let imagesArr = req.files.map(file => file.filename);

  let product = new Product({
    name: req.body.name,
    subCat: req.body.subCat,
    description: req.body.description,
    brand: req.body.brand,
    price: parseFloat(req.body.price), // Ensure price is a number
    category: req.body.category,
    countInStock: parseInt(req.body.countInStock, 10), // Ensure countInStock is an integer
    rating: parseFloat(req.body.rating), // Ensure rating is a number
    numReviews: parseInt(req.body.numReviews, 10), // Ensure numReviews is an integer
    isFeatured: req.body.isFeatured ,
    images: imagesArr, // Use the images array from the uploaded files
    discountPrice: parseInt(req.body.discountPrice, 10),
    subCatId: req.body.subCatId,
    catName: req.body.catName,
    discount: req.body.discount,
    productRAM: req.body.productRAM,
    productSIZE: req.body.productSIZE,
    productWEIGHT: req.body.productWEIGHT,
    stock: req.body.stock,
    dateCreated: Date.now(), // You can set this directly if you want
  });

  product = await product.save();
  if (!product) {
    return res.status(500).json({
      success: false,
      error: "Failed to create product",
    });
  }

  res.status(201).json(product);
});

// get all products

// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 6;

  

//     let productList;
//     let totalPages;
//     let totalPosts;

//     // Construct the dynamic filter object with price range if provided
//     if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined) {
//       if(req.query.subCatId){
//         productList = await Product.find({ subCatId: req.query.subCatId })
//         .populate("category")
//         .populate("subCat")

//       }
//       else{
//         productList = await Product.find({category:req.query.category})
//         .populate("category")
//         .populate("subCat")


//       }
      
    
//       const filteredProducts = productList.filter((product) => {
//         if (
//           req.query.minPrice &&
//           product.discountPrice < parseInt(req.query.minPrice)
//         ) {
//           return false;
//         }
//         if (
//           req.query.maxPrice &&
//           product.discountPrice > parseInt(req.query.maxPrice)
//         ) {
//           return false;
//         }
//         return true;
//       });

//        totalPosts = filteredProducts?.length;
//       totalPages = Math.ceil(totalPosts / perPage);
  
//       // Handle case where there are no products
//       if (totalPosts === 0) {
//         return res.status(200).json({
//           productList: [],
//           totalPages: 0,
//           page: 1,
//           perPage,
//         });
//       }
  
//       // Handle case where requested page is greater than total pages
//       if (page > totalPages) {
//         return res.status(404).json({ message: "Page Not Found" });
//       }

//       return res.status(200).json({
//         product: filteredProducts,
//         totalPages,
//         page,
//         perPage,
//       });
//     } else {
//       // Dynamic filter for other query parameters
//       let filter = {};
//       if(req.query.category){
//         filter.category = req.query.category;
//       }
//       if (req.query.rating !== undefined) {
//         filter.rating = req.query.rating;
//       }
//       if (req.query.isFeatured !== undefined) {
//         filter.isFeatured = true;
//       }
//       if (req.query.catName) {
//         filter.catName = req.query.catName;
//       }
//       if (req.query.subCatId) {
//         filter.subCatId = req.query.subCatId;
//       }

    


//       // Fetch products using the dynamic filter with pagination
//       productList = await Product.find(filter)
//         .populate("category")
//         .populate("subCat")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();

//         totalPosts = productList?.length;
//         totalPages = Math.ceil(totalPosts / perPage);
    
//         // Handle case where there are no products
//         if (totalPosts === 0) {
//           return res.status(200).json({
//             productList: [],
//             totalPages: 0,
//             page: 1,
//             perPage,
//           });
//         }
    
//         // Handle case where requested page is greater than total pages
//         if (page > totalPages) {
//           return res.status(404).json({ message: "Page Not Found" });
//         }

      

//       return res.status(200).json({
//         product: productList,
//         totalPages,
//         page,
//         perPage,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

router.get("/", async (req, res) => {
  try {
    // Parse and validate query parameters
    const page = req.query.page && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const perPage = req.query.perPage && parseInt(req.query.perPage) > 0 ? parseInt(req.query.perPage) : 8;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined;

    // Build dynamic filter
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subCat) filter.subCat = req.query.subCat;
    if (req.query.catName) filter.catName = req.query.catName;
    if (req.query.rating) filter.rating = req.query.rating;
    if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured;


    // Add price range filter
    if (minPrice || maxPrice) {
      filter.discountPrice = {};
      if (minPrice) filter.discountPrice.$gte = minPrice;
      if (maxPrice) filter.discountPrice.$lte = maxPrice;
    }

    // Fetch total products count for pagination
    const totalPosts = await Product.countDocuments(filter);

    // Handle empty results
    if (totalPosts === 0) {
      return res.status(200).json({
        product: [],
        totalPages: 0,
        page,
        perPage,
      });
    }

    // Handle case where requested page exceeds total pages
    const totalPages = Math.ceil(totalPosts / perPage);
    if (page > totalPages) {
      return res.status(404).json({ message: "Page Not Found" });
    }

    // Fetch paginated products
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("subCat", "name")
      .skip((page - 1) * perPage)
      .limit(perPage);

    // Send response
    return res.status(200).json({
      product: products,
      totalPages,
      page,
      perPage,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});



router.get("/get/count", async(req,res)=>{
  const productsCount = await Product.countDocuments();

  if(!productsCount){
    return res.status(500).json({success:false});
  }
  return res.send({
    productsCount: productsCount
  })
})



// get product by id
router.get("/:id", async (req, res) => {
  try {
    productEditId = req.params.id;
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("subCat");

    if (!product) {
      return res
        .status(404)
        .json({ message: "The Product with the given ID is not found." });
    }
    return res.status(200).send(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the product." });
  }
});

// delete the product

router.delete("/:id", async (req, res) => {
  try {
    const deleteImage = req.query.deleteImage;

    if (deleteImage !== undefined) {
      // Find the product and update its images array by removing the specified image
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $pull: { images: deleteImage } }, // Pulls (removes) the image name from the images array
        { new: true } // Returns the updated document
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await cloudinary.uploader.destroy(deleteImage); // Delete image by public ID

      return res
        .status(200)
        .json({ message: "Image removed successfully", product });
    }

    const product = await Product.findById(req.params.id);
    const images = product.images;

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // Delete images from Cloudinary
    const deletePromises = images.map((imageUrl) => {
      // Extract the public ID from the URL
      const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0]; // Get the last part of the URL and remove the extension

      return cloudinary.uploader.destroy(publicId); // Pass the public ID to Cloudinary
    });

    // Wait for all delete operations to complete
    await Promise.all(deletePromises);

    const isProduct = await Product.findByIdAndDelete(req.params.id);

    if (!isProduct) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    console.error("Error in deleting the product:", err);
    res.status(500).json({
      error: "An error occurred while deleting the product.",
    });
  }
});

// Update By ID
router.put("/:id", async (req, res) => {
  try {
    // Upload images with limit

    // Find and update the category
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        subCat: req.body.subCat,
        description: req.body.description,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        subCatId: req.body.subCatId,
        catName: req.body.catName,
        images: req.body.images,
        discountPrice: req.body.discountPrice,
        discount: req.body.discount,
        productRAM: req.body.productRAM,
        productSIZE: req.body.productSIZE,
        productWEIGHT: req.body.productWEIGHT,
        stock: req.body.stock,
        dateCreated: req.body.dateCreated,
      },
      { new: true }
    );

    if (!product) {
      return res.status(500).json({
        message: "Product Not found in data!",
        success: false,
      });
    }

    res.status(200).json({
      message: "product is updated !",

      status: true,
    }); // Send the updated category
  } catch (error) {
    console.error("Error updating prosuct:", error);
    res.status(500).json({
      error: "An error occurred while updating the product",
      success: false,
    });
  }
});

// Related Products

router.get("/recentlyProducts/get", async (req, res) => {
  try {
    console.log("Fetching products...");

    const productList1 = await RecentlyProducts.find()
      .populate("category")
      .populate("subCat");
    if (!productList1) {
      console.log("Nodata");
    }

    console.log("Products fetched successfully:", productList1);

    return res.status(200).json({
      product: productList1,
    });
  } catch (error) {
    console.error("Error fetching products:", error); // Log full error object
    return res.status(500).json({
      success: false,
      message: "An error occurred while",
      error: error.message,
    });
  }
});

router.post("/recentlyProducts", async (req, res) => {
  let findProduct = await RecentlyProducts.find({ prodId: req.body.id });

  if (findProduct && findProduct.length > 0) {
    return res.status(200).send("ok Already viewed");
  }

  let product = new RecentlyProducts({
    name: req.body.name,
    prodId:req.body.id,
    subCat: req.body.subCat,
    description: req.body.description,
    brand: req.body.brand,
    price: parseFloat(req.body.price), // Ensure price is a number
    category: req.body.category,
    countInStock: parseInt(req.body.countInStock, 10), // Ensure countInStock is an integer
    rating: parseFloat(req.body.rating), // Ensure rating is a number
    numReviews: parseInt(req.body.numReviews, 10), // Ensure numReviews is an integer
    isFeatured: req.body.isFeatured === "true", // Convert string to boolean
    images: req.body.images, // Use the images array from the uploaded files
    discountPrice: parseInt(req.body.discountPrice, 10),
    subCatId: req.body.subCatId,
    catName: req.body.catName,
    discount: req.body.discount,
    productRAM: req.body.productRAM,
    productSIZE: req.body.productSIZE,
    productWEIGHT: req.body.productWEIGHT,
    stock: req.body.stock,
    dateCreated: Date.now(), // You can set this directly if you want
  });

  try {
    product = await product.save();
    if (!product) {
      return res.status(500).json({
        success: false,
        error: "Failed to create product",
      });
    }
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred while saving the product",
    });
  }
});

module.exports = router;
