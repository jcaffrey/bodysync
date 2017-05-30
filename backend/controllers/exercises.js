/**
 * Created by hsadev2 on 3/15/17.
 */

var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

// exercise set name will be abstracted to the injury name +'exercise set'. so that it reads ACL Tear Exercise Set
module.exports.createExercises = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);


    models.patient.findOne({where: {id: req.params.id}}).then(function (pat) {
        if(Object.keys(pat).length !== 0)
        {
            if(decoded.id == pat.ptId)
            {
                var data = [];
                for(exerciseObj in req.body)  // TODO FRONTEND -  pass the request data in req.body.exercises
                {

                    if(req.body[exerciseObj].name && req.body[exerciseObj].numRepsOrDuration && req.body[exerciseObj].numSets)
                    {
                        data.push({
                            name: req.body[exerciseObj].name,
                            numRepsOrDuration: req.body[exerciseObj].numRepsOrDuration,
                            numSets: req.body[exerciseObj].numSets,
                            ptNotes: req.body[exerciseObj].ptNotes,
                            patientId: req.params.id
                        })
                    }

                }

                if(data.length !== 0)
                {
                    models.exercise.bulkCreate(data).then(function () {
                        models.exercise.findAll({where: {patientId: req.params.id}}).then(function(exercises) {
                            if(exercises.length !== 0)
                            {
                                res.json(exercises);
                                return next();
                            }
                        }).catch(function(err) {
                            console.log('something weird')
                            return next(err);
                        })
                    }).catch(function(err) {
                        console.log('failed to create')
                        return next(err);
                    })
                }
                else
                {
                    return res.status(400).send('please include all required fields');
                }
            }
            else
            {
                return res.status(403).send('not authorized to do that');
            }
        }
        else
        {
            return res.status(404).send('no such patient exists');
        }
    }).catch(function (err) {
        return next(err);
    })

};

module.exports.createExercise = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);


    models.patient.findOne({where: {id: req.params.id}}).then(function (pat) {
        if(Object.keys(pat).length !== 0)
        {
            if(decoded.id == pat.ptId)
            {
                models.exercise.create({
                    name: req.body.name,
                    numRepsOrDuration: req.body.numRepsOrDuration,
                    numSets: req.body.numSets,
                    ptNotes: req.body.ptNotes,
                    patientId: req.params.id
                }).then(function (exercise) {
                    if(Object.keys(exercise).length !== 0)
                    {
                        res.json(exercise);
                        return next();
                    }
                    else
                    {
                        return res.status(404).send('could not create exercise. try again later.');
                    }
                }).catch(function(err) {
                    console.log('failed to create')
                    return next(err);
                })
            }
            else
            {
                return res.status(403).send('not authorized to do that');
            }
        }
        else
        {
            return res.status(404).send('no such patient exists');
        }
    }).catch(function (err) {
        return next(err);
    })
}


module.exports.getExercises = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);


    models.exercise.findAll({where: {patientId: req.params.id}}).then(function (exercises) {
        if(exercises.length !== 0)
        {
            // verify ids match (for pt and patient)
            if(decoded.isPt)
            {
                models.patient.findOne({where:{id: req.params.id}}).then(function(pat) {
                    if(Object.keys(pat).length !== 0)
                    {
                        console.log('PRINTING PAT ptId')
                        console.log(pat.ptId);
                        console.log(decoded.id);
                        if(pat.ptId == decoded.id)
                        {
                            res.json(exercises);
                            return next();
                        }
                        else
                        {
                            next();
                            res.status(403).send('not authorized for that');
                        }
                    }
                }).catch(function(err) {
                    console.log('failed to find')
                    return next(err);
                })
            }
            else
            {
                if(decoded.id == req.params.id)
                {
                    res.json(exercises);
                    return next();
                }
                else
                {
                    next();
                    res.status(403).send('not authorized for that');
                }
            }

        }
        else {
            res.json({}); // make sure that the session is still logged here even though no data to read?
        }
    }).catch(function(err) {
        console.log('failed to find')
        return next(err);
    })

};

module.exports.updateExercise = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    if(decoded.isPt)
    {
        models.exercise.findOne({
            where : {
                id: req.params.id
            }
        }).then(function(exer) {
            if(Object.keys(exer).length !== 0)
            {
                exer.name = req.body.name || exer.name;
                exer.numSets = req.body.numSets || exer.numSets;
                exer.numRepsOrDuration = req.body.numRepsOrDuration || exer.numRepsOrDuration;
                exer.ptNotes = req.body.ptNotes || exer.ptNotes;

                exer.save().then(()=>{});
                res.json(exer);
                return next();
            }
            else
            {
                return res.status(404).send('no exer with that id');
            }
        }).catch(function (err) {
            return next(err);
        })
    }
    else
    {
        return res.status(403).send('not authorized');
    }
};

// module.exports.updateExercises = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     // TODO frontend is going to need to pass in the original exercises and the corresponding updates in req.body
//     // check pt has permissions for each attempted update
//     // loop through all exercise pairs.
//     // find original exercise
//     // update that exercise
//
//     // data should be in the form:
//     //{"exerciseData":[{"id":"3","name": "orignalName", "numSets": "2", "numRepsOrDuration":"30", "ptNotes":"originalNotes","newName":"updateOrignalName","newNumSets":"3","newNumRepsOrDuration":"60","newPtNotes":"these are the new notes"},{"id":"4","name": "orignalNameTWO", "numSets": "2", "numRepsOrDuration":"30", "ptNotes":"originalNotesTWO","newName":"updateOrignalNameTWO","newNumSets":"3","newNumRepsOrDuration":"60","newPtNotes":"these are the new notesTWO"}]}
//     //[{"id":"3","name": "orignalName", "numSets": "2", "numRepsOrDuration":"30", "ptNotes":"originalNotes","newName":"updateOrignalName","newNumSets":"3","newNumRepsOrDuration":"60","newPtNotes":"these are the new notes"},{"id":"4","name": "orignalNameTWO", "numSets": "2", "numRepsOrDuration":"30", "ptNotes":"originalNotesTWO","newName":"updateOrignalNameTWO","newNumSets":"3","newNumRepsOrDuration":"60","newPtNotes":"these are the new notesTWO"},{"id":"5","name": "orignalName", "numSets": "2", "numRepsOrDuration":"30", "ptNotes":"originalNotes"}]
//
//     var data
//     for(var i = 0; i < req.body.exerciseData.length; i++)
//     {
//
//     }
//
//
// }

// /**
//
//  CREATE (HTTP POST)
//
//  */
// module.exports.createExercise = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     models.exerciseSet.findOne({
//         where: {
//             id: req.params.id
//         }
//     }).then(function(set) {
//         if(Object.keys(set).length !== 0) {
//             models.injury.findOne({
//                 where: {
//                     id: set.injuryId
//                 }
//             }).then(function (injury) {
//                 if(Object.keys(injury).length !== 0){
//                     models.patient.findOne({
//                         where: {
//                             id: injury.patientId
//                         }
//                     }).then(function (patient) {
//                         if(Object.keys(patient).length !== 0) {
//                             if(decoded.isPt && decoded.id == patient.ptId) {
//                                 // create !
//                                 console.log(patient.id);
//                                 models.exercise.create({
//                                     name: req.body.name,
//                                     numRepsOrDuration: req.body.numRepsOrDuration,
//                                     numSets: req.body.numSets,
//                                     dayOfNextGoal: req.body.dayOfNextGoal,
//                                     assignedFrequency: req.body.assignedFrequency,
//                                     assignedDuration: req.body.assignedDuration,
//                                     dateAssigned: req.body.dateAssigned,
//                                     ptNotes: req.body.ptNotes,
//                                     mediaUrl: req.body.mediaUrl,
//                                     exerciseSetId: req.params.id
//                                 }).then(function (exercise) {
//                                     if(Object.keys(exercise).length !== 0){
//                                         res.json(exercise);
//                                         return next();
//                                     }
//                                     else {
//                                         res.status(500).send('Could not create');
//                                     }
//                                 }).catch(function (err) {
//                                     // console.error(err.stack);
//                                     return next(err);
//                                 })
//                             } else {
//                                 res.status(401).send('Unauthorized');
//                             }
//                         } else {
//                             res.status(404).send('No patient with that injury');
//                         }
//
//                     }).catch(function (err) {
//                         return next(err);
//                     })
//                 } else {
//                     res.status(404).send('No injury with that rom');
//                 }
//
//             }).catch(function (err) {
//                 return next(err);
//             })
//         } else {
//             res.status(404).send('No ROM with that id');
//         }
//     }).catch(function (err) {
//         return next(err);
//     })
// }
//
// /**
//
//  READ (HTTP GET)
//
//  */
//
// // NOTE: this could be done more efficiently..update!. set holds the ptId. don't need to query patient
// module.exports.getExercises = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     models.exercise.findAll({
//         where: {
//             exerciseSetId: req.params.id
//         }
//     }).then(function(exercises) {
//         if(exercises.length !== 0) {
//             var firstExercise = exercises[0]
//
//             models.exerciseSet.findOne({
//                 where: {
//                     id: firstExercise.exerciseSetId
//                 }
//             }).then(function (set) {
//                 if(Object.keys(set).length !== 0) {
//                     models.injury.findOne({
//                         where: {
//                             id: set.injuryId
//                         }
//                     }).then(function (injury) {
//                         if(Object.keys(injury).length !== 0) {
//                             // check patient-level flag
//                             models.patient.findOne({
//                                 where: {
//                                     id: injury.patientId
//                                 }
//                             }).then(function (patient) {
//                                 if(Object.keys(patient).length !== 0) {
//                                     if(!decoded.isPt) {
//                                         if(!patient.isRestrictedFromRom || patient.id == decoded.id) {
//                                             return res.json(exercises);
//                                         } else {
//                                             res.status(401).send('Patient unauthorized');
//                                         }
//                                     }
//                                     // is pt
//                                     else {
//                                         if(decoded.id == patient.ptId) {
//                                             req.body.patientId = patient.id || injury.patientId;
//                                             res.json(exercises);
//                                             return next();
//                                         }
//                                         else {
//                                             res.status(401).send('PT unauthorized');
//                                         }
//                                     }
//                                 }
//                             }).catch(function (err) {
//                                 return next(err);
//                             })
//                         }
//                     }).catch(function (err) {
//                         return next(err);
//                     })
//                 }
//             }).catch(function (err) {
//                 return next(err);
//             })
//         } else {
//             res.status(404).send('No Measures for that RomMetric');
//         }
//     }).catch(function (err) {
//         return next(err);
//     })
// }
//
// // TODO: implement audit logging by querying all the way down to patient level..
// module.exports.getExerciseById = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     models.exercise.findOne({
//         where: {
//             id: req.params.id
//         }
//     }).then(function (exercise) {
//         if(Object.keys(exercise).length !== 0) {
//             models.exerciseSet.findOne({
//                 where: {
//                     id: exercise.exerciseSetId
//                 }
//             }).then(function (set) {
//                 if(Object.keys(set).length !== 0) {
//                     if(decoded.isPt) {
//                         if (decoded.id == set.ptId) {
//                             return res.json(exercise);
//                         } else {
//                             return res.status(401).send('PT unauthorized');
//                         }
//                     }
//                     // is patient
//                     else {
//                         models.injury.findOne({
//                             where: {
//                                 id: set.injuryId
//                             }
//                         }).then(function (injury) {
//                             if(Object.keys(injury).length !== 0) {
//                                 if(!decoded.isPt && decoded.id == injury.patientId) {
//                                     return res.json(exercise);
//                                 } else {
//                                     return res.status(401).send('Patient unauthorized');
//                                 }
//                             }
//                         })
//                     }
//                 }
//
//             })
//         }
//     }).catch(function (err) {
//         return next(err);
//     })
// }
//
// /**
//
//  UPDATE (HTTP PUT)
//
//  */
//
// // TODO
//
// /**
//
//  DELETE (HTTP DELETE)
//
//  */
//
//
module.exports.deleteExercise = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exercise.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (exercise) {
        if(Object.keys(exercise).length !== 0) {
            models.patient.findOne({
                where: {
                    id: exercise.patientId
                }
            }).then(function (pat) {
                if(Object.keys(pat).length !== 0) {
                    if(decoded.isPt && decoded.id == pat.ptId) {
                        exercise.destroy();
                        res.json(exercise);
                        return next();
                    } else {
                        return res.status(401).send('PT unauthorized');
                    }
                }
            }).catch(function (err) {
                return next(err);
            })
        } else {
            res.status(404).send('No exercise with that id');
        }
    }).catch(function (err) {
        return next(err);
    })
}