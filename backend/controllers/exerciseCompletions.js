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

    if(!decoded.isPt)  // only patients can post exercise completions
    {
        models.exercise.findOne({where: {id: req.params.id}}).then(function(exer) {
            if(Object.keys(exer).length !== 0)
            {
                // check if patient is authorized
                if(decoded.id == exer.patientId)
                {
                    models.exerciseCompletion.findAll({
                        where:{
                            exerciseId:req.params.id
                        },
                        order: [
                            ['createdAt', 'DESC']
                        ]
                    }).then(function (comps) {
                        if(comps.length !== 0)
                        {
                            // update streak here if most recent comp is within one day of now

                            var today = new Date().getDate();


                            var mostRecent = new Date(comps[0].createdAt).getDate();


                            // ONLY TO TEST...
                            console.log(typeof mostRecent)
                            mostRecent = mostRecent - 1;

                            console.log('mostRecent day' + mostRecent)
                            console.log('todays day' + today)

                            if(today - mostRecent === 1)
                            {
                                // update the streak
                                console.log('type of exer.streak is ' + typeof exer.streak)
                                exer.streak = exer.streak + 1;
                                exer.save().then(function () {
                                    // post completion if so
                                    models.exerciseCompletion.create({
                                        painInput: req.body.painInput,
                                        exerciseId: req.params.id
                                    }).then(function (comp) {
                                        if(Object.keys(comp).length !== 0)
                                        {
                                            res.json(comp);
                                            return next();
                                        }
                                        else
                                        {
                                            throw new Error('could not create');
                                        }
                                    }).catch(function (err) {
                                        return next(err);
                                    })
                                })
                            }


                        }
                        else
                        {
                            // we are creating the first comp so set the streak to 1!
                            exer.streak = 1
                            exer.save().then(function () {
                                // post completion if so
                                models.exerciseCompletion.create({
                                    painInput: req.body.painInput,
                                    exerciseId: req.params.id
                                }).then(function (comp) {
                                    if(Object.keys(comp).length !== 0)
                                    {
                                        res.json(comp);
                                        return next();
                                    }
                                    else
                                    {
                                        throw new Error('could not create');
                                    }
                                }).catch(function (err) {
                                    return next(err);
                                })
                            })
                        }
                    }).catch(function (err) {
                        return next(err);
                    })


                }
                else
                {
                    return res.status(403).send('not authorized to do that')
                }
            }
            else
            {
                return res.status(404).send('no such exer exists');
            }
        }).catch(function (err) {
            return next(err);
        })
    }
    else
    {
        return res.status(403).send('not authorized to do that')
    }
};


/**

 READ (HTTP GET)

 */

// module.exports.getCompletions = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//
//     models.exercise.findOne({where:{id:req.params.id}}).then(function(exer) {
//         if(Object.keys(exer).length !== 0)
//         {
//             models.exerciseCompletion.findAll({where:{exerciseId:exer.id}}).then(function (comps) {
//                 if(comps.length !== 0)
//                 {
//                     return res.json(comps);
//                 }
//             }).catch(function (err) {
//                 return next(err);
//             })
//         }
//     }).catch(function (err) {
//         return next(err);
//     })
// }

module.exports.getMostRecentCompletion = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.exerciseCompletion.findAll({
        where: {
            exerciseId: req.params.id
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(function (comps) {
        if(comps.length !== 0)
        {
            var mostRecent = comps[0];
            models.exercise.findOne({where:{id:req.params.id}}).then(function (exer) {
                if(Object.keys(exer).length !== 0)
                {
                    if(!decoded.isPt)
                    {
                        if(decoded.id == exer.patientId)
                        {
                            res.json(mostRecent);
                            return next();
                        }
                        else
                        {
                            return res.status(403).send('not auth');
                        }
                    }
                    models.patient.findOne({where:{id: exer.patientId}}).then(function (pat) {
                        if(Object.keys(pat).length !== 0)
                        {
                            if(decoded.id == pat.ptId)
                            {
                                res.json(mostRecent);
                                return next();
                            }
                            else
                            {
                                return res.status(403).send('not auth');
                            }
                        }
                    }).catch(function (err) {
                        return next(err);
                    })
                }
                else
                {
                    return res.status(404).send('not found');
                }
            }).catch(function (err) {
                return next(err);
            })
        }
        else
        {
            return res.status(404).send('not found');
        }
    }).catch(function (err) {
        return next(err);
    })
};

// module.exports.getCompletionById = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     models.exerciseCompletion.findOne({
//         where: {
//             id: req.params.id
//         }
//     }).then(function(comp) {
//         if(Object.keys(comp).length !== 0) {
//             models.exercise.findOne({
//                 where: {
//                     id: comp.exerciseId
//                 }
//             }).then(function (exercise) {
//                 if(Object.keys(exercise).length !== 0) {
//                     models.exerciseSet.findOne({
//                         where: {
//                             id: exercise.exerciseSetId
//                         }
//                     }).then(function (set) {
//                         if(Object.keys(set).length !== 0) {
//                             if(decoded.isPt) {
//                                 if(decoded.id == set.ptId) {
//                                     return res.json(comp);
//                                 } else {
//                                     return res.status(401).send('PT unauthorized');
//                                 }
//
//                             }
//                             // is patient
//                             else {
//                                 models.injury.findOne({
//                                     where: {
//                                         id: set.injuryId
//                                     }
//                                 }).then(function (injury) {
//                                     if(Object.keys(injury).length !== 0) {
//                                         if(decoded.id == injury.patientId) {
//                                             return res.json(comp);
//                                         } else {
//                                             return res.status(401).send('Patient unauthorized');
//                                         }
//                                     }
//                                 })
//                             }
//                         }
//                     })
//                 }
//             })
//         }
//         else {
//             res.status(404).send('No stats associated with that exercise');
//         }
//     }).catch(function (err) {
//         return next(err);
//     })
// }

/**

 UPDATE (HTTP PUT)

 */

// TODO

/**

 DELETE (HTTP DELETE)

 */

// module.exports.deleteCompletion = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     models.exerciseCompletion.findOne({
//         where: {
//             id: req.params.id
//         }
//     }).then(function (comp) {
//         if(Object.keys(comp).length !== 0) {
//             models.exercise.findOne({
//                 where: {
//                     id: comp.exerciseId
//                 }
//             }).then(function (exercise) {
//                 if(Object.keys(exercise).length !== 0) {
//                     models.exerciseSet.findOne({
//                         where: {
//                             id: exercise.exerciseSetId
//                         }
//                     }).then(function (set) {
//                         if(Object.keys(set).length !== 0) {
//                             models.injury.findOne({
//                                 where: {
//                                     id: set.injuryId
//                                 }
//                             }).then(function (injury) {
//                                 if(Object.keys(injury).length !== 0) {
//                                     if(!decoded.isPt && decoded.id == injury.patientId) {
//                                         comp.destroy();
//                                         return res.json(comp);
//                                     } else {
//                                         return res.status(401).send('Patient unauthorized');
//                                     }
//                                 }
//                             })
//                         }
//
//                     })
//                 }
//             })
//         } else {
//             res.status(404).send('No exercise with that id');
//         }
//     }).catch(function (err) {
//         return next(err);
//     })
// }