var express = require("express");
var router = express.Router();
const userHelper = require("../helpers/user-helper");
const productHelper = require("../helpers/product-helper");
const products = require("../models/product-model");
const {
  PhoneNumberContext,
} = require("twilio/lib/rest/lookups/v1/phoneNumber");
const adminHelper = require("../helpers/admin-helper");
const product = require("../models/product-model");
const { categories } = require("../config/collections");

const category = require("../models/category-model");
const user = require("../models/user-model");
const cartHelper = require("../helpers/cart-helper");
const wishlistHelper = require("../helpers/wishlist-helper");
const userAuthentication = require("../middlewares/users");
const bannerModel = require("../models/banner-model");
const { findOne } = require("../models/user-model");
const serviceID = process.env.SERVICEID
const accountSid = process.env.ACCOUNTSID
const authToken = process.env.AUTHTOKEN
const client = require("twilio")(accountSid, authToken);
/* GET home page. */
router.get("/",userAuthentication.checkStatus, function (req, res, next) {
  product
    .find()
    .lean()
    .exec(async (err, data) => {
      var bannerData = await bannerModel.findOne().lean();
      const products = data;
      if (req.session.userIn) {
        res.render("user/home", {
          bannerData,
          products,
          user: true,
          login: true,
        });
      } else {
        res.render("user/home", {
          bannerData,
          products,
          user: true,
          login: false,
        });
      }
    });
});

// TO LOGIN PAGE
router.get("/toLogin",userAuthentication.checkStatus, (req, res) => {
  if (req.session.userIn) {
    res.redirect("/");
  } else if (req.session.blocked) {
    res.render("user/login", { blocked: req.session.blocked });
  } else if (req.session.noUser) {
    res.render("user/login", { noUser: req.session.noUser });
    req.session.noUser = false;
  } else {
    res.render("user/login", { loginError: req.session.loginError });
    req.session.loginError = false;
  }
});

// WHEN LOGIN
router.post("/userLoggedin",(req, res, next) => {
  userHelper
    .doLogin(req.body)
    .then((result) => {
      if (result.verified) {
        if (result.correctPassword) {
          if (result.isActive) {
            req.session.userData = result.user;
            req.session.userIn = true;
            res.redirect("/");
          } else {
            req.session.blocked = true;
            res.redirect("/toLogin");
          }
        } else {
          req.session.loginError = true;
          res.redirect("/toLogin");
        }
      } else if (result.noUser) {
        req.session.noUser = true;
        res.redirect("/toLogin");
      } else {
        userHelper
          .sendOTP(req.body)
          .then((response) => {
            req.session.mobile = response.phone;
            res.redirect("/verifyotp");
          })
      }
    })
    .catch((err) => {
      next(err);
    });
});

// TO SIGNUP PAGE
router.get("/toSignup",userAuthentication.checkStatus, (req, res) => {
  if (req.session.userIn) {
    res.redirect("/");
  } else if (req.session.userExist) {
    const userExist = req.session.userExist;
    res.render("user/signup", { userExist, existingUser: true });
  } else {
    res.render("user/signup");
  }
});

// WHEN USER SIGNED UP
router.post("/userSignedup", (req, res, next) => {
  if (req.body.password == req.body.reEnteredPassword) {
    userHelper
      .addUser(req.body)
      .then((response) => {
        req.session.mobile = response.phone;
        req.session.email = response.email;
        if (response.status) {
          req.session.userExist = "User already exists.";
          res.redirect("/toSignup");
        } else {
          req.session.otp = response.correctOtp;
          res.redirect("/verifyotp");
        }
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.render("user/signup", { incorrectPassword: true });
  }
});

//WHEN USER TRYING TO GET OTP VERIFICATION PAGE
router.get("/verifyotp",userAuthentication.checkStatus, (req, res) => {
  const mobile = req.session.mobile;
  if (req.session.userIn) {
    res.redirect("/");
  } else {
    res.render("user/verifyUser", { mobile });
  }
});

//VERIFY USER
router.post("/verifyUser", async (req, res, next) => {
  const mobile = req.session.mobile;
  const otp = req.body.enteredOtp;
  console.log(mobile);
  console.log(otp);
  userHelper
    .verifyUser(mobile, otp)
    .then((response) => {
      if (response.status) {
        req.session.userIn = true;
        req.session.userData = response.user;
        req.session.verified = response.status;
        res.redirect("/");
      } else if (response.failed) {
        otpError = true;
        const mobile = req.session.mobile;
        res.render("user/verifyUser", { mobile, otpError });
      } else {
        otpError = true;
        const mobile = req.session.mobile;
        res.render("user/verifyUser", { mobile, otpError });
      }
    })
    .catch((err) => {
      next(err);
    });
});

//RESEND OTP
router.get("/resendOTP", (req, res, next) => {
  client.verify.v2
    .services(serviceID)
    .verifications.create({ to: `+91${req.session.mobile}`, channel: "sms" })
    .then((verification) => console.log(verification.status));
  res.redirect("/verifyotp");
});

//USER LOGOUT
router.get("/logout", (req, res) => {
  req.session.userIn = false;
  req.session.destroy();
  res.redirect("/");
});

//GET BOOTS PAGE
router.get("/boots",userAuthentication.checkStatus, (req, res, next) => {
  product
    .find({ category: "6336900799995afa53f7304e"})
    .lean()
    .exec((err, data) => {
      const products = data;
      const category = "Boots";
      if (req.session.userIn) {
        res.render("user/viewproducts", {
          products,
          category,
          user: true,
          login: true,
        });
      } else {
        res.render("user/viewproducts", {
          products,
          category,
          user: true,
          login: false,
        });
      }
    });
});

//GET CLUB JERSEYS PAGE
router.get("/clubjerseys",userAuthentication.checkStatus, (req, res) => {
  product
    .find({ category: "63368ff699995afa53f73046" })
    .lean()
    .exec((err, data) => {
      const products = data;
      const category = "Club Jerseys";
      if (req.session.userIn) {
        res.render("user/viewproducts", {
          products,
          category,
          user: true,
          login: true,
        });
      } else {
        res.render("user/viewproducts", {
          products,
          category,
          user: true,
          login: false,
        });
      }
    });
});

//GET INTERNATIONAL JERSEYS PAGE
router.get("/internationaljerseys",userAuthentication.checkStatus, (req, res) => {
  product
    .find({ category: "6336900199995afa53f7304a" })
    .lean()
    .exec((err, data) => {
      const products = data;
      const category = "National Jerseys";
      if (req.session.userIn) {
        res.render("user/viewproducts", {
          products,
          category,
          user: true,
          login: true,
        });
      } else {
        res.render("user/viewproducts", {
          products,
          category,
          user: true,
          login: false,
        });
      }
    });
});

//GET SINGLE PRODUCT PAGE
router.get("/singleProduct/:id",userAuthentication.checkStatus, (req, res, next) => {
  const ID = req.params.id;
  product
    .findOne({ _id: ID })
    .lean()
    .then((data) => {
      const Product = data;
      if (req.session.userIn) {
        res.render("user/singleproduct", { Product, user: true, login: true });
      } else {
        res.render("user/singleproduct", { Product, user: true, login: false });
      }
    })
    .catch((err) => {
      next(err);
    });
});

//GET CONTACT PAGE
// router.get("/contact", (req, res) => {
//   if (req.session.userIn) {
//     res.render("user/contact", { user: true, login: true });
//   } else {
//     res.render("user/contact", { user: true, login: false });
//   }
// });

//GET CART PAGE
router.get("/toCart",userAuthentication.checkStatus, async (req, res, next) => {
  if (req.session.userIn) {
    const data = await user
      .findOne({ _id: req.session.userData._id })
      .populate("cart.productID")
      .populate("cart.productID.category")
      .lean();
    data.cart.map(async (val) => {
      if (val.productID.quantity == 0) {
        await user.findByIdAndUpdate(
          { _id: req.session.userData._id },
          { $pull: { cart: { productID: val.productID } } }
        );
      }
    });
    const ID = req.session.userData._id;
    cartHelper
      .cartItemsCost(ID)
      .then((cost) => {
        let items = data.cart;
        res.render("user/cart", { user: true, login: true, items, ID, cost });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//ADD PRODUCT TO CART
router.get("/addToCart/:id",userAuthentication.checkStatus, (req, res, next) => {
  if (req.session.userData._id) {
    const ID = req.params.id;
    cartHelper
      .addToCart(ID, req.session.userData._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
});

//REMOVE FROM CART
router.get("/removeFromCart/:id",userAuthentication.checkStatus, (req, res, next) => {
  cartHelper
    .removeCartItem(req.params.id, req.session.userData._id)
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      next(err);
    });
});

//COUNT OF CART ITEMS
router.get("/count", async (req, res, next) => {
  let count;
  if (req.session.userIn) {
    await cartHelper
      .cartItemsCount(req.session.userData._id)
      .then((response) => {
        count = response;
        res.json(count);
      })
      .catch((err) => {
        next(err);
      });
  }
});

//CHANGE CART PRODUCT QUANTITY
router.post("/changeQuantity", (req, res, next) => {
  if (req.session.userIn) {
    console.log(req.body);
    cartHelper
      .changeQuantity(req.body)
      .then((response) => {
        console.log("worked");
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//GET COST OF CART ITEMS
router.get("/costOfCartItems", (req, res, next) => {
  let result;
  if (req.session.userIn) {
    cartHelper
      .cartItemsCost(req.session.userData._id)
      .then((response) => {
        result = response;
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    result = response;
    res.json(result);
  }
});

//GET WISHLIST PAGE
router.get("/toWishlist",userAuthentication.checkStatus, async (req, res) => {
  if (req.session.userIn) {
    const ID = req.session.userData._id;
    const items = await user
      .findOne({ _id: ID })
      .populate("wishlist.productID")
      .lean();
    const wishlistItems = items.wishlist;
    res.render("user/wishlist", { user: true, login: true, wishlistItems });
  } else {
    res.redirect("/toLogin");
  }
});

//ADD ITEM TO WISHLIST
router.get("/addToWishlist/:productId", (req, res, next) => {
  if (req.session.userIn) {
    wishlistHelper
      .addToWishlist(req.params.productId, req.session.userData._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
});

//REMOVE FROM WISHLIST
router.get(
  "/removeFromWishlist/:productID",
  userAuthentication.userAuth,
  (req, res, next) => {
    wishlistHelper
      .removeWishlistItem(req.params.productID, req.session.userData._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//GET USER PROFILE
router.get("/toProfile",userAuthentication.checkStatus, (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .getProfile(req.session.userData._id)
      .then((data) => {
        res.render("user/userprofile", { data, login: true });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//GET MANAGE ADDRESS PAGE
router.get("/manage-addresses",userAuthentication.checkStatus, async (req, res, next) => {
  if (req.session.userIn) {
    await userHelper
      .getAddresses(req.session.userData._id)
      .then((data) => {
        res.render("user/addresses", { data, login: true });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//GET ADD ADDRESS PAGE FROM CHECKOUT
router.get("/add-address",userAuthentication.checkStatus, async (req, res, next) => {
  if (req.session.userIn) {
    await userHelper
      .getAddresses(req.session.userData._id)
      .then((data) => {
        const toCheckout = true;
        res.render("user/addresses", { toCheckout, data, login: true });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//ADD ADDRESS
router.post("/add-address", (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .addAddress(req.body, req.session.userData._id)
      .then((result) => {
        res.redirect("/manage-addresses");
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//ADD ADDRESS AND GET CHECKOUT
router.post("/add-and-get-checkout",userAuthentication.checkStatus, (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .addAddress(req.body, req.session.userData._id)
      .then(() => {
        res.redirect("/checkout");
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//REMOVE ADDRESS
router.get("/delete-address/:addressID", (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .deleteAddress(req.params.addressID, req.session.userData._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/");
  }
});

//GET EDIT PROFILE PAGE
router.get("/edit-profile",userAuthentication.checkStatus, (req, res) => {
  if (req.session.userIn) {
    const User = req.session.userData;
    res.render("user/editprofile", { User, login: true });
  } else {
    res.redirect("/");
  }
});

//UPDATE USER PROFILE
router.post("/update-profile", (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .updateUser(req.body, req.session.userData._id)
      .then((response) => {
        req.session.userData.name = req.body.name;
        req.session.userData.email = req.body.email;
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//EDIT ADDRESS
router.get("/edit-address/:id",userAuthentication.checkStatus, (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .editAddress(req.params.id, req.session.userData._id)
      .then((data) => {
        res.render("user/editaddress", { data, login: true });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//UPDATE ADDRESS
router.post("/edited-address/:id", (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .updateAddress(req.body, req.params.id, req.session.userData._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//UPDATE NEW PASSWORD
router.post("/update-password", (req, res, next) => {
  if (req.session.userIn) {
    userHelper
      .updatePassword(req.body)
      .then((result) => {
        res.json({ result });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin ");
  }
});

//CHECKOUT
router.get("/checkout",userAuthentication.checkStatus, async (req, res, next) => {
  if (req.session.userIn) {
    totalCost = await cartHelper.cartItemsCost(req.session.userData._id);
    userHelper
      .getAddresses(req.session.userData._id)
      .then(async (data) => {
        const USER = await user
          .findOne({ _id: req.session.userData._id })
          .populate("coupons.coupon")
          .lean();
        const coupons = USER.coupons;
        if (USER.cart[0]) {
          res.render("user/checkout", {
            coupons,
            totalCost,
            data,
            login: true,
            user: true,
          });
        } else {
          res.redirect("/toCart");
        }
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/toLogin");
  }
});

//APPLY COUPON
router.post("/apply-coupon", (req, res, next) => {
  userHelper
    .applyCoupon(req.body.coupon, req.body.amount, req.session.userData._id)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
});

//PLACE ORDER
router.post("/place-order",userAuthentication.checkStatus, async (req, res, next) => {
  if (req.session.userIn) {
    const USER = await user.findOne({ _id: req.session.userData._id }).lean();
    const cart = USER.cart;
    console.log("address",req.body.address)
    if (req.body.paymentMethod == "Cash on Delivery") {
      userHelper
        .placeOrder(req.body, req.session.userData._id, cart)
        .then(async () => {
          await user.findByIdAndUpdate(
            { _id: req.session.userData._id },
            { $pull: { cart: {}, multi: true } }
          );
          const response = {
            CODstatus: true,
            id:
              "64s32gh74dfg87gh2dg34" +
              req.session.userData._id +
              "793fg47kjh345",
          };
          res.json(response);
        })
        .catch((err) => {
          next(err);
        });
    } else if (req.body.paymentMethod == "Razorpay") {
      userHelper
        .placeOrder(req.body, req.session.userData._id, cart)
        .then((orderID) => {
          userHelper
            .generateRazorpay(orderID, req.body.finalCost)
            .then(async (response) => {
              console.log("razrpay");
              console.log(response)
              req.session.orderID = response.receipt
              console.log("req.session.orderID",req.session.orderID)
              res.json(response);
            })
        })
        .catch((err) => {
          console.log("error", err);
          next(err);
        });
    } else {
      res.render("error");
    }
  }
});

//VERIFY PAYMENT
router.post("/verify-payment", (req, res, next) => {
  console.log('verify payment')
  console.log('req.body',req.body)
  userHelper.verifyPayment(req.body).then((response) => {
      console.log(response)
      userHelper
        .changePaymentStatus(req.body["order[receipt]"])
        .then(async () => {
          await user.findByIdAndUpdate(
            { _id: req.session.userData._id },
            { $pull: { cart: {}, multi: true } }
          );
          res.json({ status: true });
        })
        .catch((err) => {
          const data = {}
          data.status = false
          data.orderID = req.session.orderID
          res.json(data);
        });
    })
    .catch((err) => {
      const data = {}
      data.status = false
      data.orderID = req.session.orderID
      res.json(data);
    });
});

//SUCCESS PAGE
router.get("/ordersuccess/:id",userAuthentication.userAuth,userAuthentication.checkStatus, (req, res) => {
  res.render("user/ordersuccess", { user: true, login: true });
});

//FAILED PAGE
router.get(
  "/paymentfailed/:id",
  userAuthentication.userAuth,
  (req, res, next) => {
    console.log('payment failed')
    userHelper
      .cancelOrder(req.session.orderID)
      .then((response) => {
        res.render("user/paymentfailed", { user: true, login: true });
      })
      .catch((err) => {
        next(err);
      });
  }
);

//VIEW ORDERS
router.get("/view-orders", userAuthentication.userAuth,userAuthentication.checkStatus, (req, res, next) => {
  userHelper
    .getOrders(req.session.userData._id)
    .then((orders) => {
      res.render("user/vieworders", { orders, user: true, login: true });
    })
    .catch((err) => {
      next(err);
    });
});

// VIEW ORDER DETAILS
router.get(
  "/view-order-details/:orderid/:address",
  userAuthentication.userAuth,userAuthentication.checkStatus,
  (req, res, next) => {
    const orderID = req.params.orderid;
    const addressID = req.params.address;
    userHelper
      .orderInDetail(orderID, addressID, req.session.userData._id)
      .then((response) => {
        const orderData = response.orderData;
        const address = response.address;
        console.log(address);
        res.render("user/orderdetails", {
          orderData,
          address,
          user: true,
          login: true,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

//CANCEL ORDEr
router.get("/cancel-order/:id", userAuthentication.userAuth,(req, res, next) => {
  userHelper
    .cancelOrder(req.params.id, req.session.userData._id)
    .then((response) => {
      res.json(response);
    })
});
module.exports = router;