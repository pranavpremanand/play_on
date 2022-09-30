const mongoose = require('mongoose');
const collections = require('../config/collections')
const schema = mongoose.Schema;

const adminData = new schema({
    name:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: Number,
        required: true,
        minlength: 10
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
        minlength: 8
    }
})

const admin = mongoose.model(collections.admin,adminData)

module.exports = admin;