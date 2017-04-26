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
module.exports.createExerciseSet = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.injury.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(injury) {
        if(Object.keys(injury).length !== 0) {
            models.patient.findOne({
                where: {
                    id: injury.patientId
                }
            }).then(function(patient) {
                if(Object.keys(patient).length !== 0) {
                    if(decoded.id == patient.ptId) {
                        // create!
                        models.exerciseSet.create({
                            name: req.body.name,
                            isTemplate: req.body.isTemplate,
                            isCurrentlyAssigned: req.body.isCurrentlyAssigned,
                            intendedInjuryType: req.body.intendedInjuryType,
                            injuryId: req.params.id,
                            ptId: patient.ptId
                        }).then(function(set) {
                            res.json(set);
                            return next();
                        }).catch(function(err) {
                            return next(err);
                        });
                    } else {
                        res.status(401).send('PT unauthorized');
                    }
                }
            }).catch(function(err) {
                return next(err);
            });
        } else {
            res.status(404).send('No exercise set');
        }
    }).catch(function(err) {
        return next(err);
    });
}

/**

 READ (HTTP GET)

 */

module.exports.getExerciseSets = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exerciseSet.findAll({
        where: {
            injuryId: req.params.id
        }
    }).then(function (sets) {
        if(sets.length !== 0) {
            //if patient
            var firstSet = sets[0];
            models.injury.findOne({
                where: {
                    id: firstSet.injuryId
                }
            }).then(function (injury) {
                if(!decoded.isPt) {
                    if(decoded.id == injury.patientId) {
                        return res.json(sets);
                    } else {
                        return res.status(401).send('Patient unauthorized');
                    }
                }
                else {// is pt
                    models.patient.findOne({
                        where: {
                            id: injury.patientId
                        }
                    }).then(function (patient) {
                        if(Object.keys(patient).length !== 0) {
                            if(decoded.id == patient.ptId) {
                                req.body.patientId = patient.id || injury.patientId;
                                res.json(sets);
                                return next();
                            } else {
                                return res.status(401).send('PT unauthorized');
                            }
                        }
                    }).catch(function(err) {
                        return next(err);
                    });
                }
            }).catch(function(err) {
                return next(err);
            });
        }
    }).catch(function(err) {
        return next(err);
    });
}

module.exports.getExerciseSetById = (req, res, next) => {
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
                if(Object.keys(injury).length !== 0) {
                    // is pt
                    if(decoded.isPt) {
                        models.patient.findOne({
                            where: {
                                id: injury.patientId
                            }
                        }).then(function (patient) {
                            if(Object.keys(patient).length !== 0) {
                                if(decoded.id == patient.ptId) {
                                    req.body.patientId = patient.id || injury.patientId;
                                    res.json(set);
                                    return next();
                                } else {
                                    res.status(401).send('PT unauthorized');
                                }
                            } else {
                                res.status(404).send('No patient with that injury');
                            }
                        }).catch(function(err) {
                            return next(err);
                        });
                    }
                    else // is patient
                    {
                        return res.json(set);
                    }
                } else {
                    res.status(404).send('no injury with that rom');
                }
            }).catch(function(err) {
                return next(err);
            });
        } else {
            res.status(404).send('No Metric with that id');
        }
    }).catch(function(err) {
        return next(err);
    });
};

/**

 UPDATE (HTTP PUT)

 */


/**

 DELETE (HTTP DELETE)

 */

module.exports.deleteExercise = (req, res, next) => {
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
                if(Object.keys(injury).length !== 0) {
                    models.patient.findOne({
                        where: {
                            id: injury.patientId
                        }
                    }).then(function(patient) {
                        if(Object.keys(patient).length !== 0) {
                            if(decoded.id == patient.ptId) {
                                set.destroy();
                                res.json(set);
                                return next();
                            }
                        } else {
                            res.status(404).send('No patient with that injury');
                        }
                    })
                } else {
                    res.status(404).send('No injury with that rom');  // this indicates loss of data (as does the one above)..should never trigger
                }
            })
        } else {
            res.status(404).send('No rom with that id');
        }
    }).catch(function(err) {
        return next(err);
    });

}