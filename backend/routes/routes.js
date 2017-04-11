
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
var exerciseSets = require('../controllers/exerciseSets');
var exercises = require('../controllers/exercises');
var exerciseCompletions = require('../controllers/exerciseCompletions');


// N.B.: 
// role-specific auth (are you at pt? a patient?) containing in ../controllers/auth,js 
// requester-specific auth (are you a pt asking for your patients?) containing in controllers
var auth = require('../controllers/auth');



//============================== 
// routes 
//============================== 

// TODO: implement update
// TODO: implement error checking

// for now... assumes only one practice to which all pts belong

// root of api 
router.route('/')
    .get(function(req, res) {
        res.send('Welcome to the bodysync API. See /backend/app.js for useful endpoints!');
     })

// routes to sign-in and create token 
/* 
    separate routes to sign in pt and patient since loginPt queries pt table, 
    loginPatient queries patient table, and we have no a priori info about client's status
    to pass as a parameter to a callback that could handle both in a single route
*/

// ** = add requester-specific auth to the controller 


router.route('/login/pt')
    .post(auth.loginPt);
router.route('/login/patient')
    .post(auth.loginPatient); 

// routes for admin
router.route('/pts')
    .get(auth.adminRequired, pts.getPts) // not a view
    .post(auth.adminRequired, pts.createPt); 
router.route('/patients')
    .get(auth.adminRequired, patients.getAllPatients); // not a view, just for development
router.route('/pts/:id')
    .get(auth.ptRequired, pts.getPtById) // not a view  
   // .put(auth.ptRequired, pts.updatePt) // Access: pt should be able to self update?
    .delete(auth.adminRequired, pts.deletePt); 

// routes for pts to see patients
router.route('/pts/:id/patients')
    .get(auth.ptRequired, patients.getPatients)     
    .post(auth.ptRequired, patients.createPatient);   // should patients have any access?

router.route('/patients/:id')
    .get(auth.tokenRequired, patients.getPatientById)
    //.put(auth.tokenRequired, patients.updatePatient) // Access: pt   **w/query
    .delete(auth.ptRequired, patients.deletePatient);

// routes for pts, patients to see injuries
router.route('/patients/:id/injuries') 
    .get(auth.tokenRequired, injuries.getInjuries) //  views handled differently on frontend using token
    .post(auth.ptRequired, injuries.createInjury);


// TODO ERROR CATCHING ON ALL OF THESE

router.route('/injuries/:id')
    .get(auth.tokenRequired, injuries.getInjuryById) // error catching
    //.put(auth.ptRequired, injuries.updateInjury) // Access: pt 
    .delete(auth.ptRequired, injuries.deleteInjury);

// routes for injury tracking (rom content)
router.route('/injuries/:id/rommetrics')
    .get(auth.tokenRequired, romMetrics.getRomMetrics) // error catching
    .post(auth.ptRequired, romMetrics.createRomMetric);
   

router.route('/romMetrics/:id')
    .get(auth.ptRequired, romMetrics.getRomMetricById)
    //.put(auth.ptRequired, romMetrics.updateRomMetric) // Access: pt
    .delete(auth.ptRequired, romMetrics.deleteRomMetric);

router.route('/romMetrics/:id/romMetricMeasures')
    .get(auth.tokenRequired, romMetricMeasures.getMeasures)  // restricts workers' comp server side
    .post(auth.ptRequired, romMetricMeasures.createMeasure); // Access: pt



// routes for injury training (exercise content)
router.route('/injuries/:id/exerciseSets')
    .get(auth.tokenRequired, exerciseSets.getExerciseSets)
    .post(auth.ptRequired, exerciseSets.createExerciseSet);

router.route('/exerciseSets/:id')
    .get(auth.tokenRequired, exerciseSets.getExerciseSetById)
    // .put(auth.ptRequired, exerciseSets.updateExerciseSet)       // Access: pt
    .delete(auth.ptRequired, exerciseSets.deleteExercise);

router.route('/exerciseSets/:id/exercises')
    .get(auth.tokenRequired, exercises.getExercises)
    .post(auth.ptRequired, exercises.createExercise);

router.route('/exercises/:id')
    .get(auth.tokenRequired, exercises.getExerciseById)
    //.put(auth.ptRequired, exercises.updateExercise)             // Access: pt
    .delete(auth.ptRequired, exercises.deleteExercise);

router.route('/exercises/:id/exerciseCompletions')
    .get(auth.tokenRequired, exerciseCompletions.getCompletions)
    .post(auth.tokenRequired, exerciseCompletions.createCompletion); // Access: patient only <-- TBU  do we want to make an auth.patientRequired?

router.route('/exerciseCompletions/:id')
    .get(auth.tokenRequired, exerciseCompletions.getCompletionById)
//     .put(exerciseCompletions.updateExerciseCompletion)      // Access: patient only <-- TBU  do we want to make an auth.patientRequired?
    .delete(auth.tokenRequired, exerciseCompletions.deleteCompletion);  // Access: patient only <-- TBU  do we want to make an auth.patientRequired?


// TBU - routes for templated exercise sets


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

