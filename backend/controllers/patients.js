/**
 * Created by hsadev2 on 2/21/17.
 */

var models = require('../models/index');

module.exports.createPatient = (req, res, next) => {
    models.patient.create({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        phoneProvider: req.body.phoneProvider,
        surgeryType: req.body.surgeryType,
        ptId: req.params.id,
        hash: this.generateHash(req.body.hash) // add hash and token
    }).then(function(patient) {
        res.json(patient);
    });
};

// TODO: figure out what to return when patients object below is []
module.exports.getPatients = (req, res, next) => {
    models.patient.findAll({
        where: {
            ptId: req.params.id
        }

    }).then(function(patients) {
        res.json(patients);
    });
};

// not to be used in actual app, unless for an admin
module.exports.getAllPatients = (req, res, next) => {
    models.patient.findAll({}).then(function(patients) {
        res.json(patients);
    });
};


module.exports.getPatientById = (req, res, next) => {
    models.patient.findAll({
        where: {
            id: req.params.id
        }
    }).then(function(pt) {
        res.json(pt);
    });
};


module.exports.deletePatient = (req, res, next) => {
    models.patient.destroy({
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

