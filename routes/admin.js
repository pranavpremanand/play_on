var express = require("express");
const { admin, category } = require("../config/collections");
var router = express.Router();
const adminHelper = require("../helpers/admin-helper");
const categories = require("../models/category-model");
const users = require("../models/user-model");
const product = require("../models/product-model");
const orders = require("../models/order-model");
require("../config/server");
const productHelper = require("../helpers/product-helper");
const adminAuthentication = require("../middlewares/admin");
const bannerHelper = require("../helpers/banner-helper");
const bannerModel = require("../models/banner-model");
const { populate } = require("../models/user-model");
const fs = require("fs");

/* GET ADMIN LOGIN. */
router.get("/", async function (req, res, next) {
  if (req.session.admin) {
    res.render("admin/dashboard", { categoryList: req.session.categoryList });
  } else if (req.session.loginError) {
    res.render("admin/login", { loginError: true });
  } else {
    res.render("admin/login");
  }
});

// GET ADMIN HOME
router.post("/home", (req, res, next) => {
  adminHelper
    .doAdminLogin(req.body)
    .then((response) => {
      if (response.admin) {
        req.session.admin = true;
        categories
          .find()
          .lean()
          .exec((err, data) => {
            req.session.categoryList = data;
            res.redirect("/admin");
          });
      } else {
        req.session.admin = false;
        req.session.loginError = true;
        res.redirect("/admin");
      }
    })
    .catch((err) => {
      next(err);
    });
});

// GET USERS MANAGEMENT PAGE
router.get("/users", (req, res) => {
  if (req.session.admin) {
    users
      .find()
      .lean()
      .exec((error, data) => {
        const users = data;
        res.render("admin/users", {
          users,
          categoryList: req.session.categoryList,
        });
      });
  } else {
    res.redirect("/admin");
  }
});

// BLOCK USER
router.get("/block/:ID", async (req, res, next) => {
  let id = req.params.ID;
  await adminHelper
    .blockUser(id)
    .then(() => {
      res.redirect("/admin/users");
    })
    .catch((err) => {
      next(err);
    });
});

// UNBLOCK USER
router.get("/unblock/:ID", async (req, res, next) => {
  let id = req.params.ID;
  await adminHelper
    .unblockUser(id)
    .then(() => {
      res.redirect("/admin/users");
    })
    .catch((err) => {
      next(err);
    });
});

// GET ADD CATEGORY PAGE
router.get("/addcategory", (req, res) => {
  if (req.session.admin) {
    if (req.session.categoryAdded) {
      res.render("admin/addcategory", {
        added: true,
        categoryList: req.session.categoryList,
      });
      req.session.categoryAdded = false;
    } else if (req.session.addingCategoryFailed) {
      res.render("admin/addcategory", {
        failed: true,
        categoryList: req.session.categoryList,
      });
      req.session.addingCategoryFailed = false;
    } else {
      res.render("admin/addcategory", {
        categoryList: req.session.categoryList,
      });
    }
  } else {
    res.redirect("/admin");
  }
});

// ADD CATEGORY TO DATABASE
router.post("/categoryAdded", (req, res,next) => {
  adminHelper
    .addCategory(req.body)
    .then((response) => {
      if (response.status) {
        req.session.categoryList = response.categories
        req.session.categoryAdded = true;
        req.session.addingCategoryFailed = false;
        res.redirect("/admin/addcategory");
      } else {
        req.session.categoryAdded = false;
        req.session.addingCategoryFailed = true;
        res.redirect("/admin/addcategory");
      }
    })
    .catch((err) => {
      console.log(err)
      next(err);
    });
});

// GET CATEGORY LIST PAGE
router.get("/categorylist",async (req, res) => {
  if (req.session.admin) {
    const categoryList = await categories.find().lean()
    if (req.session.editedCategory) {
      res.render("admin/categorylist", {
        success: true,
        categoryList
      });
      req.session.editedCategory = false;
    } else if (req.session.deletedCategory) {
      res.render("admin/categorylist", {
        deleted: true,
        categoryList
      });
      req.session.deletedCategory = false;
    } else {
      res.render("admin/categorylist", {
        categoryList
      });
    }
  } else {
    res.redirect("/admin");
  }
});

// GET EDIT CATEGORY NAME PAGE
router.get("/edit-category/:id", async (req, res) => {
  const ID = req.params.id;
  if (req.session.admin) {
    const value = await adminHelper.editCategory(ID);
    const data = {
      _id: value._id,
      name: value.name,
    };
    res.render("admin/editcategory", {
      data,
      categoryList: req.session.categoryList,
    });
  } else {
    res.redirect("/admin");
  }
});

// UPDATE CATEGORY DATA
router.post("/categoryEdited/:id", (req, res, next) => {
  const ID = req.params.id;
  adminHelper
    .updateCategory(ID, req.body)
    .then((result) => {
      req.session.editedCategory = true;
      res.redirect("/admin/categorylist");
    })
    .catch((err) => {
      next(err);
    });
});

// DELETE A CATEGORY
router.get("/delete-category/:id", (req, res, next) => {
  const ID = req.params.id;
  adminHelper
    .deleteCategory(ID)
    .then((response) => {
      req.session.deletedCategory = true;
      res.redirect("/admin");
    })
    .catch((err) => {
      next(err);
    });
});

// GET ADD PRODUCT PAGE
router.get("/addproduct", (req, res) => {
  if (req.session.admin) {
    res.render("admin/addproduct", { categoryList: req.session.categoryList });
  } else {
    res.redirect("/admin");
  }
});

//ADD PRODUCT TO DATABASE
router.post(
  "/productAdded",
  productHelper.uploadProductsImgs,
  async (req, res ,next) => {
    const imgs = req.files;
    let images = imgs.map((value) => value.filename);
    req.body.images = images;
    productHelper.addProduct(req.body).then((result) => {
      res.redirect("/admin/addproduct");
    }).catch((err)=>{
      next(err)
    })
  }
);

// GET VIEW PRODUCTS PAGE
router.get("/viewproducts/:id", (req, res) => {
  if (req.session.admin) {
    const ID = req.params.id;
    product
      .find({ category: ID })
      .lean()
      .exec((err, data) => {
        const products = data;
        res.render("admin/viewproducts", {
          products,
          categoryList: req.session.categoryList,
        });
      });
  } else {
    res.redirect("/admin");
  }
});

// GET ALL PRODUCTS PAGE
router.get("/viewallproducts", (req, res) => {
  if (req.session.admin) {
    product
      .find()
      .lean()
      .exec((err, data) => {
        const products = data;
        res.render("admin/viewproducts", {
          products,
          categoryList: req.session.categoryList,
        });
      });
  } else {
    res.redirect("/admin");
  }
});

//EDIT PRODUCTS
router.get("/editProduct/:id", async (req, res) => {
  if (req.session.admin) {
    const ID = req.params.id;
    const productData = await productHelper.editProduct(ID);
    const data = {
      _id: productData._id,
      name: productData.name,
      brand: productData.brand,
      details: productData.details,
      description: productData.description,
      category: productData.category,
      quantity: productData.quantity,
      actualPrice: productData.actualPrice,
      sellingPrice: productData.sellingPrice,
      images: productData.images,
    };
    res.render("admin/editproduct", {
      data,
      categoryList: req.session.categoryList,
    });
  } else {
    res.redirect("/admin");
  }
});

// UPDATE PRODUCT TO DATABASE
router.post(
  "/productEdited",
  productHelper.uploadProductsImgs,
  (req, res, next) => {
    const imgs = req.files;
    const images = imgs.map((value) => value.filename);
    req.body.images = images;
    productHelper
      .updateProduct(req.body)
      .then((result) => {
        res.render("admin/editproduct", {
          categoryList: req.session.categoryList,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

// DELETE PRODUCT
router.get("/deleteProduct/:id", (req, res, next) => {
  if (req.session.admin) {
    const ID = req.params.id;
    productHelper
      .deleteProduct(ID)
      .then((response) => {
        req.session.productDeleted = true
        res.redirect("/admin/viewallproducts");
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/");
  }
});

// GET EDIT BANNER
router.get("/edit-banner", async (req, res) => {
  if (req.session.admin) {
    const bannerData = await bannerModel.findOne().lean()
    res.render("admin/editbanner", { bannerData, categoryList: req.session.categoryList });
  } else {
    res.redirect("/");
  }
});

// ADMIN LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

//GET COUPON MANAGEMENT PAGE
router.get("/coupons", (req, res, next) => {
  if (req.session.admin) {
    adminHelper
      .getCoupons()
      .then((coupons) => {
        res.render("admin/coupons", {
          coupons,
          categoryList: req.session.categoryList,
        });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/admin");
  }
});

//GET ADD COUPON PAGE
router.get("/add-coupon", (req, res) => {
  if (req.session.admin) {
    res.render("admin/addcoupon", { categoryList: req.session.categoryList });
  } else {
    res.redirect("/admin");
  }
});

//ADD COUPON
router.post("/added-coupon", (req, res, next) => {
  if (req.session.admin) {
    console.log(req.body)
    adminHelper
      .addCoupon(req.body)
      .then((status) => {
        res.json(status);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/admin");
  }
});

//EDIT COUPON
router.get(
  "/edit-coupon/:id",
  adminAuthentication.adminLog,
  (req, res, next) => {
    adminHelper
      .editCoupon(req.params.id)
      .then((coupon) => {
        res.render("admin/editcoupon", {
          coupon,
          categoryList: req.session.categoryList,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

//UPDATE COUPON
router.post("/update-coupon/:id", (req, res, next) => {
  adminHelper
    .updateCoupon(req.params.id, req.body)
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      next(err);
    });
});

//DELETE COUPON
router.get("/delete-coupon/:id", (req, res, next) => {
  if (req.session.admin) {
    adminHelper
      .deleteCoupon(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/admin");
  }
});

//ORDER MANAGEMENT
router.get("/order-management", async (req, res) => {
  if (req.session.admin) {
    const ordersList = await orders
      .find()
      .sort({ createdAt: -1 })
      .populate("userID")
      .populate("products.productID")
      .lean();
    res.render("admin/ordermanagement", {
      ordersList,
      categoryList: req.session.categoryList,
    });
  } else {
    res.redirect("/admin");
  }
});

//CANCEL ORDER
router.get(
  "/cancel-order/:id",
  adminAuthentication.adminLog,
  (req, res, next) => {
    console.log(req.params.id);
    adminHelper
      .cancelOrder(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//PACK ORDERS
router.get(
  "/pack-order/:id",
  adminAuthentication.adminLog,
  (req, res, next) => {
    adminHelper
      .packOrder(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//SHIP ORDERS
router.get(
  "/ship-order/:id",
  adminAuthentication.adminLog,
  (req, res, next) => {
    adminHelper
      .shipOrder(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//SHIP ORDERS
router.get(
  "/deliver-order/:orderId/:userId",
  adminAuthentication.adminLog,
  (req, res, next) => {
    adminHelper
      .deliverOrder(req.params.orderId, req.params.userId)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//VIEW ORDER DETAILS
router.get(
  "/orderdetails/:id",
  adminAuthentication.adminLog,
  (req, res, next) => {
    adminHelper
      .orderDetails(req.params.id)
      .then((orderData) => {
        res.render("admin/vieworderdetails", {
          orderData,
          categoryList: req.session.categoryList,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

// SALES REPORT
router.get("/sales-report", adminAuthentication.adminLog, (req, res, next) => {
  adminHelper
    .salesReport()
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      next(err);
    });
});

// UPLOAD BANNER
router.post(
  "/upload-banner",
  adminAuthentication.adminLog,
  bannerHelper.uploadBanner,
  (req, res, next) => {
    const bannerImg = req.file;
    const banner = bannerImg.filename;
    req.body.banner = banner;
    bannerHelper
      .addBanner(req.body)
      .then(() => {
        res.redirect("/admin/edit-banner");
      })
      .catch((err) => {
        next(err);
      });
  }
);
module.exports = router;