//==============================
// non-local dependencies
//==============================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//==============================
// local dependencies
//==============================
// db object 
var models = require('./models/index');

// abstracted routes into ./routes/routes.js, so controllers are there too
var routes = require('./routes/routes.js');

//==============================
// app
//==============================
var app = express();

// get global access to config, borrowing code from index.js
// N.B. process.env.NODE_ENV is a global accessible within node
// should be set only outside app
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/config/config.json')[env];  
app.locals.config = config;

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

app.use('/', routes);

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
