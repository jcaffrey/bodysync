var models = require('../models/index');
// import instantiated db


module.exports.createPT = (req, res, next) => {
    models.PT.create({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        phoneProvider: req.body.phoneProvider // add hash and token
    }).then(function(pt) {
        res.json(pt);
    });
};

module.exports.getPTS = (req, res, next) => {
    models.PT.findAll({}).then(function(PTs) {
        res.json(PTs);
    });
};


module.exports.getPTById = (req, res, next) => {
    models.PT.findAll({
        where: {
            id: req.params.id
        }
    }).then(function(pt) {
        res.json(pt);
    });
};


module.exports.deletePT = (req, res, next) => {
    models.PT.destroy({
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

// module.exports.updatePT = (req, res, next) => {

//     models.PT.udpate({
//
//         res.sendStatus(200);
//     })
// }