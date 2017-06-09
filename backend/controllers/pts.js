/**

    dependencies

 */
var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

/**

    CREATE (HTTP POST)

 */

module.exports.createPt = (req, res, next) => {
    // TODO add in authentication to make sure the admin is who their token says they are?
    models.pt.create({
        name: req.body.name,
        email: req.body.email,
        proPicUrl: req.body.proPicUrl,
        phoneNumber: req.body.phoneNumber,
        phoneProvider: 'att',
        isAdmin: false,
        hash: 'temp'
    }).then(function(pt) {
        return res.json(pt);
        //return next();
    });
};


/**

    DELETE (HTTP DELETE)

 */

// TODO: update this!
module.exports.deletePt = (req, res, next) => {
    models.pt.destroy({
        where: {
            id: req.params.id
        }
    }).then(function(instance) {
        if (instance)
        {
            return res.sendStatus(200);
            //return next();
        }
        else
            res.status(404).send('sorry not found');
    });
}

module.exports.isVerified = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    console.log('in ISVERIFIED CHECKING ==')
    console.log(decoded.id == req.params.id);
    if(decoded.isPt && decoded.id == req.params.id)
    {
        models.pt.findOne({
            where: {
                id: req.params.id
            }
        }).then(function (pt) {
            if(pt && Object.keys(pt).length !== 0)
            {
                if(pt.isVerified)
                    return res.json({ptIsVerified: true});
                else
                    return res.json({ptIsVerified: false});
            }
            else
            {
                return res.status(404).send('no such pt found');
            }
        })
    }
    else
    {
        return res.status(403).send('not authorized');
    }
}
