const admin = require("../models/admin-model");
const users = require("../models/user-model");
const categories = require("../models/category-model");
const coupons = require("../models/coupon-model");
const products = require("../models/product-model");
const bcrypt = require("bcrypt");
const { response } = require("express");
const orders = require("../models/order-model");

require("../config/server");
const fs = require("fs");
const { findByIdAndUpdate } = require("../models/user-model");
const { isError } = require("util");

module.exports = {
  // ADMIN LOGIN
  doAdminLogin: (data) => {
    return new Promise(async (res, rej) => {
      try {
        const response = {};
        const adminData = await admin.findOne({ email: data.email });
        if (adminData) {
          bcrypt.compare(data.password, adminData.password).then((data) => {
            if (data) {
              response.admin = true;
              response.adminData = adminData;
              res(response);
            } else {
              response.admin = false;
              res(response);
            }
          });
        } else {
          response.admin = false;
          res(response);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  // BLOCK USER
  blockUser: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await users.findOne({ _id: userID });
        if (user.isActive) {
          await users.updateOne({ _id: user._id }, { isActive: false });
          resolve();
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  // UNBLOCK USER
  unblockUser: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await users.findOne({ _id: userID });
        if (user.isActive) {
          resolve(user.isActive);
        } else {
          await users.updateOne({ _id: user._id }, { isActive: true });
          resolve(user.isActive);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  // ADD CATEGORY
  addCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      try {
        const categoryExist = await categories.findOne({ name: category.name });
        const categoryList = await categories.find();
        if (categoryExist) {
          const response = false;
          resolve(response);
        } else {
          const newCategory = new categories(category);
          newCategory.save().then((response) => {
            const Response = {}
            Response.categories = categoryList
            Response.status = true
            resolve(Response);
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  // GET CATEGORY DATA TO EDIT CATEGORY PAGE
  editCategory: (ID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const categoryData = await categories.findById({ _id: ID });
        resolve(categoryData);
      } catch (err) {
        reject(err);
      }
    });
  },

  //UPDATE EDITED CATEGORY DATA TO DATABASE
  updateCategory: (ID, editedData) => {
    return new Promise((res, rej) => {
      try {
        categories
          .updateOne(
            { _id: ID },
            {
              $set: {
                name: editedData.name,
              },
            }
          )
          .then((response) => {
            res(response);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  },

  //DELETE CATEGORY
  deleteCategory: (ID) => {
    return new Promise((resolve, reject) => {
      try {
        categories
          .deleteOne({ _id: ID })
          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  },

  //ADD COUPON
  addCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(data)
        const couponExist = await coupons.findOne({ name: data.name });
        if (couponExist) {
          const response = false;
          resolve(response);
        } else {
          data.name = data.name.toUpperCase();
          data.code = data.code.toUpperCase();
          const newCoupon = new coupons(data);
          newCoupon.save().then(() => {
            resolve(true);
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  //EDIT COUPON
  editCoupon: (couponID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const coupon = await coupons.findOne({ _id: couponID }).lean();
        resolve(coupon);
      } catch (error) {
        reject(error);
      }
    });
  },

  //UPDATE COUPON
  updateCoupon: (ID, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.name = data.name.toUpperCase();
        data.code = data.code.toUpperCase();
        await coupons.findByIdAndUpdate(
          { _id: ID },
          {
            $set: {
              name: data.name,
              discount: data.discount,
              code: data.code,
            },
          }
        );
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  //DELETE COUPON
  deleteCoupon: (ID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await coupons.deleteOne({ _id: ID });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  //GET ALL COUPONS DATA
  getCoupons: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const Coupons = await coupons.find().lean();
        resolve(Coupons);
      } catch (err) {
        reject(err);
      }
    });
  },

  //CANCEL ORDER
  cancelOrder: (orderID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders.findByIdAndDelete(orderID);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  //PACK ORDERS
  packOrder: (orderID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders.updateOne(
          { _id: orderID },
          { $set: { orderStatus: "Packed" } }
        );
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  //PACK ORDERS
  shipOrder: (orderID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders.updateOne(
          { _id: orderID },
          { $set: { orderStatus: "Shipped" } }
        );
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  //PACK ORDERS
  deliverOrder: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders.updateOne(
          { _id: orderId },
          { $set: { orderStatus: "Delivered", paymentStatus: "Confirmed" } }
        );
        const couponCount = await coupons.countDocuments();
        function random() {
          const num = Math.floor(Math.random() * couponCount);
          return num;
        }
        const randomDoc = random(couponCount);

        coupons
          .findOne()
          .skip(randomDoc)
          .exec(async (err, result) => {
            if(result){
              await users.updateOne(
                { _id: userId },
                { $push: { coupons: { coupon: result._id } } }
            );
            }
          });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  //ORDER DETAILS
  orderDetails: (orderID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await orders
          .findById(orderID)
          .populate("products.productID")
          .lean();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  },

  //SALES REPORT
  salesReport: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const noOfUsers = await users.countDocuments();
        const noOfProducts = await products.countDocuments();
        const noOfOrders = await orders.find({orderStatus:'Delivered'}).countDocuments()
        let totalProfit = 0;
        const ordersData = await orders.find({paymentStatus:"Confirmed"});
        for (let i = 0; i < noOfOrders; i++) {
          ordersData.map((val) => {
            totalProfit = val.finalCost + totalProfit;
          });
        }
        totalProfit = totalProfit.toString().slice(0,11)
        let dateList = [];
        for (let i = 0; i < 10; i++) {
          let d = new Date();
          d.setDate(d.getDate() - i);
          let newDate = d.toUTCString();
          newDate = newDate.slice(5, 16);
          dateList[i] = newDate;
        }
        let dateSales = [];
        for (let i = 0; i < 10; i++) {
          dateSales[i] = await orders
            .find({ date: dateList[i] })
            .lean()
            .count();
        }
        const response = {
          dateSales: dateSales,
          dateList: dateList,
          noOfUsers: noOfUsers,
          noOfProducts: noOfProducts,
          noOfOrders: noOfOrders,
          totalProfit: totalProfit,
        };
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },
};
