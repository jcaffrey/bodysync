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

// TODO: import exercise controllers

var auth = require('../controllers/auth');

//============================== 
// routes 
//============================== 

// TODO: exercises routes
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
    .get(auth.adminRequired, pts.getPts) // not a view, Access: admin
    .post(auth.adminRequired, pts.createPt); // Access: admin
router.route('/patients') 
    .get(auth.adminRequired, patients.getAllPatients); // now a view, just for development 
router.route('/pts/:id')
    .get(auth.ptRequired, pts.getPtById) // not a view, Access: pt       ** 
   // .put(auth.ptRequired, pts.updatePt) Access: pt should be able to self update?
    .delete(auth.adminRequired, pts.deletePt); // Access: admin

// routes for pts to see patients
router.route('/pts/:id/patients')
    .get(auth.ptRequired, patients.getPatients) // Access: pt  ** 
    .post(auth.ptRequired, patients.createPatient); // Access: pt  **

router.route('/patients/:id')
    .get(auth.ptRequired, patients.getPatientById) // Access: pt  **w/query
    //.put(auth.ptRequired, patients.updatePatient) // Access: pt   **w/query
    .delete(auth.ptRequired, patients.deletePatient); // Access: pt  **w/query

// routes for pts, patients to see injuries
router.route('/patients/:id/injuries') 
    .get(auth.tokenRequired, injuries.getInjuries) // Access: pt, patient, views handled differently on frontend using token    **w/query
    .post(auth.ptRequired, injuries.createInjury); // Access: pt    **w/query







router.route('/injuries/:id')
    .get(auth.tokenRequired, injuries.getInjuryById) // Access: pt, patient
    //.put(auth.ptRequired, injuries.updateInjury) // Access: pt 
    .delete(auth.ptRequired, injuries.deleteInjury); // Access: pt

// routes for injury tracking (rom content)
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

// routes for injury training (exercise content)
// TBU


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


// expose routes through router object
module.exports = router;

