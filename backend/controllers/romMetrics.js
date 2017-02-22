/**
 * Created by joeyc on 2/22/17.
 */


var models = require('../models/index');

module.exports.createRomMetric = (req, res, next) => {
    models.romMetric.create({
        name: req.body.name,
        InjuryId: req.params.id
    }).then(function(rom) {
        res.json(rom);
    });
};

// TODO: figure out what to return when patients object below is []
module.exports.getRomMetrics = (req, res, next) => {
    models.romMetric.findAll({
        where: {
            InjuryId: req.params.id
        }

    }).then(function(roms) {
        res.json(roms);
    });
};


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
