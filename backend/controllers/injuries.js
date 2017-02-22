/**
 * Created by joeyc on 2/22/17.
 */

/**
 * Created by hsadev2 on 2/21/17.
 */

var models = require('../models/index');

module.exports.createInjury = (req, res, next) => {
    models.Injury.create({
        name: req.body.name,
        injuryFromSurgery: req.body.injuryFromSurgery,
        PatientId: req.params.id
    }).then(function(injury) {
        res.json(injury);
    });
};

// TODO: figure out what to return when patients object below is []
module.exports.getInjuries = (req, res, next) => {
    models.Injury.findAll({
        where: {
            PatientId: req.params.id
        }

    }).then(function(injuries) {
        res.json(injuries);
    });
};


module.exports.getInjuryById = (req, res, next) => {
    models.Injury.findAll({
        where: {
            id: req.params.id
        }
    }).then(function(inj) {
        res.json(inj);
    });
};


module.exports.deleteInjury = (req, res, next) => {
    models.Injury.destroy({
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

