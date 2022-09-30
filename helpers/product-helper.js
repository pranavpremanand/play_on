const multer = require("multer");
const { response } = require("../app");
const { $where } = require("../models/admin-model");
const category = require("../models/category-model");
const product = require("../models/product-model");
const fs = require("fs");

// const upload =   multer({dest: 'public/images/products'})

//CONFIGURATION OF MULTER
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/products");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `products-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

//MULTER FILTER
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "jpg" || "jpeg" || "png" || "webp") {
    cb(null, true);
  } else {
    cb(new Error("Not a JPG File!"), false);
  }
};

//CALLING THE MULTER FUNCTION
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadProductsImgs = upload.array("images", 3);

//ADDING PRODUCT
exports.addProduct = (productData) => {
  return new Promise((resolve, reject) => {
    try {
      const newProduct = new product(productData);
      newProduct.save().then((data) => {
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
};

//GET ALL PRODUCTS TO VIEW PRODUCTS PAGE
exports.getAllProducts = () => {
  return new Promise((resolve, reject) => {
    try {
      product
        .find()
        .lean()
        .exec((err, data) => {
          const products = data;
          resolve(products);
        });
    } catch (err) {
      reject(err);
    }
  });
};

//GET PRODUCT DETAILS
exports.editProduct = (ID) => {
  return new Promise(async (res, rej) => {
    try {
      const productData = await product.findById({ _id: ID });
      res(productData);
    } catch (err) {
      reject(err);
    }
  });
};

//UPDATE PRODUCT DATA
exports.updateProduct = (data) => {
  return new Promise(async (res, rej) => {
    try {
      let deletingProd = await product.findById(data.id);
      var files = deletingProd.images;
      let images = files.map((val) => {
        val = `public/images/products/${val}`;
        return val;
      });
      images.forEach((path) => fs.existsSync(path) && fs.unlinkSync(path));

      await product.updateOne(
        { _id: data.id },
        {
          $set: {
            name: data.name,
            brand: data.brand,
            description: data.description,
            category: data.category,
            quantity: data.quantity,
            actualPrice: data.actualPrice,
            sellingPrice: data.sellingPrice,
            images: data.images,
          },
        }
      );
      res(true);
    } catch (error) {
      reject(error);
    }
  });
};

//DELETE PRODUCT
exports.deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let DeletingProd = await product.findById(id);
      var files = DeletingProd.images;
      let images = files.map((val) => {
        val = `public/images/products/${val}`;
        return val;
      });
      images.forEach((path) => fs.existsSync(path) && fs.unlinkSync(path));
      product.deleteOne({ _id: id }).then((response) => {
        resolve(response);
      });
    } catch (err) {
      reject(err);
    }
  });
};
