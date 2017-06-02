/**

    dependencies

 */

var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var nodemailer = require('nodemailer');
var Mailgen = require('mailgen');


/**

    CREATE (HTTP POST)

 */


module.exports.createPatient = (req, res, next) => {
    if(auth.checkRequestIdAgainstId(req, res)) {
        // TODO: send email to patient, update fields, route them same way the forgot password works?
        // TODO: make sure that no pt has the same email as the patient
        models.pt.findAll({
            where: {
                email: req.body.email
            }
        }).then(function (user) {
            if(Object.keys(user).length !== 0) {
                res.status(405).send('sorry that email is taken');
            } else {
                models.patient.create({
                    name: req.body.name,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    phoneProvider: req.body.phoneProvider,
                    surgeryType: req.body.surgeryType,
                    isRestrictedFromRom: req.body.isRestrictedFromRom,
                    age: req.body.age,
                    weight: req.body.weight,
                    ptId: req.params.id,
                    hash: "temp" // add hash and token
                }).then(function(pat) {
                    if(Object.keys(pat).length !== 0)
                    {
                        var payload = {id: pat.id, sessionNumber: null, isPt: false, isAdmin: false};
                        var token = jwt.sign(payload, config.secret, {expiresIn: 60 * 60});

                        pat.forgotToken = token;
                        pat.save().then(() => {
                            // email patient
                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: config.emailFromAddr,
                                    pass: config.emailPw
                                }
                            });

                            var mailGenerator = new Mailgen({
                                theme: 'default',
                                product: {
                                    name: 'Prompt Therapy Solutions',
                                    link: 'LINK TO THE WEBSITE'
                                }
                            });

                            var e = {
                                body: {
                                    intro: 'Welcome to Prompt Therapy Solutions - the road to recovery starts here!',
                                    action: {
                                        instructions: 'To get started with Prompt Therapy Solutions, please click here:',
                                        button : {
                                            color: '#2e3192',
                                            text: 'Set your password',
                                            link: config.frontendRoute + '/reset/' + token
                                        }
                                    },
                                    outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
                                }
                            }

                            var emailBody = mailGenerator.generate(e);
                            var emailText = mailGenerator.generatePlaintext(e);

                            var mailOptions = {
                                to: req.body.email,
                                from: `"${config.emailFromName}"<${config.emailFromAddr}>`,
                                subject: 'Welcome',
                                html: emailBody,
                                text: emailText
                                // text: 'You are receiving this because you have requested to reset your password.\n\n' +
                                // 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                                // config.frontendRoute + '/reset/' + token + '\n\n' +
                                // 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                            };
                            transporter.sendMail(mailOptions, function (err) {
                                if(err)
                                    return next(err); // test this.
                            });

                            res.json(pat);
                            return next();
                        }).catch(function (err) {
                            console.log('did not save')
                            return next(err);
                        })
                }
                else {
                    return res.status(404).send('not found!');
                }
            }).catch(function (err) {
                console.log('in here')
                return next(err);
            })
            }

        }).catch(function (err) {
                console.log('THIS ERRORED')
                return next(err);
            })
    }
    return;
};


/**

    READ (HTTP GET)

 */


// TODO: figure out what to return when patients object below is []
module.exports.getPatients = (req, res, next) => {

    if(auth.checkRequestIdAgainstId(req, res)) {

        models.patient.findAll({
            where: {
                ptId: req.params.id
            }

        }).then(function(patients) {
            res.json(patients);
            var pIds = [];
            for (var p in patients) {
                pIds.push(patients[p].id);
            }
            req.body.patientIds = pIds;
            return next();
        }).catch(function (e) {
            return next(e);
        })
    }
};


// / // not to be used in actual app, unless for an admin
// module.exports.getAllPatients = (req, res, next) => {
//     models.patient.findAll({}).then(function(patients) {
//         res.json(patients);
//     });
// };
/*
module.exports.getPatientById = (req, res, next) => {
    models.patient.findone({
        where: {id: req.params.id}
    }).then(function(patient) {
        return res.json(patient);
    });
};
*/


module.exports.getPatientById = (req, res, next) => {
    // auth
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.patient.findOne({
        where: {id: req.params.id}
    }).then(function(patient) {
        // auth is done here so only one query
        // pt and patient alike have access
  
        // if pt
        if (decoded.isPt) {
            // if requesting pt is requested patient's pt
            if (decoded.id == patient.ptId) { // should be === ?
                req.body.patientId = patient.id;
                res.json(patient);
                return next();
            }  
            else {
                return res.status(401).send('You are not authorized to see this resource');
            }
        }
        // else if patient
        else {
            // if requesting patient is requested patient
            if (decoded.id == req.params.id) { // should be === ?
                return res.json(patient);
            } 
            else {
                return res.status(401).send('You are not authorized to see this resource');
            }        
        }
    }).catch(function(err) {
        return next(err);
    })
};





/**

    UPDATE (HTTP PUT)

 */

module.exports.updatePatientNotes = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);
    // TODO : test that req.body.ptNotes exists

    models.patient.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(pat) {
        if(Object.keys(pat).length !== 0)
        {
            if(pat.ptId == decoded.id)
            {
                pat.ptNotes = req.body.ptNotes || pat.ptNotes;
                pat.save().then(() => {
                    // req.body.patientId = req.params.id || pat.id; // don't need to store down an idea on ptSessions.updateSession
                    res.json(pat);
                    return res.status(200).send('success');
                }).catch((err) => {
                    return next(err);
                })
            }
            else
            {
                return res.status(403).send('not authorized');
            }
        }
        else
        {
            return res.status(404).send('could not find')
        }
    }).catch((err) => {
        return next(err);
    })
}


/**

    DELETE (HTTP DELETE)

 */

module.exports.deletePatient = (req, res, next) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    models.patient.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (patient) {
        if (patient.length !== 0)
        {
            console.log(patient.length);
            console.log(patient.ptId);
            // if pt
            if (decoded.isPt) {
                // if requesting pt is requested patient's pt
                if (decoded.id === patient.ptId) {
                    // DESTROY IF THIS IS THE CASE
                    patient.destroy();
                    res.json(patient);
                    return next();
                    // return res.json(patient);
                }
                else {
                    return res.status(401).send('You are not authorized to destroy this resource');
                }
            }
        }
        else
            res.status(404).send('Sorry not found');
    }).catch(function(err) {
        return next(err);
                        // doesn't quite catch error how we would want? still get:
                            // Error: No default engine was specified and no extension was provided.
    });
};



// TODO figure out how to make sure that this is called once a week
// ? - create route and ping this route from the frontend once a week
// have a timer on the backend?
// var emailData = [] // push ptEmail objects into this

// function packageData(measure, index, measuresArr) {
//     models.romMetric.findAll({
//         where: {
//             id : measure.romMetricId
//         }
//     }).then(function(metric) {
//         if(metric.length !== 0)
//         {
//             emailData.push(metric)
//             console.log('here')
//         }
//     })
// }

// function printPts(ele, ind, ptArr) {
//     console.log('pts['+ ind +'].email' + '=' + ptArr[ind].email);
// }
//
// function findPatientsPt(ele, ind, patArr) {
//     console.log('patients['+ ind +'].email' + '=' + patArr[ind].email);
//
//     models.pt.findAll({
//         where: {
//             id: patArr[ind].ptId
//         }
//     }).then(function(pts) {
//         if(pts.length !== 0)
//         {
//             // loop over pts
//             console.log('printing pts')
//             pts.forEach(printPts);
//             // call findMeasuresToUpdate
//         }
//     })
// }
//
// module.exports.emailPtsAboutRom = (req, res, next) => {
//     models.patient.findAll({}).then(function(pats) {
//         if(pats.length !== 0)
//         {
//             pats.forEach(findPatientsPt);
//             console.log('finsihed');
//             return;
//         } else return res.status(404).send('no pts')
//     })
// }

//};

// module.exports.emailPtsAboutRom = (req, res, next) => {
//     // figure out who needs to get emailed - if a certain romMetricMeasures hasn't been created in more than a week
//     // package the email for that person - thing to measure, name of person, link to measure that person (need the romMetric id to make this link)
//
//
//     models.romMetricMeasure.findAll({
//         where: {
//             dayMeasured: {
//                 $lte: moment().subtract(7, 'days').toDate()
//             } // only find things that were measured more than 7 days ago.
//         }
//     }).then(function(measuresArr) {
//         if(measuresArr.length !== 0)
//         {
//             console.log('number of iters' + measuresArr.length)
//             // measuresArr.forEach(packageData)
//
//             for(var i = 0; i < measuresArr.length; i++)
//             {
//                 (function(x) {
//                     models.romMetric.findOne({
//                         where: {
//                             id : measuresArr[x].romMetricId
//                         }
//                     }).then(function(metric) {
//                         if(Object.keys(metric).length !== 0)
//                         {
//                             // find the injury.
//                             models.injury.findOne({
//                                 where: {
//                                     id: metric.injuryId
//                                 }
//                             }).then(function(injury) {
//                                 if(Object.keys(injury).length !== 0)
//                                 {
//                                     // find the patient.
//                                     models.patient.findOne({
//                                         where: {
//                                             id: injury.patientId
//                                         }
//                                     }).then(function(pat) {
//                                         if(Object.keys(pat).length !== 0)
//                                         {
//                                             // find the pt
//                                             models.pt.findOne({
//                                                 where: {
//                                                     id: pat.ptId
//                                                 }
//                                             }).then(function(pt) {
//                                                 if(Object.keys(pt).length !== 0)
//                                                 {
//                                                     // now we have everything!
//                                                     // add to the global emailData. either add new or update old
//
//
//                                                     var index = -1;
//                                                     for(var j = 0; emailData.length; j++)
//                                                     {
//                                                         // TODO: error is emailData[j].email
//                                                         console.log(emailData);
//                                                         if(emailData[j].email && emailData[j].email === pt.email)
//                                                         {
//                                                             var index = j;
//                                                         }
//                                                     }
//                                                     console.log('printing email: ' + pt.email)
//                                                     if(index !== -1)
//                                                     {
//                                                         console.log('INDEX IS: ' + index);
//
//                                                         // insert into patient object at index in emailData
//                                                         var patObj = {
//                                                             patEmail: pat.email
//                                                             // measureName : measuresArr[x].name,
//                                                             // injuryName: injury.name,
//                                                             // orderCt: x,
//                                                         }
//                                                         console.log('IF ADDING DATA IN IF')
//                                                         var e = pt.email;
//
//                                                         emailData[index].e.push(patObj)
//                                                     }
//                                                     else {
//                                                         // create new ptObject which has an array with the patient Object
//                                                         // push ptObject to the emailData array
//                                                         var e = pt.email;
//
//                                                         var ptObj = {
//                                                             e: []
//                                                         }
//                                                         ptObj.e.push({
//                                                             patEmail: pat.email
//                                                             // measureName : measuresArr[x].name,
//                                                             // injuryName: injury.name,
//                                                             // orderCt: x,
//                                                         })
//
//
//                                                         // var ptObj = {
//                                                         //     e: [{
//                                                         //         patEmail: pat.email
//                                                         //         // measureName : measuresArr[x].name,
//                                                         //         // injuryName: injury.name,
//                                                         //         // orderCt: x,
//                                                         //     }]
//                                                         // }
//                                                         console.log('ELSE ADDING DATA IN ELSE')
//                                                         emailData.push(ptObj)
//                                                     }
//                                                     console.log(JSON.stringify(emailData))
//                                                     console.log('all the way')
//                                                     // continue this massive loop :)...
//                                                 }
//                                             }).catch(function(err) {
//                                                 console.log('pt')
//                                                 console.log(err);
//                                             })
//                                         }
//                                     }).catch(function(err) {
//                                         console.log('pat')
//                                         console.log(err);
//                                     })
//                                 }
//                             }).catch(function(err) {
//                                 console.log('injury')
//                                 console.log(err);
//                             })
//                         }
//                     }).catch(function(err) {
//                         console.log('metric')
//                         console.log(err);
//                     })
//                 })(i)
//
//             }
//             console.log('OUT');
//             res.json(emailData);
//             return;
//         }
//     })
//
//
// }

// function sendEmails(data) {
//
// }
//
// module.exports.emailPtsAboutRom = (req, res, next) => {
//
//     models.romMetricMeasure.findAll({
//         where: {
//             dayMeasured: {
//                 $lte: moment().subtract(7, 'days').toDate()
//             } // only find things that were measured more than 7 days ago.
//         }
//     }).then(function(measures) {
//         if(measures.length !== 0)
//         {
//             console.log('here');
//             console.log(JSON.stringify(measures));
//             var emailData = [];
//             // loop over all measures
//             for(var i = 0; i < measures.length; i++)
//             {
//                 // figure out who needs an email to be sent
//                 // either create new ptObj or append to the existing one
//
//                 // loop over existing emailData arr to figure out if we need a new ptObj
//                 if(emailData.length !== 0)
//                 {
//                     var isUpdated = false;
//
//                     for(var j = 0; j < emailData.length; j++)
//                     {
//                         // console.log(emailData)
//                         if(emailData[j].hasOwnProperty(measures[i].ptEmail))
//                         {
//                             isUpdated = true;
//                             // append to existing ptObj
//                             var email = measures[i].ptEmail;
//                             emailData[j][email].push({
//                                 patientName: measures[i].patientName,
//                                 metricsToMeasure: [{
//                                     romMetricName: measures[i].romMetricName
//                                 }]
//                             })
//                         }
//                     }
//                     if(!isUpdated)
//                     {
//                         // push new ptObj into emailData similar to below
//                         var email = measures[i].ptEmail;
//                         var ptObj = {}
//                         ptObj[email] = [{
//                             patientName: measures[i].patientName,
//                             metricsToMeasure: [{
//                                 romMetricName: measures[i].romMetricName
//                             }]
//                         }]
//                         emailData.push(ptObj);
//                     }
//                 }
//                 else
//                 {
//                     //     // push brand new ptObj into emailData (w/ one metricsToMeasure)
//                     var email = measures[i].ptEmail;
//
//                     var ptObj = {}
//                     ptObj[email] = [{
//                         patientName: measures[i].patientName,
//                         metricsToMeasure: [{
//                             romMetricName: measures[i].romMetricName
//                         }]
//                     }]
//
//                     emailData.push(ptObj);
//                 }
//             }
//
//
//             // SEND THESE EMAILS
//             sendEmails(emailData);
//
//         }
//     }).catch(function(err) {
//         console.log('romMetricMeasure error');
//         return next(err);
//     })
// }

// module.exports.emailPtsAboutRom = (req, res, next) => {
//
//     models.romMetricMeasure.findAll({
//         where: {
//             dayMeasured: {
//                 $lte: moment().subtract(7, 'days').toDate()
//             } // only find things that were measured more than 7 days ago.
//         }
//     }).then(function(measures) {
//         console.log('entering the if');
//         if(measures.length !== 0)
//         {
//             console.log('printing measures..');
//             console.log(JSON.stringify(measures));
//             for(var i = 0; i < measures.length; i++)
//             {
//                 (function(x) {
//                     models.romMetric.findOne({
//                         where : {
//                             id: measures[x].romMetricId
//                         }
//                     }).then(function(measure) {
//                         if(Object.keys(measure).length !== 0)
//                         {
//                             console.log('printing measure.. at ' + x);
//                         }
//                     }).catch(function(err) {
//                         console.log('romMetric error');
//                         return next(err);
//                     })
//                 })(i)
//             }
//             console.log('OUT OF THE FOR LOOP')
//         }
//     }).catch(function(err) {
//         console.log('romMetricMeasure error');
//         return next(err);
//     })
// }

// module.exports.emailPtsAboutRom = (req, res, next) => {
//     Promise.all([
//         models.romMetricMeasure.findAll({
//             where: {
//                 dayMeasured: {
//                     $lte: moment().subtract(7, 'days').toDate()
//                 } // only find things that were measured more than 7 days ago.
//             }
//         })
//         models.romMetric.findAll({
//
//         })
//
//
//     ]).then(function(results) {
//         console.log(results[0]);
//         return;
//     })
//
//
//     // models.patient.findAll({}).then(function(pats) {
//     //     if(pats.length !== 0)
//     //     {
//     //         for(var i = 0; i < pats.length; i++)
//     //         {
//     //             // (function(x) {
//     //             //     console.log('pats[i].email = '+pats[i].email);
//     //
//     //             var loopP = new Promise(success, ()=>{
//     //                 models.pt.findAll({
//     //                     where: {
//     //                         id: pats[x].ptId
//     //                     }
//     //                 }).then(function(pts) {
//     //                     if(pts.length !== 0)
//     //                     {
//     //                         for(var j = 0; j < pts.length; j++)
//     //                         {
//     //                             console.log('pts[j].email ='+ pts[j].email);
//     //                         }
//     //                     }
//     //                 })
//     //             })
//     //
//     //             // })(i)
//     //
//     //         }
//     //     }
//     // })
// }
