const bcrypt = require("bcrypt");
const user = require("../models/user-model");
const admin = require("../models/admin-model");
const coupons = require("../models/coupon-model");
const orders = require("../models/order-model");
const { users, products } = require("../config/collections");
const { response } = require("../app");
const productModel = require("../models/product-model");

require("../config/server");

// const accountSid = process.env.ACCOUNTSID
// const authToken = process.env.AUTHTOKEN
const serviceID = process.env.SERVICEID
const client = require("twilio")(process.env.ACCOUNTSID, process.env.AUTHTOKEN);
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.RAZ_KEYID,
  key_secret: process.env.RAZ_SECRET,
});

module.exports = {
  //ADDING USER TO DATABASE
  addUser: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = {};
        const userEmail = await user.findOne({ email: userData.email });
        const userPhone = await user.findOne({
          phoneNumber: userData.phoneNumber,
        });
        if (userEmail) {
          response.status = true;
          resolve(response);
        } else if (userPhone) {
          response.status = true;
          resolve(response);
        } else {
          // <-----SENDING OTP FROM TWILIO----->
          client.verify.v2
            .services(serviceID)
            .verifications.create({
              to: `+91${userData.phoneNumber}`,
              channel: "sms",
            })
            .then((verification) => console.log(verification.status));
          userData.password = await bcrypt.hash(userData.password, 10);
          const newUser = new user(userData);
          newUser
            .save()
            .then(async (data) => {
              response.status = false;
              response.phone = userData.phoneNumber;
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
                  console.log("heyy", result);
                  if(result){
                    await user.updateOne(
                      { phoneNumber: userData.phoneNumber },
                      { $push: { coupons: { coupon: result._id } } }
                    );
                  }
                });
              resolve(response);
            })
            .catch((err) => {
              reject(err);
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //LOGIN
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = {};
        const existingUser = await user
          .findOne({ email: userData.email })
          .lean();
        if (existingUser) {
          if (existingUser.verified) {
            // if (existingUser.isActive) {
              bcrypt
                .compare(userData.password, existingUser.password)
                .then((data) => {
                  if (data) {
                    console.log("CHECKED 1");
                    response.user = existingUser;
                    response.isActive = true;
                    response.verified = true;
                    response.correctPassword = true;
                    resolve(response);
                  } else {
                    console.log("CHECKED 2");
                    response.exist = true;
                    response.verified = true;
                    response.isActive = true;
                    response.correctPassword = false;
                    resolve(response);
                  }
                });
            // } else {
            //   console.log("CHECKED 3");
            //   response.exist = true;
            //   response.verified = true;
            //   response.isActive = false;
            //   resolve(response);
            // }
          } else {
            console.log("CHECKED 3");
            response.exist = true;
            response.verified = false;
            response.isActive = false;
            resolve(response);
          }
        } else {
          console.log("CHECKED 4");
          response.noUser = true;
          response.verified = false;
          response.isActive = false;
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //VERIFY USER
  verifyUser: (mobile, otp) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = {};
        const userData = await user.findOne({ phoneNumber: mobile });
        client.verify.v2
          .services(serviceID)
          .verificationChecks.create({ to: "+91" + mobile, code: otp })
          .then(async (verification_check) => {
            await user.updateOne({ phoneNumber: mobile }, { verified: true });
            response.status = verification_check.valid;
            response.user = userData;
            resolve(response);
          })
          .catch((err) => {
            response.failed = true;
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  //SEND OTP FOR LOGIN
  sendOTP: (loginData) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Sending OTP");
        const responseData = {};
        const userData = await user.findOne({ email: loginData.email });
        client.verify.v2
          .services(serviceID)
          .verifications.create({
            to: `+91${userData.phoneNumber}`,
            channel: "sms",
          })
          .then((verification) => console.log(verification.status));
        responseData.phone = userData.phoneNumber;
        resolve(responseData);
      } catch (error) {
        reject(error);
      }
    });
  },

  //GET USER DATA
  getProfile: (ID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userData = await user.findOne({ _id: ID }).lean();
        resolve(userData);
      } catch (error) {
        reject(error);
      }
    });
  },

  //ADD USER ADDRESS
  addAddress: (data, ID) => {
    return new Promise(async (resolve, reject) => {
      try {
          await user.findByIdAndUpdate(
            { _id: ID },
            { $push: { addresses: data } }
        );
        resolve({ status: true });
      } catch (error) {
        reject(error);
      }
    });
  },

  //GET ADDRESSES
  getAddresses: (ID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userData = await user.findOne({ _id: ID }).lean();
        const addresses = userData.addresses;
        resolve(addresses);
      } catch (error) {
        reject(error);
      }
    });
  },

  //DELETE ADDRESS
  deleteAddress: (address, ID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await user.findByIdAndUpdate(
          { _id: ID },
          { $pull: { addresses: { _id: address } } }
        );
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  //UPDATE USER
  updateUser: (data, ID) => {
    return new Promise(async (resolve, reject) => {
      const response = {};
      try {
        await user.findByIdAndUpdate(
          { _id: ID },
          {
            $set: {
              name: data.name,
              // phoneNumber:data.phoneNumber,
              email: data.email,
            },
          }
        );
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  //GET ADDRESS DETAILS
  editAddress: (addressID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userData = await user.findOne({ _id: userID }).lean();
        let address;
        for (let i = 0; i < userData.addresses.length; i++) {
          if (userData.addresses[i]._id == addressID) {
            address = userData.addresses[i];
            break;
          }
        }
        resolve(address);
      } catch (error) {
        reject(error);
      }
    });
  },

  //UPDATE USER PASSWORD
  updatePassword: (data) => {
    const Response = {};
    const currentPassword = data.currentPassword;
    let newPassword = data.newPassword;
    const repeatPassword = data.repeatPassword;
    const userID = data.ID;
    return new Promise(async (resolve, reject) => {
      try {
        const User = await user.findOne({ _id: userID }).lean();
        bcrypt
          .compare(currentPassword, User.password)
          .then(async (response) => {
            if (response) {
              if (newPassword === repeatPassword) {
                newPassword = await bcrypt.hash(newPassword, 10);
                await user.findOneAndUpdate(
                  { _id: userID },
                  { $set: { password: newPassword } }
                );
                Response.success = true;
                resolve(Response);
              } else {
                Response.repeatIncorrect = true;
                resolve(Response);
              }
            } else {
              Response.oldIncorrect = true;
              resolve(Response);
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  //UPDATE ADDRESS
  updateAddress: (data, addressID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userData = await user.findOneAndUpdate(
          { _id: userID, "addresses._id": addressID },
          {
            $set: {
              "addresses.$.fullName": data.fullName,
              "addresses.$.mobile": data.mobile,
              "addresses.$.pincode": data.pincode,
              "addresses.$.building": data.building,
              "addresses.$.area": data.area,
              "addresses.$.landmark": data.landmark,
              "addresses.$.district": data.district,
            },
          }
        );
        console.log("ADDRESS UPDATED");
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  //SELECT ADDRESS
  // selectAddress: (address, userID) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const userData = await user.findOne({ _id: userID });
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // },

  //GENERATE RAZORPAY
  generateRazorpay: (orderID, amount) => {
    return new Promise((resolve, reject) => {
      try {
        orderID = orderID.toString();
        const Amount = parseInt(amount);
        const options = {
          amount: Amount * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: orderID,
          // ''+orderID
        };
        instance.orders.create(options, function (err, order) {
          if (order) {
            console.log("NEW ORDER");
            resolve(order);
          } else {
            console.log("ERROR", err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  //VERIFY PAYMENT
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('veriyPAYMENT')
        const crypto = require("crypto");
        let expectedSignature = crypto.createHmac(
          "sha256",
          process.env.RAZ_SECRET
        );
        expectedSignature.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        expectedSignature = expectedSignature.digest("hex");
        if (expectedSignature == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  //CHANGE PAYMENT STATUS
  changePaymentStatus: (orderID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders
          .updateOne({ _id: orderID }, { $set: { paymentStatus: "Confirmed" } })
          .then((response) => {
            resolve(response);
          });
      } catch (err) {
        reject(err);
      }
    });
  },

  //PLACE ORDER
  placeOrder: (order, userID, cartItems) => {
    return new Promise(async (resolve, reject) => {
      try {
        const status =
          order.paymentMethod === "Cash on Delivery"
            ? "In Progress"
            : "Pending";
        let date = new Date();
        date = date.toUTCString();
        date = date.slice(5, 16);
        if (order.coupon) {
          var couponData = await coupons.findOne({ code: order.coupon }).lean();
        }
        const orderDetails = {
          userID: userID,
          products: cartItems,
          totalCost: order.totalCost,
          coupon: order.coupon,
          discount: order.discount,
          finalCost: order.finalCost,
          paymentMethod: order.paymentMethod,
          address: order.address,
          paymentStatus: status,
          orderStatus: "Placed",
          date: date,
        };
        const cartItem = cartItems[0].productID;
        const newOrder = new orders(orderDetails);
        newOrder.save().then(async (response) => {
          cartItems.map(async (val) => {
            let productData = await productModel.findOne({
              _id: val.productID,
            });
            if (productData.quantity >= val.quantity) {
              await productModel.updateOne(
                { _id: val.productID },
                { $inc: { sold: val.quantity, quantity: -val.quantity } }
              );
            }
          });
          if (couponData) {
            await user.updateOne(
              { _id: userID },
              { $pull: { coupons: { coupon: couponData } } }
            );
          }
          resolve(response._id);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  //APPLY COUPON
  applyCoupon: (coupon, amount, userID) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        let status;
        let couponData;
        const userData = await user
          .findOne({ _id: userID })
          .populate("coupons.coupon")
          .lean();
        for (var i = 0; i < userData.coupons.length; i++) {
          if (userData.coupons[i].coupon.code === coupon) {
            status = true;
            couponData = userData.coupons[i].coupon;
            break;
          }
        }
        if (status) {
          const finalAmount = (amount * couponData.discount) / 100;
          response.status = true;
          response.finalAmount = finalAmount;
          response.discount = amount - finalAmount;
          resolve(response);
        } else {
          response.status = false;
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //GET ORDERS
  getOrders: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await orders
          .find({ userID: userID })
          .sort({ createdAt: -1 })
          .populate("products.productID")
          .lean();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  },

  //ORDER IN DETAIL
  orderInDetail: (orderID, addressID, userID) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const orderData = await orders
          .findById(orderID)
          .populate("products.productID")
          .lean();
        const userData = await user.findById(userID).lean();
        let address;
        for (let i = 0; i < userData.addresses.length; i++) {
          if (addressID == userData.addresses[i]._id) {
            address = userData.addresses[i];
            break;
          }
        }
        response.orderData = orderData;
        response.address = address;
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  },

  //CANCEL ORDER
  cancelOrder: (orderID) => {
    console.log("OrderID:",orderID)
    return new Promise(async (resolve, reject) => {
      try {
        await orders.findByIdAndDelete(orderID);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },
};