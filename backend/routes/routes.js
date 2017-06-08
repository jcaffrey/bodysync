
//==============================
// dependencies
//============================== 

// Set up router
var express = require('express');
var router = express.Router();

// Controllers for callbacks
// ./controllers/ contain CRUD / non-CRUD logic for each object 
var pts = require('../controllers/pts');
var patients = require('../controllers/patients');
var injuries = require('../controllers/injuries');
var romMetrics  = require('../controllers/romMetrics');
var romMetricMeasures = require('../controllers/romMetricMeasures');
// var exerciseSets = require('../controllers/exerciseSets');
var exercises = require('../controllers/exercises');
var exerciseCompletions = require('../controllers/exerciseCompletions');
var ptSessions = require('../controllers/ptSessions');


// N.B.: 
// role-specific auth (are you at pt? a patient?) containing in ../controllers/auth,js 
// requester-specific auth (are you a pt asking for your patients?) containing in controllers
var auth = require('../controllers/auth');

//============================== 
// routes 
//==============================

// for now... assumes only one practice to which all pts belong

// root of api 
router.route('/')
    .get(function(req, res) {
        res.send('Welcome to the bodysync API. See /backend/app.js for useful endpoints!');
     });

// routes to sign-in and create token 
/* 
    separate routes to sign in pt and patient since loginPt queries pt table, 
    loginPatient queries patient table, and we have no a priori info about client's status
    to pass as a parameter to a callback that could handle both in a single route
*/

router.route('/login/pt')
    .post(auth.loginPt, ptSessions.createSession);
router.route('/login/patient')
    .post(auth.loginPatient);

router.route('/logoff')
    .get(auth.ptRequired, ptSessions.updateSession);

router.route('/forgotpassword') 
    .post(auth.forgotPassword);

router.route('/reset/:token') 
    .post(auth.resetPassword);

// routes for admin
router.route('/pts')
    .post(auth.adminRequired, pts.createPt);   // TODO add in authentication

router.route('/pts/:id')
    .delete(auth.adminRequired, pts.deletePt); 

// routes for pts to see patients
router.route('/pts/:id/patients')
    .get(auth.ptRequired, patients.getPatients, ptSessions.logSession)
    .post(auth.ptRequired, patients.createPatient, ptSessions.updateSession);

router.route('/patients/:id')
    .get(auth.tokenRequired, patients.getPatientById, ptSessions.logSession)
    .put(auth.ptRequired, patients.updatePatientNotes, ptSessions.updateSession)
    .delete(auth.ptRequired, patients.deletePatient, ptSessions.updateSession);

// routes for pts, patients to see injuries
router.route('/patients/:id/injuries') 
    .get(auth.tokenRequired, injuries.getInjuries, ptSessions.logSession) // views handled differently on frontend using token
    .post(auth.ptRequired, injuries.createInjury, ptSessions.updateSession);

router.route('/injuries/:id')
    .get(auth.tokenRequired, injuries.getInjuryById, ptSessions.logSession)
    //.put(auth.ptRequired, injuries.updateInjury) // Access: pt 
    .delete(auth.ptRequired, injuries.deleteInjury, ptSessions.updateSession);

// routes for injury tracking (rom content)
router.route('/injuries/:id/romMetrics')
    .get(auth.tokenRequired, romMetrics.getRomMetrics, ptSessions.logSession)
    .post(auth.ptRequired, romMetrics.createRomMetric, ptSessions.updateSession);

router.route('/romMetrics/:id')
    .get(auth.ptRequired, romMetrics.getRomMetricById, ptSessions.logSession)
    //.put(auth.ptRequired, romMetrics.updateRomMetric) // Access: pt
    .delete(auth.ptRequired, romMetrics.deleteRomMetric, ptSessions.updateSession);

router.route('/romMetrics/:id/romMetricMeasures')
    .get(auth.tokenRequired, romMetricMeasures.getMeasures, ptSessions.logSession)
    .post(auth.ptRequired, romMetricMeasures.createMeasure, ptSessions.updateSession);

// simplified route for exercise content (injury training)
router.route('/patients/:id/exercises')
    .get(auth.tokenRequired, exercises.getExercises);

router.route('/patients/:id/createSingleExercise')
    .post(auth.ptRequired, exercises.createExercise, ptSessions.updateSession);

router.route('/exercises/:id')
    .put(auth.ptRequired, exercises.updateExercise, ptSessions.updateSession)
    .delete(auth.ptRequired, exercises.deleteExercise, ptSessions.updateSession);

router.route('/exercises/:id/exerciseCompletions')
    .get(auth.tokenRequired, exerciseCompletions.getMostRecentCompletion, ptSessions.logSession)
    .post(auth.tokenRequired, exerciseCompletions.createCompletion, ptSessions.updateSession);

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

*/

// expose routes through router object
module.exports = router;

