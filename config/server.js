const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
// SERVER = mongodb://localhost:27017/play_on
mongoose.connect(process.env.SERVER,{useNewUrlParser: true});
const db = mongoose.connection;
db.on('error',()=>console.log('DB IS NOT CONNECTED'));
db.once('open',()=>console.log('DB CONNECTED'))

module.exports = mongoose;