const mongoose = require('mongoose')
const schema = mongoose.Schema;
const collections = require('../config/collections')

const banner = new schema({
    title : String,
    description : String,
    image : String,
    // textColor : String,
    productCategory : String
})
const Banner = mongoose.model(collections.banner,banner);
module.exports = Banner;