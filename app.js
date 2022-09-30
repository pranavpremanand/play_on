const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const hbs = require('express-handlebars')
const session = require('express-session')
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const fs = require('fs');
const { options } = require('./routes/admin');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs',hbs.engine({
  extname:'hbs',
  defaultLayout:'layout',
  layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/',
  helpers:{
    eq: function (v1,v2){
      return v1===v2
    },
    gt: function (v1,v2){
      return v1>v2
    },
    dateFormat: function (date){
      return date.slice(5,16)
    },
    amountFormat: function (amount){
      if(amount==null){return 0
        } else{
          return amount.toString().slice(0,7)
        }
      },
    ifEquals: function (arg1, arg2, arg3, options) {
      return (arg1 == arg2 || arg1 == arg3) ? options.fn(this) : options.inverse(this)
    },
    twoConditions: function (one1, one2, two1, two2, options){
      return (one1 == one2 || two1 == two2) ? options.fn(this) : options.inverse(this)
    },
    itemsCount: function (items){
      count = items.length; if(count === 1){
        return itemsCount = count+' Item'
      } else {
        return itemsCount = count+' Items'
      }
    },
    multiplyAmount: function (price,quantity){
      return total = price * quantity
    }
}}))



//Enabling express-session :)
const oneDay = 1000 * 60 * 60 * 24 * 365;
app.use(session({
  secret:'secret-key',
  saveUninitialized:true,
  cookie:{maxAge: oneDay},
  resave:false}))

//CACHE CONTROL
app.use((req,res,next)=>{
  res.set("cache-control","no-store");
  next();
})

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
