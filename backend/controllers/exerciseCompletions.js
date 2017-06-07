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

                            mostRecent = mostRecent - 1;

                            if(today - mostRecent === 1)  // TODO: does this work?
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
                                            return res.status(404).send('could not create');
                                        }
                                    }).catch(function (err) {
                                        return next(err);
                                    })
                                }).catch(function (err) {
                                    return next(err);
                                })
                            }
                            // else // TODO: still need to create the completion even if there isn't a streak..


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
                                req.body.patientId = pat.id;
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
            res.json({});
        }
    }).catch(function (err) {
        return next(err);
    })
};

