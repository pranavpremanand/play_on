const userModel = require("../models/user-model");

module.exports = {
  addToWishlist: (productID, userID) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const alreadyInWishlist = await userModel.findOne({
          _id: userID,
          "wishlist.productID": productID,
        });
        if (alreadyInWishlist) {
          await userModel.findByIdAndUpdate(
            { _id: userID },
            { $pull: { wishlist: { productID: productID } } }
          );
          response.removed = true;
          resolve(response);
        } else {
          const user = await userModel.findOne({ _id: userID });
          const product = {
            productID: productID,
          };
          user.wishlist.push(product);
          user.save().then(() => {
            resolve(response);
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  //REMOVE WISHLIST ITEM
  removeWishlistItem: (productID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await userModel
          .findByIdAndUpdate(
            { _id: userID },
            { $pull: { wishlist: { productID: productID } } }
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
};