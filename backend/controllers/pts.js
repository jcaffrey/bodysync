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
        proPicUrl: req.body.proPicUrl,
        phoneNumber: req.body.phoneNumber,
        phoneProvider: 'att',
        isAdmin: false,
        hash: 'temp' // add hash and token
    }).then(function(pt) {
        res.json(pt);
        return next();
    });
};


/**

    READ (HTTP GET)

 */

module.exports.getPts = (req, res, next) => {
    models.pt.findAll({}).then(function(pts) {
        res.json(pts);
        return next();
    });
};


module.exports.getPtById = (req, res, next) => {
  
    if(auth.checkRequestIdAgainstId(req, res)) {
        models.pt.findAll({ // should not be find all!!! this returns an array
            where: {
                id: req.params.id
            }
        }).then(function(pt) {
            req.body.patientId =
            res.json(pt);
            return next();
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
        {
            res.sendStatus(200);
            return next();
        }
        else
            res.status(404).send('sorry not found');
    });
}

function createUrlsForMetricMeasure(patId) {
    // returns urls for metrics that need to be updated. false if none
    models.injuries.findAll({where: {patientId: patId}}).then(function (injuries) {
        if(injuries.length !== 0) // assumes
        {
            for(var i = 0; i < injuries.length; i++)
            {
                // wrap this in an iffy???
                models.romMetrics.findAll({where: {injuryId: injuries[i].id}}).then(function (roms) {
                    if(roms.length !== 0)
                    {
                        for(var j= 0; j < roms.length; j++)
                        {
                            models.romMetricMeasures.findAll({where: {romMetricId: roms[j].id}}).then(function (measures) {
                                if(measures.length !== 0)
                                {
                                    // filter for most recent rom
                                    var mostRecent = measures[0];
                                    console.log('most recent measure for ' + patId);
                                    console.log(mostRecent);
                                    console.log('logging all measures..');
                                    console.log(measures);

                                    // check mostRecent against now
                                    // var now = new Date();
                                    // if(mostRecent - now > 7)
                                }
                            }).catch(function (err) {
                                console.log('error on measures')
                                return next(err);
                            })
                        }
                    }

                }).catch(function (err) {
                    console.log('error on metrics')
                    return next(err);
                })

            }
        }
        else
        {
            return res.status(404).send('not patients to notify right now');
        }

    }).catch(function (err) {
        console.log('error on injuries')
        return next(err);
    })
}



function emailPt(ptEmail, ptsId) {
    models.patients.findAll({where: {ptId : ptsId}}).then(function (patients) {
        if(patients.length !== 0)
        {
            var bodyData = {}
            // figure out which patients have not been measured in a week
            for(var i = 0; i < patients.length; i++)
            {
                var urls = createUrlsForMetricMeasure(patients[i].id);
                if(url !== false)
                {
                    // add to bodyData
                    bodyData[patients[i].email].push(urls);

                }
            }
            console.log('in emailPt printing bodyData');
            console.log(bodyData);

            // format email for that PT

            // send email


        }
        else
        {
            return res.status(404).send('not patients to notify right now');
        }
    }).catch(function (err) {
        console.log('error on patients')
        return next(err);
    })
}

module.exports.notifyPtsOnRom = (req, res, next) => {
    models.pts.findAll().then(function (pts) {
        if(pts.length !== 0)
        {
            for(var i = 0; i < pts.length; i++)
            {
                emailPt(pts[i].email, pts[i].id);
            }
        }
        else
        {
            return res.status(404).send('not pts to notify right now');
        }
    }).catch(function (err) {
        console.log('error on pts')
        return next(err);
    })
}

