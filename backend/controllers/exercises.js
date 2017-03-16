/**
 * Created by hsadev2 on 3/15/17.
 */

var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];


/**

 CREATE (HTTP POST)

 */
module.exports.createExercise = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exerciseSet.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(set) {
        if(Object.keys(set).length !== 0) {
            models.injury.findOne({
                where: {
                    id: set.injuryId
                }
            }).then(function (injury) {
                if(Object.keys(injury).length !== 0){
                    models.patient.findOne({
                        where: {
                            id: injury.patientId
                        }
                    }).then(function (patient) {
                        if(Object.keys(patient).length !== 0) {
                            if(decoded.isPt && decoded.id == patient.ptId) {
                                // create !
                                console.log(patient.id);
                                models.exercise.create({
                                    name: req.body.name,
                                    numRepsOrDuration: req.body.numRepsOrDuration,
                                    numSets: req.body.numSets,
                                    dayOfNextGoal: req.body.dayOfNextGoal,
                                    assignedFrequency: req.body.assignedFrequency,
                                    assignedDuration: req.body.assignedDuration,
                                    dateAssigned: req.body.dateAssigned,
                                    ptNotes: req.body.ptNotes,
                                    mediaUrl: req.body.mediaUrl,
                                    exerciseSetId: req.params.id
                                }).then(function (exercise) {
                                    if(Object.keys(exercise).length !== 0){
                                        return res.json(exercise);
                                    }
                                    else {
                                        res.status(500).send('Could not create');
                                    }
                                }).catch(function (err) {
                                    console.error(err.stack);
                                    return next(err);
                                })
                                // catch here
                            } else {
                                res.status(401).send('Unauthorized');
                            }
                        } else {
                            res.status(404).send('No patient with that injury');
                        }

                    }) // catch here
                } else {
                    res.status(404).send('No injury with that rom');
                }

            }) // catch here
        } else {
            res.status(404).send('No ROM with that id');
        }
    }).catch(function (err) {
        // console.error(err.stack);
        return next(err);
    }) // catch here
};

/**

 READ (HTTP GET)

 */
module.exports.getExercises = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exercise.findAll({
        where: {
            exerciseSetId: req.params.id
        }
    }).then(function(exercises) {
        if(exercises.length !== 0) {
            var firstExercise = exercises[0]

            models.exerciseSet.findOne({
                where: {
                    id: firstExercise.exerciseSetId
                }
            }).then(function (set) {
                if(Object.keys(set).length !== 0) {
                    models.injury.findOne({
                        where: {
                            id: set.injuryId
                        }
                    }).then(function (injury) {
                        if(Object.keys(injury).length !== 0) {
                            // check patient-level flag
                            models.patient.findOne({
                                where: {
                                    id: injury.patientId
                                }
                            }).then(function (patient) {
                                if(Object.keys(patient).length !== 0) {
                                    if(!decoded.isPt) {
                                        if(!patient.isRestrictedFromRom || patient.id == decoded.id) {
                                            return res.json(exercises);
                                        } else {
                                            res.status(401).send('Patient unauthorized');
                                        }
                                    }
                                    // is pt
                                    else {
                                        if(decoded.id == patient.ptId) {
                                            return res.json(exercises);
                                        }
                                        else {
                                            res.status(401).send('PT unauthorized');
                                        }
                                    }
                                }
                            }) // catch here
                        }
                    }) // catch here
                }
            }) // catch here
        } else {
            res.status(404).send('No Measures for that RomMetric');
        }
    }).catch(function (err) {
        return next(err);
    })
};


// module.exports.getExerciseById = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//
// };



/**

 UPDATE (HTTP PUT)

 */

// TODO

/**

 DELETE (HTTP DELETE)

 */
