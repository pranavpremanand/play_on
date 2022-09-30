const { products } = require("../config/collections");
const product = require("../models/product-model");
const { findById } = require("../models/user-model");
const user = require("../models/user-model");
// require("../config/server");

module.exports = {
  //ITEM ADD TO CART
  addToCart: (ID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const productData = await product.findOne({ _id: ID });
        const pdtExist = await user.findOne({
          _id: userID,
          cart: { $elemMatch: { productID: ID } },
        });
        if (pdtExist) {
          let cartQuantity;
          for (let j = 0; j < pdtExist.cart.length; j++) {
            if (ID == pdtExist.cart[j].productID) {
              cartQuantity = pdtExist.cart[j].quantity;
              break;
            }
          }
          if (productData.quantity > cartQuantity) {
            const User = await user.findOne({ _id: userID }).lean();
            const countOfItems = User.cart.length;
            await user.updateOne(
              { _id: userID, "cart.productID": ID },
              { $inc: { "cart.$.quantity": 1 } }
            );
            resolve({ countOfItems });
          }
          resolve({ outOfStock: true });
        } else {
          const Product = await product.findOne({ _id: ID });
          const cartItem = {
            productID: ID,
            quantity: 1,
            pricePerItem: Product.sellingPrice,
          };
          const userData = await user.findOne({ _id: userID });
          userData.cart.push(cartItem);
          userData.save().then(() => {
            const countOfItems = userData.cart.length;
            resolve({ countOfItems });
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  //GET CART ITEMS
  getCartItems: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userData = await user.find({ _id: userID });
        const cartItems = userData.cart;
        resolve(cartItems);
      } catch (err) {
        reject(err);
      }
    });
  },

  //REMOVE CART ITEMS
  removeCartItem: (productID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await user
          .findByIdAndUpdate(
            { _id: userID },
            { $pull: { cart: { productID: productID } } }
          )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  },

  //CART ITEMS COUNT
  cartItemsCount: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userData = await user.findOne({ _id: userID });
        const count = userData.cart.length;
        resolve(count);
      } catch (err) {
        reject(err);
      }
    });
  },

  //CHANGE CART ITEM QUANTITY
  changeQuantity: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const pdtID = data.product;
        const userID = data.user;
        const count = parseInt(data.count);
        const quantity = data.quantity;
        const productData = await product.findOne({ _id: pdtID });
        userData = await user.findOne({ _id: userID });
        let cartQuantity;
        for (let j = 0; j < userData.cart.length; j++) {
          if (pdtID == userData.cart[j].productID) {
            cartQuantity = userData.cart[j].quantity;
            break;
          }
        }
        if (cartQuantity < productData.quantity && count == 1) {
          await user
            .findOneAndUpdate(
              { _id: userID, "cart.productID": pdtID },
              { $inc: { "cart.$.quantity": count } }
            )
            .then((Data) => {
              let Quantity;
              for (let i = 0; i < Data.cart.length; i++) {
                if (pdtID == Data.cart[i].productID) {
                  Quantity = Data.cart[i].quantity;
                }
              }
              resolve(Quantity);
            });
        } else if (productData.quantity >= 0 && count == -1) {
          await user
            .findOneAndUpdate(
              { _id: userID, "cart.productID": pdtID },
              { $inc: { "cart.$.quantity": count } }
            )
            .then((Data) => {
              let quantity;
              for (let i = 0; i < Data.cart.length; i++) {
                if (pdtID == Data.cart[i].productID) {
                  quantity = Data.cart[i].quantity;
                }
              }
              resolve(quantity);
            });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  //CART ITEMS COST
  cartItemsCost: (ID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const User = await user.findOne({ _id: ID }).lean();
        if (User.cart) {
          const totalCost = User.cart.reduce((total, num) => {
            total += num.pricePerItem * num.quantity;
            return total;
          }, 0);
          resolve(totalCost);
        } else {
          0;
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};
