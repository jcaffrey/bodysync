// import instantiated db
var models = require('../models/index');


module.exports.getPTS = (req, res, next) => {
    models.PT.findAll({}).then(function(PTs) {
        res.json(PTs);
    });
};

module.exports.createPT = (req, res, next) => {
    models.PT.create({
        name: req.body.name
    }).then(function(pt) {
        res.json(pt);
    });
};
