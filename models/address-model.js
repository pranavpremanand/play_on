const mongoose = require("mongoose");
const schema = mongoose.Schema;
const collections = require("../config/collections");
const addressSchema = new schema({
    userID: {
        type: mongoose.Schema.Types(ob)
    },
    addresses:[{
        fullName: {
            type: String,
            required: true,
        },
        mobile: {
            type: Number,
            required: true,
        },
        building: {
            type: String,
            required: true,
        },
        area: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
        },
        // state:{
        //     type:String
        // }
        pincode: {
            type: Number,
            required: true,
        }
    }]
});

const address = mongoose.model(collections.addresses,addressSchema)

module.exports = address;