var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

// exercise set name will be abstracted to the injury name +'exercise set'. so that it reads ACL Tear Exercise Set

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
                        return res.json(exercise);
                        //return next();
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

                        if(pat.ptId == decoded.id)
                        {
                            return res.json(exercises);

                        }
                        else
                        {
                            // next();
                            return res.status(403).send('not authorized for that');
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
                    return res.json(exercises);
                    // res.json(exercises);
                    // return next();
                }
                else
                {
                    //next();
                    return res.status(403).send('not authorized for that');
                }
            }

        }
        else {
            return res.json([]); // make sure that the session is still logged here even though no data to read?
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
                return res.json(exer);
                //return next();
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
                        return res.json(exercise);
                        //return next();
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