

var models = require('../models/index');

var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];


/**

 CREATE (HTTP POST)
 assumes pt is only one hitting this route

 **/

module.exports.createInjury = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.patient.findOne({
        where : {
            id: req.params.id
        }
    }).then(function(patient) {
        if (Object.keys(patient).length !== 0) {
            // check the requesting pt has permission to view this patient
            // console.log(patient.ptId);
            // console.log(decoded.id);
            // console.log(patient.ptId === decoded.id);
            // console.log(patient.ptId == decoded.id);


            if(patient.ptId === decoded.id) {
                models.injury.create({
                    name: req.body.name,
                    injuryFromSurgery: req.body.injuryFromSurgery,
                    patientId: req.params.id
                }).then(function(injury) {
                    if(Object.keys(injury).length !== 0) {
                        res.json(injury);
                        return next();

                    }
                    else {
                        res.status(404).send('Could not create that injury')
                    }
                }).catch(function(err) {
                    return next(err);
                })
            }
            else {
                res.status(404).send('No patient with that id');
            }
        }

    }).catch(function(err) {
        return next(err);
    })
}


/**

 READ (HTTP GET)
 checks pt, patient

 **/

// TODO: figure out what to return when patients object below is []
module.exports.getInjuries = (req, res, next) => {
    console.log('getting injury');
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.injury.findAll({
        where: {
            patientId: req.params.id
        }

    }).then(function(injuries) {
        if(injuries.length !== 0)
        {
            // if pt
            if(decoded.isPt) {
                // query using req.params.id (which is the patients' id) and check patient.ptId === decoded.id
                models.patient.findOne({
                    where : {
                        id: req.params.id
                    }
                }).then(function(patient) {
                     if(Object.keys(patient).length !== 0)
                     {
                        if (patient.ptId === decoded.id) {
                            // return the injuries!
                            req.body.patientId = req.params.id;
                            res.json(injuries);
                            return next();
                        }
                        else {
                            res.status(401).send('Unauthorized');
                        }
                     }
                     else
                     {
                         res.status(404).send('no pat found');
                     }
                }).catch(function(err) {
                    return next(err);
                })
            }
            else {
                if(decoded.id == req.params.id) {
                    return res.json(injuries);
                }
                else {
                    res.status(403).send('Unauthorized');
                }
            }
        }
        else
        {
            res.status(404).send('Sorry no injuries found');
        }
    });
};



module.exports.getInjuryById = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.injury.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(injury) {
        if(Object.keys(injury).length !== 0) {
            // if patient...check injury.patientId === decoded.id
            if (!decoded.isPt) {
                if (injury.patientId == decoded.id) {
                    return res.json(injury);
                } else {
                    res.status(401).send('Patients are unauthorized to see injuries of others');
                }
            }
            // if pt...find patient where id=injury.patientId
            else {
                models.patient.findOne({
                    where: {
                        id : injury.patientId
                    }
                }).then(function(patient) {
                    if (Object.keys(patient).length !== 0) {
                        if (patient.ptId == decoded.id) {
                            req.body.patientId = patient.id || injury.patientId;
                            res.json(injury);
                            return next();
                        } else {
                            res.status(401).send('PTs are unauthorized to see injuries of patients who are not their own');
                        }
                    } else {
                        res.status(404).send('No patient with that injury');
                    }
                }).catch(function(err) {
                    return next(err);
                })
            }
        } else {
            res.status(404).send('No injury with that Id');
        }
    }).catch(function(err) {
        return next(err);
    })
};


/**

 UPDATE (HTTP PUT)

 */

// TODO

/**

 DELETE (HTTP DELETE) - check the requesting pt has permission to delete


 */

module.exports.deleteInjury = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.injury.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (injury) {
        if(Object.keys(injury).length !== 0) {
            models.patient.findOne({
                where: {
                    id: injury.patientId
                }
            }).then(function (patient) {
                if(Object.keys(patient).length !== 0) {
                    // check requesting pt is authorized to delete!
                    if(patient.ptId == decoded.id) {
                        injury.destroy();
                        res.json(injury);
                        return next();
                    } else {
                        res.status(401).send('PT unauthorized to delete that injury');
                    }
                }
            }).catch(function (err) {
                return next(err);
            })
        }
    }).catch(function(err) {
        next(err);
    })


}

