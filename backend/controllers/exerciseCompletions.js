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
module.exports.createCompletion = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    if(!decoded.isPt) {
        models.exercise.findOne({
            where: {
                id: req.params.id
            }
        }).then(function (exercise) {
            if(Object.keys(exercise).length !== 0){
                models.exerciseSet.findOne({
                    where: {
                        id: exercise.exerciseSetId
                    }
                }).then(function (set) {
                    if(Object.keys(set).length !== 0) {
                        models.injury.findOne({
                            where: {
                                id: set.injuryId
                            }
                        }).then(function (injury) {
                            if(Object.keys(injury).length !== 0) {
                                if(decoded.id == injury.patientId) {
                                    models.exerciseCompletion.create({
                                        dateCompleted: req.body.dateCompleted //TODO: calculate the date on the server?
                                    }).then(function (comp) {  //TODO: ALSO: handle when incorrect numbers are inputted
                                        if(Object.keys(comp).length !== 0) {
                                            return res.json(comp);
                                        }
                                    })
                                } else {
                                    return res.status(401).send('Patient unauthorized');
                                }
                            }
                        }).catch(function (err) {
                            return next(err);
                        })
                    }
                }).catch(function (err) {
                    return next(err);
                })
            } else {
                return res.status(404).send('No exercises with that id');
            }
        }).catch(function (err) {
            return next(err);
        })
    } else {
        return res.status(401).send('PTs unauthorized');
    }

};


/**

 READ (HTTP GET)

 */

// TODO: implement audit logging by querying all the way down to patient level..
module.exports.getCompletions = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exerciseCompletion.findAll({
        where: {
            exerciseId: req.params.id
        }
    }).then(function (comps) {
        if(comps.length !== 0) {
            var firstComp = comps[0];

            models.exercise.findOne({
                where: {
                    id: firstComp.exerciseId
                }
            }).then(function (exercise) {
                console.log(exercise);
                if(Object.keys(exercise).length !== 0) {
                    models.exerciseSet.findOne({
                        where: {
                            id: exercise.exerciseSetId
                        }
                    }).then(function (set) {
                        console.log(set);
                        if(Object.keys(set).length !== 0) {
                            if(decoded.isPt) {
                                if(decoded.id == set.ptId) {
                                    return res.json(comps);
                                } else {
                                    return res.status(401).send('PT unauthorized');
                                }
                            }
                            // is patient
                            else {
                                if(!decoded.isPt) {
                                    models.injury.findOne({
                                        where: {
                                            id: set.injuryId
                                        }
                                    }).then(function (injury) {
                                        console.log(injury);
                                        if(Object.keys(injury).length !== 0) {
                                            if(decoded.id == injury.patientId) {
                                                return res.json(comps);
                                            } else {
                                                return res.status(401).send('Patient unauthorized');
                                            }
                                        }
                                    })
                                }
                            }
                        }

                    })
                }

            })
        } else {
            res.status(404).send('No stats associated with that exercise');
        }
    })
};



module.exports.getCompletionById = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exerciseCompletion.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(comp) {
        if(Object.keys(comp).length !== 0) {
            models.exercise.findOne({
                where: {
                    id: comp.exerciseId
                }
            }).then(function (exercise) {
                if(Object.keys(exercise).length !== 0) {
                    models.exerciseSet.findOne({
                        where: {
                            id: exercise.exerciseSetId
                        }
                    }).then(function (set) {
                        if(Object.keys(set).length !== 0) {
                            if(decoded.isPt) {
                                if(decoded.id == set.ptId) {
                                    return res.json(comp);
                                } else {
                                    return res.status(401).send('PT unauthorized');
                                }

                            }
                            // is patient
                            else {
                                models.injury.findOne({
                                    where: {
                                        id: set.injuryId
                                    }
                                }).then(function (injury) {
                                    if(Object.keys(injury).length !== 0) {
                                        if(decoded.id == injury.patientId) {
                                            return res.json(comp);
                                        } else {
                                            return res.status(401).send('Patient unauthorized');
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
        else {
            res.status(404).send('No stats associated with that exercise');
        }
    }).catch(function (err) {
        return next(err);
    })
};



/**

 UPDATE (HTTP PUT)

 */

// TODO

/**

 DELETE (HTTP DELETE)

 */


module.exports.deleteCompletion = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exerciseCompletion.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (comp) {
        if(Object.keys(comp).length !== 0) {
            models.exercise.findOne({
                where: {
                    id: comp.exerciseId
                }
            }).then(function (exercise) {
                if(Object.keys(exercise).length !== 0) {
                    models.exerciseSet.findOne({
                        where: {
                            id: exercise.exerciseSetId
                        }
                    }).then(function (set) {
                        if(Object.keys(set).length !== 0) {
                            models.injury.findOne({
                                where: {
                                    id: set.injuryId
                                }
                            }).then(function (injury) {
                                if(Object.keys(injury).length !== 0) {
                                    if(!decoded.isPt && decoded.id == injury.patientId) {
                                        comp.destroy();
                                        return res.json(comp);
                                    } else {
                                        return res.status(401).send('Patient unauthorized');
                                    }
                                }
                            })
                        }

                    })
                }
            })
        } else {
            res.status(404).send('No exercise with that id');
        }
    }).catch(function (err) {
        return next(err);
    })
};
