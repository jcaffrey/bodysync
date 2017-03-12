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
var injuries = require('./controllers/injuries');
var romMetrics  = require('./controllers/romMetrics');
var romMetricMeasures = require('./controllers/romMetricMeasures');

var auth = require('./controllers/auth');

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

// ADD REMAINING ROUTES W/ ASSOCIATED CONTROLLERS
// TODO: implement update
// TODO: implement error checking


// temp 
router.route('/')
    .get(function(req, res) {
        res.send('Welcome to the bodysync API. See /backend/app.js for useful endpoints!');
     })

// for now... assumes only one practice to which all pts belong

router.route('/login/pt')
    .post(auth.loginPt); 
//router.route('/login/patient')
//    .post(auth.loginPatient); 

router.route('/pts')
    .get(auth.adminRequired, pts.getPTS) // not a view, Access: admin
    .post(pts.createPT); // Access: admin

router.route('/pts/:id')
    .get(pts.getPTById) // not a view, Access: pt
   // .put(pts.updatePT) Access: pt
    .delete(pts.deletePT); // Access: admin

router.route('/pts/:id/patients')
    .get(patients.getPatients) // Access: pt
    .post(patients.createPatient); // Access: pt

router.route('/patients/:id')
    .get(patients.getPatientById) // Access: pt, with verification on id
    //.put(patients.updatePatient) // Access: same
    .delete(patients.deletePatient); // Access: same

router.route('/patients/:id/injuries')
    .get(injuries.getInjuries) // Access: pt, patient, views handled differently on frontend using token
    .post(injuries.createInjury); // Access: pt

router.route('/injuries/:id')
    .get(injuries.getInjuryById) // Access: pt, patient
    //.put(injuries.updateInjury) // Access: pt 
    .delete(injuries.deleteInjury); // Access: pt


router.route('/injuries/:id/romMetrics')
    .get(romMetrics.getRomMetrics) // Access: pt, patient
    .post(romMetrics.createRomMetric); // Access: pt
   

router.route('/romMetrics/:id')
    .get(romMetrics.getRomMetricById) // Access: pt
    //.put(romMetrics.updateRomMetric) // Access: pt
    .delete(romMetrics.deleteRomMetric); // Access: pt

router.route('/romMetrics/:id/romMetricMeasures')
    .get(romMetricMeasures.getMeasures) // Access: pt, patient
    .post(romMetricMeasures.createMeasure); // Access: pt




/*
Comments on routing structure: 
This is a CRUD app, with repeated data nested with other data (pts have patients have 
injuries have exerciseSets for those injuries and romMetrics to track those injuries, etc.) 
which is captured here:

/pts/:id/patients/:id/injuries/:id/exerciseSets/:id/exercises/:id/exerciseCompletions
/pts/:id/patients/:id/injuries/:id/romMetrics/:id/romMetricMeasures

These are all 1:M relationships, so we can simplify the routes a lot.
e.g. 
/exerciseSets/:id is sufficient for /pts/:id/patients/:id/injuries/:id/exerciseSets/:id/
since we'd only ever access a specific exerciseSet with id :id if we are the pt with 
the specific patient with the speciific injury, so we're removing redundancy. 

There are additional routes we have to implement, this is simply take 1.

*/



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
