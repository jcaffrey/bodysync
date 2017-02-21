// import instantiated db
var models = require('../models/index');


module.exports.getPTS = (req, res, next) => {
    models.PT.findAll({}).then(function(PTs) {
        res.json(PTs);
    });
};

module.exports.createPT = (req, res, next) => {
    models.PT.create({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        phoneProvider: req.body.phoneProvider
    }).then(function(pt) {
        res.json(pt);
    });
};

// Jeremy: we should talk about how we will do error handling..not sure if it will be exactly the same as in mongoose.
// also, that if statemen commented below does not work
module.exports.getPTById = (req, res, next) => {
    // if (req.params.id !== req.user.id) // && !req.user.isAdmin)
    //     return res.status(403).send("You don't have permission to do that");
    models.PT.findAll({
        where: {
            id: req.params.id
        }
    }).then(function(pt) {
        res.json(pt);
    })
}

// module.exports.updatePT = (req, res, next) => {
//     if (req.params.id !== req.user.id) // && !req.user.isAdmin)
//         return res.status(403).send("You don't have permission to do that");
//     models.PT.udpate({
//
//         res.sendStatus(200);
//     })
// }

module.exports.deletePT = (req, res, next) => {
    // if (req.params.id !== req.user.id) // && !req.user.isAdmin)
    //     return res.status(403).send("You don't have permission to do that");
    models.PT.destroy({
        where: {
            id: req.body.id
        }
    });
}
