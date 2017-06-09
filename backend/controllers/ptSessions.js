var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

/**

 creates audit log session for pt upon login..

 */

// here we assume that the PT is reading all of the resources associated with each patient (because they are)
// the exact resources being read can be found by querying where createdAt is less than the createdAt of the row in the ptSessions table
module.exports.handleSession = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);



    var data = [];
    for (var i in req.body.patientIds) {
        data.push({
            ptId: decoded.id,
            resourceRequested: req.url,
            sessionNumber: decoded.sessionNumber,
            duration: null,
            patientId: req.body.patientIds[i]
        })
    }
    models.ptSession.bulkCreate(data)
        .then(function() {
            return;
        }).catch(function(err) { return next(err); });


    var today = new Date();
    if(req.params.patientId == -1)  // ~~~~~~~~~ case where we create new rows for all patients
    {
        // find all of that pt's patients
        // create a row for each of them
        models.patient.findAll({
            where: {
                ptId: decoded.id
            }
        }).then(function (pat) {
            if(pat && pat.length !== 0)
            {
                // update duration for all previous rows
                models.ptSession.findAll({
                    where: {
                        ptId: decoded.id,
                        sessionNumber: decoded.sessionNumber
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ]
                }).then(function(sessions) {
                    if(sessions && sessions.length !== 0)
                    {
                        // check if time has not been set already (if not set we want to update duration)

                        // backfill the duration..
                        var cDate = new Date(ptSessions[0].createdAt);
                        var diff = today.getTime() - cDate.getTime();

                        models.ptSession.update({
                                duration: diff
                            },
                            {
                                where: {
                                    ptId: decoded.id,
                                    sessionNumber: decoded.sessionNumber,
                                    duration: null,
                                }
                            }).then(function() {
                                // create new rows
                                var data = [];
                                for(var i = 0; i < pat.length; i++)
                                {
                                    console.log('patId' + pat[i].id);
                                    data.push({
                                        ptId: decoded.id,
                                        sessionNumber: decoded.sessionNumber,
                                        duration: null,
                                        patientId: pat[i].id
                                    })
                                }
                                models.ptSession.bulkCreate(data)
                                    .then(function() {
                                        return;
                                    }).catch(function(err) { return next(err); });


                                return;
                            }).catch(function (err) {
                                return next(err);
                            })
                    }
                    else
                    {
                        // create new rows
                        var data = [];
                        for(var i = 0; i < pat.length; i++)
                        {
                            console.log('patId' + pat[i].id);
                            data.push({
                                ptId: decoded.id,
                                sessionNumber: decoded.sessionNumber,
                                duration: null,
                                patientId: pat[i].id
                            })
                        }
                        models.ptSession.bulkCreate(data)
                            .then(function() {
                                return res.status(200).send('created new rows and backfilled');
                            }).catch(function(err) { return next(err); });


                        return;
                    }
                }).catch(function (err) {
                    return next(err);
                })
            }
            else
            {
                return res.status(404).send('no patients to log')
            }
        }).catch(function(err) {
            return next(err);
        })
    }
    else if(req.params.patientId == -2)    // ~~~~~~~~~ case where we only backfill (this indicates logoff)
    {

        models.ptSession.findAll({
            where: {
                ptId: decoded.id,
                sessionNumber: decoded.sessionNumber
            },
            order: [
                ['createdAt', 'DESC']
            ]
        }).then(function(sessions) {
            if(sessions && sessions.length !== 0)
            {
                // check if time has not been set already (if not set we want to update duration)

                // backfill the duration..
                var cDate = new Date(sessions[0].createdAt);
                var diff = today.getTime() - cDate.getTime();

                models.ptSession.update({
                        duration: diff
                    },
                    {
                        where: {
                            ptId: decoded.id,
                            sessionNumber: decoded.sessionNumber,
                            duration: null,
                        }
                    }).then(function () {
                    return res.status(200).send('backfilled rows');

                }).catch(function (err) {
                    return next(err);
                })
            }
            else
            {
                return res.status(404).send('no rows to update')
            }
        });
    }
    else    // ~~~~~~~~~ case where we backfill everything except for that SINGLE patient
    {
        // keep counting for that patientId, close out the rest

    }
    res.json({success: 'success'});
};


module.exports.createSession = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.ptSession.create({
        ptId: decoded.id,
        sessionNumber: decoded.sessionNumber,
        resourceRequested: req.url
    }).then(function(created) {
        return;
    }).catch(function (e) {
        return next(e);
    })
};

/**

 Audit log ptSessions after every GET request for sensitive patient electronic health records.

 */
// module.exports.logSession = (req, res, next) => {
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     var today = new Date();
//
//     console.log('---------IN LOG LOG LOG LOG SESSIONS')
//
//
//     // get duration
//     // query ptSession table for most recent row ON ptId AND sessionId, update duration of this data using
//     // current request's start time as that request's end time - iff it is not set already (because of updateSession)
//     // (so, we're backfilling the table)
//     if(decoded.isPt)
//     {
//         models.ptSession.findAll({
//             where: {
//                 ptId: decoded.id,
//                 sessionNumber: decoded.sessionNumber
//             },
//             order: [
//                 ['createdAt', 'DESC']
//             ]
//         }).then(function (ptSessions) {
//             if(ptSessions.length !== 0)
//             {
//                 // check if time has not been set already (if not set we want to update duration)
//                 if(ptSessions[0].duration == null)
//                 {
//                     var diff;
//                     // backfill the duration..
//                     var cDate = new Date(ptSessions[0].createdAt);
//                     diff = today.getTime() - cDate.getTime();
//
//                     models.ptSession.update({
//                         duration: diff
//                     },
//                         {
//                             where: {
//                                 ptId: decoded.id,
//                                 sessionNumber: decoded.sessionNumber,
//                                 duration: null,
//                                 resourceRequested: ptSessions[0].resourceRequested,
//                                 createdAt: ptSessions[0].createdAt
//                             }
//                     }).then(function() {
//                         return;
//                     })
//                 }
//
//                 if (req.body.patientIds) {
//                     var data = [];
//                     for (var i in req.body.patientIds) {
//                         data.push({
//                             ptId: decoded.id,
//                             resourceRequested: req.url,
//                             sessionNumber: decoded.sessionNumber,
//                             duration: null,
//                             patientId: req.body.patientIds[i]
//                         })
//                     }
//                     models.ptSession.bulkCreate(data)
//                         .then(function() {
//                             return;
//                         }).catch(function(err) { return next(err); });
//                 } else if(req.body.patientId) {
//                     models.ptSession.create({
//                         ptId: decoded.id,
//                         resourceRequested: req.url,
//                         sessionNumber: decoded.sessionNumber,
//                         duration: null,
//                         patientId: req.body.patientId
//                     }).then(function () {
//                         return;
//                     }).catch(function (err) {
//                         return next(err);
//                     })
//                 } else {
//                     console.log('error: no patientId associated with logging route');
//                     return;
//                 }
//             }
//             else
//             {
//                 console.log('oops something went wrong. no ptSession with that sessionNumber and id');
//                 return;
//             }
//         }).catch(function (err) {
//             return next(err);
//         })
//
//     }
//     else
//     {
//         console.log('only log pt sessions');
//         return;
//     }
// }
//
// // a helper function to update durations when a non-GET request follows a GET request
// // (since we're only tracking when sensitive information is being viewed i.e. via GET)
// // no need to log post requests..
// // TODO: call update session when the frontend hits the logout route on backend..
// // TODO: have the frontend fetch the /logout route (w/ the token) on the backend when the user logs out.
// module.exports.updateSession = (req, res, next) => {
//    // return res.json({success: 'sucess'});
//     var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     var decoded = jwt.verify(token, config.secret);
//
//     var today = new Date();
//
//     console.log('IN UPDATE SESSIONS------------')
//     // query ptSesssion table ON ptId and sessionId
//     // check if duration is set and update accordingly
//     if(decoded.isPt)
//     {
//         models.ptSession.findAll({
//             where: {
//                 ptId: decoded.id,
//                 sessionNumber: decoded.sessionNumber
//             },
//             order: [
//                 ['createdAt', 'DESC']
//             ]
//         }).then(function (ptSessions) {
//             if(ptSessions.length !== 0)
//             {
//                 if(ptSessions[0].duration == null) {
//                     var cDate = new Date(ptSessions[0].createdAt);
//                     var diff = today.getTime() - cDate.getTime();
//
//                     models.ptSession.update(
//                         {duration: diff},
//                         {where: {
//                             ptId: decoded.id,
//                             sessionNumber: decoded.sessionNumber,
//                             duration: null,
//                             resourceRequested: ptSessions[0].resourceRequested,
//                             createdAt: ptSessions[0].createdAt
//                         }
//                         });
//                     console.log('ALKSDFALJSFLKJAL----------'+req.url.includes('/logoff'));
//
//                     if(req.url.includes('/logoff'))
//                         return res.json({success: 'success'});
//
//                     return;
//                 } else {
//                     return;
//                 }
//             }
//             else
//             {
//                 console.log('oops something went wrong. no ptSession with that sessionNumber and id');
//                 return;
//             }
//         }).catch(function (err) {
//             return next(err);
//         })
//     } else {
//         console.log('only log pt sessions');
//         return;
//     }
// };

// module.exports.endSession = (req, res, next) => {
//     // TODO: have the frontend fetch the /logout route (w/ the token) on the backend when the user logs out.
//     // TODO: test.js this function! copied from update session above
//     // var token = req.query.token || req.body.token || req.headers['x-access-token'];
//     // var decoded = jwt.verify(token, config.secret);
//     //
//     // var today = new Date();
//     //
//     // // update duration of final request in some session as above
//     //
//     // // that's all that happens here, everything else is handled in auth
//     //
//     // if (decoded.isPt)
//     // {
//     //     models.ptSession.findAll({
//     //         where: {
//     //             ptId: decoded.id,
//     //             sessionNumber: decoded.sessionNumber
//     //         },
//     //         order: [
//     //             ['createdAt', 'DESC']
//     //         ]
//     //     }).then(function (ptSessions) {
//     //         if(ptSessions.length !== 0)
//     //         {
//     //             if(ptSessions[0].duration == null) {
//     //                 var cDate = new Date(ptSessions[0].createdAt);
//     //                 var diff = today.getTime() - cDate.getTime();
//     //
//     //                 models.ptSession.update(
//     //                     {duration: diff},
//     //                     {where: {
//     //                         ptId: decoded.id,
//     //                         sessionNumber: decoded.sessionNumber,
//     //                         duration: null,
//     //                         resourceRequested: ptSessions[0].resourceRequested,
//     //                         createdAt: ptSessions[0].createdAt
//     //                     }
//     //                     })
//     //                 return;
//     //             } else {
//     //                 return;
//     //             }
//     //         }
//     //         else
//     //         {
//     //             console.log('oops something went wrong. no ptSession with that sessionNumber and id');
//     //             return;
//     //         }
//     //     }).catch(function (err) {
//     //         return next(err);
//     //     })
//     // } else {
//     //     console.log('only log pt sessions');
//     //     return;
//     // }
//     //
//     // return;
// }