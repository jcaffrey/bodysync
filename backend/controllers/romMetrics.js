
var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

module.exports.createRomMetric = (req, res, next) => {
    models.romMetric.create({
        name: req.body.name,
        endRangeGoal: req.body.endRangeGoal,
        startRange: req.body.startRange,
        injuryId: req.params.id
    }).then(function(rom) {
        res.json(rom);
    });
};

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
                                return res.json(roms);
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


// TODO error catching
// module.exports.getRomMetrics = (req, res, next) => {
//     console.log('getting all rom metrics');
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//     console.log(req.params.id);
//
//     models.romMetric.findAll({
//         where: {
//             injuryId: req.params.id
//         }
//     }).then(function(roms) {
//         //console.log(roms);
//         res.json(roms);
//         if(roms.length !== 0) {
//             // check the injuryId of each romMetric
//             roms = roms[0];  // assumes all roms have the same injuryId (which they will)
//             console.log(roms.injuryId);
//             models.injury.findOne({
//                 where: {
//                     id: roms.injuryId
//                 }
//             }).then(function (injury) {
//                 if(Object.keys(injury).length !== 0) {
//                     if(!decoded.isPt) {
//                         // if patient
//                         if(decoded.id == injury.patientId) {
//                             return res.json(roms);
//                         } else {
//                             return res.status(401).send('Patient unauthorized');
//                         }
//                     }
//                 }
//                 // is pt
//                 else {
//                     models.patient.findOne({
//                         where: {
//                             id: injury.patientId
//                         }
//                     }).then(function (patient) {
//                         if(Object.keys(patient).length !== 0) {
//                             if(decoded.id == patient.ptId) {
//                                 return res.json(roms);
//                             } else {
//                                 return res.status(401).send('PT unauthorized');
//                             }
//                         }
//                     })
//                 }
//             })
//         }
//
//
//         //     if(!decoded.isPt) {
//         //         models.injury.findOne({
//         //             where: {
//         //                 id: req.params.id
//         //             }
//         //         }).then(function(injury) {
//         //             if(Object.keys(injury).length !== 0) {
//         //                 if (decoded.id == injury.patientId) {
//         //                     return res.json(roms);
//         //                 } else {
//         //                     res.status(401).send('Patient unauthorized');
//         //                 }
//         //             }
//         //         }).catch(function (err) {
//         //             return next(err);
//         //         })
//         //     }
//         //     // is pt
//         //     else {
//         //         models.patient.findOne({
//         //             where: {
//         //                 id:
//         //             }
//         //         })
//         //     }
//         //
//         // }
//     });
// };


module.exports.getRomMetricById = (req, res, next) => {
    models.romMetric.findAll({
        where: {
            id: req.params.id
        }
    }).then(function(rom) {
        res.json(rom);
    });
};


module.exports.deleteRomMetric = (req, res, next) => {
    models.romMetric.destroy({
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
