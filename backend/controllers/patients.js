/**

    dependencies

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


module.exports.createPatient = (req, res, next) => {
    if(auth.checkRequestIdAgainstId(req, res)) {
        // TODO: send email to patient, update fields, route them same way the forgot password works?
        // TODO: make sure that no pt has the same email as the patient
        models.pt.findAll({
            where: {
                email: req.body.email
            }
        }).then(function (user) {
            if(Object.keys(user).length !== 0) {
                res.status(405).send('sorry that email is taken');
            } else {
                models.patient.create({
                    name: req.body.name,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    phoneProvider: req.body.phoneProvider,
                    surgeryType: req.body.surgeryType,
                    isRestrictedFromRom: req.body.isRestrictedFromRom,
                    age: req.body.age,
                    weight: req.body.weight,
                    ptId: req.params.id,
                    hash: models.patient.generateHash(req.body.hash) // add hash and token
                }).then(function(patient) {
                    res.json(patient);
                    return next();
                }).catch(function (err) {
                    return next(err);
                })
            }
        }).catch(function (err) {
            return next(err);
        })
    }
    return;
};


/**

    READ (HTTP GET)

 */


// TODO: figure out what to return when patients object below is []
module.exports.getPatients = (req, res, next) => {

    if(auth.checkRequestIdAgainstId(req, res)) {

        models.patient.findAll({
            where: {
                ptId: req.params.id
            }

        }).then(function(patients) {
            res.json(patients);
            var pIds = [];
            for (var p in patients) {
                pIds.push(patients[p].id);
            }
            req.body.patientIds = pIds;
            return next();
        }).catch(function (e) {
            return next(e);
        })
    }
};

// not to be used in actual app, unless for an admin
module.exports.getAllPatients = (req, res, next) => {
    models.patient.findAll({}).then(function(patients) {
        res.json(patients);
    });
};
/*
module.exports.getPatientById = (req, res, next) => {
    models.patient.findone({
        where: {id: req.params.id}
    }).then(function(patient) {
        return res.json(patient);
    });
};
*/


module.exports.getPatientById = (req, res, next) => {
    // auth
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.patient.findOne({
        where: {id: req.params.id}
    }).then(function(patient) {
        // auth is done here so only one query
        // pt and patient alike have access
  
        // if pt
        if (decoded.isPt) {
            // if requesting pt is requested patient's pt
            if (decoded.id == patient.ptId) { // should be === ?
                req.body.patientId = patient.id;
                res.json(patient);
                return next();
            }  
            else {
                return res.status(401).send('You are not authorized to see this resource');
            }
        }
        // else if patient
        else {
            // if requesting patient is requested patient
            if (decoded.id == req.params.id) { // should be === ?
                return res.json(patient);
            } 
            else {
                return res.status(401).send('You are not authorized to see this resource');
            }        
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

    DELETE (HTTP DELETE)

 */

module.exports.deletePatient = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.patient.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (patient) {
        if (patient.length !== 0)
        {
            console.log(patient.length);
            console.log(patient.ptId);
            // if pt
            if (decoded.isPt) {
                // if requesting pt is requested patient's pt
                if (decoded.id === patient.ptId) {
                    // DESTROY IF THIS IS THE CASE
                    patient.destroy();
                    res.json(patient);
                    return next();
                    // return res.json(patient);
                }
                else {
                    return res.status(401).send('You are not authorized to destroy this resource');
                }
            }
        }
        else
            res.status(404).send('Sorry not found');
    }).catch(function(err) {
        return next(err);
                        // doesn't quite catch error how we would want? still get:
                            // Error: No default engine was specified and no extension was provided.
    });
    // })


};

