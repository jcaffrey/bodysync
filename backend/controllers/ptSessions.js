var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

// const url = require('url');

module.exports.createSession = (req, res, next) => {
    // TODO add a field for sessionId in the pt token

    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    console.log(decoded.id);
    models.ptSession.findAll({
        where: {
            ptId: decoded.id
        }
    }).then(function(session) {

        models.ptSession.create({
                ptId: decoded.id,
                sessionNumber: session.sessionNumber || 1
        }).then(function(created) {

            // update token with sessionId <-- TODO: this is not actually updating the token in logSession..
            decoded.sessionNumber = created.sessionNumber;
            console.log(decoded);

            return; // next() here?
        })
    });

}

module.exports.logSession = (req, res, next) => {
    // TODO in controllers -- save pt's current patientId in req.body
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    console.log(decoded);
    console.log(req.body);
    console.log(req.body.sessionNumber);

    // models.ptSession.findAll({
    //     where: {
    //         ptId: req.body.ptId,
    //         sessionNumber:
    //     }
    // })


    // save data down...
    // get sessionId, ptId from token

    // get resourceRequested from URL

    // get patientId from req.body  --> TODO: what if there are multiple patients? right now just storing the route..should be able to construct the rest from the timestamps in queries for logs

    // get duration
    // query ptSession table for most recent row ON ptId AND sessionId, update duration of this data using
    // current request's start time as that request's end time - iff it is not set already (because of updateSession)
    // (so, we're backfilling the table)



    console.log('in log session');
    console.log(req.body);
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