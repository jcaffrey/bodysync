/**

    dependencies

 */

// import instantiated db
var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');

// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];  



/**

    CREATE (HTTP POST)

 */


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


/**

    READ (HTTP GET)

 */

module.exports.getPts = (req, res, next) => {
    models.pt.findAll({}).then(function(pts) {
        res.json(pts);
    });
};


module.exports.getPtById = (req, res, next) => {
  
    if(auth.checkRequestIdAgainstId(req, res)) {
        models.pt.findAll({ // should not be find all!!! this returns an array
            where: {
                id: req.params.id
            }
        }).then(function(pt) {
            res.json(pt);
        });
    }
    
    return;

};


/**

    UPDATE (HTTP PUT)
    
 */

// module.exports.updatePt = (req, res, next) => {
//      // add auth via checkRequestIdAgainstId...      
//
//
//     // TBU???  
//     models.pt.udpate({
//
//         res.sendStatus(200);
//     })
// }


/**

    DELETE (HTTP DELETE)

 */


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


