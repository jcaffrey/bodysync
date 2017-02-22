/**
 * Created by joeyc on 2/22/17.
 */


var models = require('../models/index');

module.exports.createMeasure = (req, res, next) => {
    models.romMetricMeasure.create({
        name: req.body.name,
        degreeValue: req.body.degreeValue,
        dayCompleted: req.body.dayCompleted,
        romMetricId: req.params.id
    }).then(function(measure) {
        res.json(measure);
    });
};

// TODO: figure out what to return when patients object below is []
module.exports.getMeasures = (req, res, next) => {
    models.romMetricMeasure.findAll({
        where: {
            romMetricId: req.params.id
        }

    }).then(function(measures) {
        res.json(measures);
    });
};
