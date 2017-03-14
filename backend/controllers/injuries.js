

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
            if(patient.ptId === decoded.id) {
                models.injury.create({
                    name: req.body.name,
                    injuryFromSurgery: req.body.injuryFromSurgery,
                    patientId: req.params.id
                }).then(function(injury) {
                    if(Object.keys(injury).length !== 0) {
                        res.json(JSON.stringify(injury));
                    }
                    else {
                        res.status(404).send('Could not create that injury')
                    }
                }).catch(function(err) {
                    return next(err);
                })
            }
        }
        else {
            res.status(404).send('No patient with that id');
        }
    }).catch(function(err) {
        return next(err);
    })


};


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
            PatientId: req.params.id
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
                    if(patient.ptId === decoded.id) {
                        // return the injuries!
                        res.json(injuries);
                    }
                    else {
                        res.status(401).send('Unauthorized');
                    }
                }).catch(function(err) {
                    return next(err);
                })
            }
            else {
                if(decoded.id === req.params.id) {
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
    models.injury.findAll({
        where: {
            id: req.params.id
        }
    }).then(function(inj) {
        res.json(inj);
    });
};


/**

 UPDATE (HTTP PUT)

 */

// TODO

/**

 DELETE (HTTP DELETE)

 */


module.exports.deleteInjury = (req, res, next) => {
    models.injury.destroy({
        where: {
            id: req.params.id
        }
    }).then(function(instance) {
        if (instance)
            res.sendStatus(200);
        else
            res.status(404).send('sorry not found');
    });
}

