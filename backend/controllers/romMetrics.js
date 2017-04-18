
var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

// TODO ERROR CATCHING
module.exports.createRomMetric = (req, res, next) => {
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
                        models.romMetric.create({
                            name: req.body.name,
                            endRangeGoal: req.body.endRangeGoal,
                            startRange: req.body.startRange,
                            injuryId: req.params.id
                        }).then(function(rom) {
                            res.json(rom);
                            return next();
                        });
                    } else {
                        res.status(401).send('PT unauthorized');
                    }
                }
            })
        } else {
            res.status(404).send('No rom');
        }
    })

};



// TODO error catching
module.exports.getRomMetrics = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);
    console.log(decoded.id);

    models.romMetric.findAll({
        where: {
            injuryId: req.params.id
        }
    }).then(function(roms) {
        if(roms.length !== 0) {
            var firstRom = roms[0];
            console.log(roms.injuryId); //should be one id

            models.injury.findOne({
                where: {
                    id: firstRom.injuryId
                }
            }).then(function(injury) {
                // is patient
                if(!decoded.isPt) {
                    if(decoded.id == injury.patientId) {
                        return res.json(roms);
                    } else {
                        return res.status(401).send('Patient unauthorized');
                    }
                }
                // is pt
                else {
                    models.patient.findOne({
                        where: {
                            id: injury.patientId
                        }
                    }).then(function (patient) {
                        if(Object.keys(patient).length !== 0) {
                            if(decoded.id == patient.ptId) {
                                res.json(roms);
                                return next();
                            } else {
                                return res.status(401).send('PT unauthorized');
                            }
                        }
                    })
                }
            })
        } else {
            return res.status(404).send('No roms found');
        }
    })
}



module.exports.getRomMetricById = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.romMetric.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(rom) {
        if(Object.keys(rom).length !== 0) {
            models.injury.findOne({
                where: {
                    id: rom.injuryId
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
                                    res.json(rom);
                                    return next();
                                } else {
                                    res.status(401).send('PT unauthorized');
                                }
                            } else {
                                res.status(404).send('No patient with that injury');
                            }
                        }).catch(function (err) {
                            return next(err);
                        })
                    }
                } else {
                    res.status(404).send('no injury with that rom');
                }
            }).catch(function (err) {
                return next(err);
            })
        } else {
            res.status(404).send('No Metric with that id');
        }
    }).catch(function(err) {
        return next(err);
    });
};


module.exports.deleteRomMetric = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.romMetric.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(rom) {
        if(Object.keys(rom).length !== 0) {
            models.injury.findOne({
                where: {
                    id: rom.injuryId
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
                                rom.destroy();
                                return res.json(rom);
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

    })



    // models.romMetric.destroy({
    //     where: {
    //         id: req.params.id
    //     }
    // }).then(function(instance) {
    //     if (instance)
    //         res.sendStatus(200);
    //     else
    //         res.status(404).send('sorry not found');
    // });
}
