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

// Controllers
// ./controllers/ contain CRUD / non-CRUD logic for each object 
var pts = require('./controllers/pts');
var patients = require('./controllers/patients');

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
router.route('/pts/:id')
    .get(pts.getPTById)
   // .put(pts.updatePT)
    .delete(pts.deletePT);

router.route('/pts/:id/patients')
    .post(patients.createPatient)
    .get(patients.getPatients);


//
// router.route('/patients')
//     .post(patients.createPatientByPTId)
//     .get(patients.getPatientsByPTId);
// router.route('/patients/:id')
//     .get(patients.getPatientByPTId)
//     .put(patients.updatePatientByPTId)
//     .delete(patients.deletePatientByPTId)

// router.route('/injuries')
//     .post()
//     .get();
// router.route('/injuries/:id')
//     .get()
//     .put()
//     .delete()
//
// router.route('/exerciseSets')
//     .post()
//     .get();
// router.route('/exerciseSets/:id')
//     .get()
//     .put()
//     .delete()
//
// router.route('/exercises')
//     .post()
//     .get();
// router.route('/exercises/:id')
//     .get()
//     .put()
//     .delete()
// router.route('/exercises/:id/exerciseCompletions')  // only patient can post
//     .post()
//     .get();

//
// router.route('/romMetrics')
//     .post()
//     .get();
// router.route('/romMetrics/:id')
//     .get()
//     .put()
//     .delete()
//
// router.route('/romMetrics/:id/romMetricMeasurements')
//     .post()
//     .get();
//






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
