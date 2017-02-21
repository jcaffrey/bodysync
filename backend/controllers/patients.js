/**
 * Created by hsadev2 on 2/21/17.
 */

var models = require('../models/index');

module.exports.createPatient = (req, res, next) => {
    models.Patient.create({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        phoneProvider: req.body.phoneProvider, // add hash and token
        surgeryType: req.body.surgeryType,
        PTId: req.params.id
    }).then(function(patient) {
        res.json(patient);
    });
};

// TODO: figure out what to return when patients object below is []
module.exports.getPatients = (req, res, next) => {
    models.Patient.findAll({
        where: {
            PTId: req.params.id
        }

    }).then(function(patients) {
        res.json(patients);
    });
};
