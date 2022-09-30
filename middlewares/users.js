const { render } = require('../app');
const user = require('../models/user-model')
//USER LOG CHECK
exports.userAuth = (req, res, next) => {
  if (req.session.userIn) {
    next();
  } else {
    res.redirect("/");
  }
};

//CHECK USER BLOCKED OR NOT
exports.checkStatus = async (req, res, next) => {
  try {
    if (req.session.userIn) {
      const userID = req.session.userData._id;
      // return new Promise(async (resolve, reject) => {
      const result = await user.findOne({ _id: userID });
      if (result.isActive) {
        next();
      } else {
        console.log("working");
        res.render("user/blocked");
      }
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};


