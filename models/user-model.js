const mongoose = require('mongoose');
const collections = require('../config/collections')
const schema = mongoose.Schema;

const userData = new schema({
    name:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: Number,
        // required: true,
        // min: [10,"Entered phone number is invalid."],
        // max: []
    },
    email:{
        type: String,
        // required: true
    },
    password:{
        type: String,
        // required: true,
        min: 8
    },
    coupons:[{
        coupon:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'coupons',
        }
    }],
    addresses:[
        {
            fullName:{
                type:String,
                required:true
            },
            mobile:{
                type:Number,
                required:true
            },
            building:{
                type: String,
                required:true
            },
            area:{
                type: String,
                required:true
            },
            landmark:{
                type:String,
                required:true
            },
            district:{
                type:String,
                required:true
            },
            // state:{
            //     type:String
            // }
            pincode:{
                type: Number,
                required:true
            }
        }
    ],
    // wishlist:{

    // },
    cart:[
        {
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'products'
        },
        quantity:{
            type:Number,
            default:0
        },
        pricePerItem:{
            type:Number,
            default:0
        }
        }
    ],
    wishlist:[
        {
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'products'
        },
        }
    ],
    isActive:{
        type: Boolean, 
        default: true
    },
    verified:{
        type: Boolean,
        default: false
    }
})
const user = mongoose.model(collections.users, userData)
// const pranav= new user({
//     name:'pranav',
//     phoneNumber:9633063113,
//     email:'mpranav@gmail.com',
//     password:12345678,
//     isActive: true,
//     verified:true
// })
// pranav.save()
module.exports = user;