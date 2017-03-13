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
    .post(auth.adminRequired, pts.createPT); // Access: admin

router.route('/pts/:id')
    .get(auth.ptRequired, pts.getPTById) // not a view, Access: pt
   // .put(auth.ptRequired, pts.updatePT) Access: pt should be able to self update?
    .delete(auth.adminRequired, pts.deletePT); // Access: admin

router.route('/pts/:id/patients')
    .get(auth.ptRequired, patients.getPatients) // Access: pt
    .post(auth.ptRequired, patients.createPatient); // Access: pt

router.route('/patients/:id')
    .get(auth.ptRequired, patients.getPatientById) // Access: pt, with verification on id
    //.put(auth.ptRequired, patients.updatePatient) // Access: same
    .delete(auth.ptRequired, patients.deletePatient); // Access: same

router.route('/patients/:id/injuries')
    .get(auth.tokenRequired, injuries.getInjuries) // Access: pt, patient, views handled differently on frontend using token
    .post(auth.ptRequired, injuries.createInjury); // Access: pt

router.route('/injuries/:id')
    .get(auth.tokenRequired, injuries.getInjuryById) // Access: pt, patient
    //.put(auth.ptRequired, injuries.updateInjury) // Access: pt 
    .delete(auth.ptRequired, injuries.deleteInjury); // Access: pt


router.route('/injuries/:id/romMetrics')
    .get(auth.tokenRequired, romMetrics.getRomMetrics) // Access: pt, patient
    .post(auth.ptRequired, romMetrics.createRomMetric); // Access: pt
   

router.route('/romMetrics/:id')
    .get(auth.ptRequired, romMetrics.getRomMetricById) // Access: pt
    //.put(auth.ptRequired, romMetrics.updateRomMetric) // Access: pt
    .delete(auth.ptRequired, romMetrics.deleteRomMetric); // Access: pt

router.route('/romMetrics/:id/romMetricMeasures')
    .get(auth.tokenRequired, romMetricMeasures.getMeasures) // Access: pt, patient
    .post(auth.ptRequired, romMetricMeasures.createMeasure); // Access: pt




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
