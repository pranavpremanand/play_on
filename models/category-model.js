const mongoose = require("mongoose");
const collections = require("../config/collections");
const schema = mongoose.Schema;

const productCategory = new schema(
  {
    name: {
      type: String,
      required: true,
    },
    urlName: {
      type: String,
    },
  },
  { timestamps: true }
);

const category = mongoose.model(collections.categories, productCategory);

module.exports = category;