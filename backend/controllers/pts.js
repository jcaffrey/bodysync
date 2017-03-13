// import instantiated db
var models = require('../models/index');
var jwt = require('jsonwebtoken');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];  



module.exports.createPt = (req, res, next) => {
    models.pt.create({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        phoneProvider: req.body.phoneProvider,
        isAdmin: req.body.isAdmin,
        hash: models.pt.generateHash(req.body.hash) // add hash and token
    }).then(function(pt) {
        res.json(pt);
    });
};

module.exports.getPts = (req, res, next) => {
    models.pt.findAll({}).then(function(pts) {
        res.json(pts);
    });
};

/*
function checkRequestIdAgainstId(req, res) { 
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);
    // debugging
    console.log('token id: ' + String(decoded.id));
    console.log('query id: ' + String(req.params.id));
    if (req.params.id != decoded.id) {
        return res.status(401).send('You are not authorized to see this resource');
    }
}
*/
module.exports.getPtById = (req, res, next) => {
  
    // already retrieved and verified the token, so skipping error handling for the time being

/*    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, 'thisisthesecret');
    if (req.params.id != decoded.id) {
        return res.status(401).send('You are not authorized to see this resource');
    }
*/
    checkAgainstToken(req, res);

    models.pt.findAll({
        where: {
            id: req.params.id
        }
    }).then(function(pt) {
        res.json(pt);
    });
};


module.exports.deletePt = (req, res, next) => {
    models.pt.destroy({
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

// module.exports.updatePt = (req, res, next) => {

//     models.pt.udpate({
//
//         res.sendStatus(200);
//     })
// }
