var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

// const url = require('url');

module.exports.createSession = (req, res, next) => {
    // TODO add a field for sessionId in the pt token

    // query ptSession table on ptId. increment or set initial sessionId
    // update token with sessionId


    console.log('in create session');
    console.log(req.url);
    return;
}

module.exports.logSession = (req, res, next) => {
    // TODO in controllers -- save pt's current patientId in req.body
    // save data down...
    // get sessionId, ptId from token

    // get resourceRequested from URL

    // get patientId from req.body

    // get duration
    // query ptSession table for most recent row ON ptId AND sessionId, update duration of this data using
    // current request's start time as that request's end time - iff it is not set already (because of updateSession)
    // (so, we're backfilling the table)



    console.log('in log session');
    console.log(req.url);
    return;
}

// TODO implement a helper function to update durations when a non-GET request follows a GET request
// (since we're only tracking when sensitive information is being viewed i.e. via GET)

module.exports.updateSession = (req, res, next) => {
    // query ptSesssion table ON ptId and sessionId
    // check if duration is set and update accordingly

};
//

module.exports.endSession = (req, res, next) => {

    // update duration of final request in some session as above

    // that's all that happens here, everything else is handled in auth

    console.log('in end session');
    console.log(req.url);
    return;
}