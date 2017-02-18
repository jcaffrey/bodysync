//==============================
// non-local imports
//==============================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//==============================
// local imports
//==============================
// db object 
var models = require('./models/index');

// Controllers
// ./controllers/ contain CRUD / non-CRUD logic for each object 
var pts = require('./controllers/pts')

// ADD REMAINING CONTROLLERs

//==============================
// app
//==============================
var app = express();
var router = express.Router()


//==============================
// 3rd-party / built-in middleware
//==============================

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//==============================
//  Routes
//==============================

router.route('/pts')
    .post(pts.createPT)
    .get(pts.getPTS);

// ADD REMAINING ROUTES W/ ASSOCIATED CONTROLLERS




app.use('/', router);

//==============================
// Error-handling middleware
//==============================

// CAN REWRITE BELOW USING BOOTCAMP APPROACH

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

// send to ./bin/www
module.exports = app;
