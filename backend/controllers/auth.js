//
var models = require('../models/index');
var jwt = require('jsonwebtoken');

// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var nodemailer = require('nodemailer')

/*

    Token creation

    TBU: clean this up, catch

 */

exports.loginPt = (req, res, next) => {
    if (typeof req.body.email !== 'string')
        return res.status(400).send('No email');
    if (typeof req.body.password !== 'string') // plaintext passworc
        return res.status(400).send('No password');


    models.pt.findOne({
        where: { email: req.body.email}
    })
    .then(function(pt) {
        if(pt.validHash(req.body.password)) {
            models.ptSession.findAll({
                where: {
                    ptId: pt.id
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            }).then(function (ptSessions) {
                if(ptSessions.length !== 0) {
                    var newSession = ptSessions[0].sessionNumber + 1;
                    console.log('PRINTING THE NEW SESSIONNUMBER: ' + newSession);

                    var payload = {id: pt.id, isPt: true, sessionNumber: newSession, isAdmin: pt.isAdmin}

                    var token = jwt.sign(payload, config.secret, {expiresIn: 60*60 }); // expiresIn is in seconds

                    pt.token = token;
                    pt.save()
                        .then(function () {
                            // returns token to frontend (and backend)..
                            req.body.token = token;
                            res.json({token: token});
                            return next();
                        });


                } else {
                    var payload = {id: pt.id, isPt: true, sessionNumber: 1, isAdmin: pt.isAdmin}

                    var token = jwt.sign(payload, config.secret, {expiresIn: 60*60 }); // expiresIn is in seconds

                    pt.token = token;
                    pt.save()
                        .then(function () {
                            // returns token to frontend (and backend)..
                            req.body.token = token;
                            res.json({token: token});
                            return next();
                        });

                }
            }).catch(function (err) {
                return next(err);
            })
        }
        else {
            return res.status(401).send('Invalid Password');
        }
    }).catch(function(e) {
        return res.status(401).send(JSON.stringify(e));
    })
}


exports.loginPatient = (req, res, next) => {
    if (typeof req.body.email !== 'string')
        return res.status(400).send('No email');
    if (typeof req.body.password !== 'string')
        return res.status(400).send('No password');

    models.patient.findOne({
        where: { email: req.body.email}
    })
    .then(function(patient) {
        if(patient.validHash(req.body.password)) {

            // note: sessionId updated in next middelware chain (createPtSession)
            var payload = {id: patient.id, sessionNumber: null, isPt: false, isAdmin: false};

            var token = jwt.sign(payload, config.secret, {expiresIn: 60*60 }); // expiresIn is in seconds

            patient.token = token;
            patient.save()
                .then(function () {
                    return res.json({token: token});
                    //return next();
                });
        }
        else {
            return res.status(401).send('bad hash');
        }
    }).catch(function(e) {
        return res.status(401).send(JSON.stringify(e));
    })
}

exports.forgotPassword = (req, res, next) => {
    if (typeof req.body.email !== 'string')
        return res.status(400).send('No email');
    if (typeof req.body.isPt !== 'boolean')
        return res.status(400).send('No user type');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.emailFromAddr,
            pass: config.emailPw
        }
    });

    if(!req.body.isPt)
    {
        models.patient.findOne({
            where: {
                email: req.body.email
            }
        }).then(function (pat) {
            if(Object.keys(pat).length !== 0)
            {
                var payload = {id: pat.id, sessionNumber: null, isPt: false, isAdmin: false};
                var token = jwt.sign(payload, config.secret, {expiresIn: 60 * 60});

                pat.forgotToken = token;

                var patPromise = pat.save();
                patPromise.then((pat) => {
                    var mailOptions = {
                        to: req.body.email,
                        from: `"${config.emailFromName}"<${config.emailFromAddr}>`,
                        subject: 'Prompt Therapy Solutions Forgot Password',
                        text: 'You are receiving this because you have requested to reset your password.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    transporter.sendMail(mailOptions);
                });
            }
            else
            {
                return res.status(404).send('no such patients');
            }
        }).then(()=>{
            return res.status(200).send('success');
        }).catch((err) => {
            return next(err);
        })
    }
    else
    {
        models.pt.findOne({
            where: {
                email: req.body.email
            }
        }).then(function(pt) {
            if(Object.keys(pt).length !== 0)
            {
                var payload = {id: pt.id, sessionNumber: null, isPt: true, isAdmin: false};
                var token = jwt.sign(payload, config.secret, {expiresIn: 60 * 60});

                pt.forgotToken = token;

                var ptPromise = pt.save();
                pat.Promise.then((pt) => {
                    var mailOptions = {
                        to: req.body.email,
                        from: `"${config.emailFromName}"<${config.emailFromAddr}>`,
                        subject: 'Prompt Therapy Solutions Forgot Password',
                        text: 'You are receiving this because you have requested to reset your password.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    transporter.sendMail(mailOptions);
                });
            }
            else
            {
                return res.status(404).send('no such patients');
            }
        }).then(() => {
            return res.status(200).send('success');
        }).catch((err) => {
        return next(err);
        })
    }
}

// IMPT: after hitting the forgotPassword route, we will email the patient a link to the frontend
// then the frontend will post to /reset/:id on the backend with {isPt: false, newPassword: "plaintext"}
// if frontend recieves success from here, they should redirect to login

exports.resetPassword = (req, res, next) => {
    if(typeof req.body.isPt !== 'boolean')
        return res.status(400).send('no isPt bool')
    if(typeof req.body.newPassword !== 'string')
        return res.status(400).send('no new pw')

    if(!req.body.isPt)
    {
        models.patient.findOne({
            where: {
                forgotToken: req.params.token   // someone would have to guess the token to be able to reset the password of a user
            }
        }).then(function (pat) {
            if(Object.keys(pat).length !== 0)
            {
                console.log('found pat' + pat.email);
                // hash the newPassword and save it down as the hash
                console.log('old hash' + pat.hash);
                pat.hash = models.patient.generateHash(req.body.newPassword);
                console.log('updated hash' + pat.hash);
                pat.forgotToken = null;
                pat.save().then(()=>{
                    return res.status(200).send('successfully reset patient pw')
                }).catch(function (err) {
                    return next(err);
                });

            }
            else
            {
                return res.status(400).send('no patient found')
            }
        }).catch(function (err) {
            return next(err);
        })
    }
    else
    {
        models.pt.findOne({
            where: {
                forgotToken: req.params.token
            }
        }).then(function (pt) {
            if(Object.keys(pt).length !== 0)
            {
                pt.hash = pt.generateHash(req.body.newPassword);
                pt.forgotToken = null;
                pt.save().then(() => {
                    return res.status(200).send('successfully reset pt pw');
                }).catch(function (err) {
                    return next(err);
                });
            }
            else
            {
                return res.status(400).send('no pt found')
            }
        }).catch(function (err) {
            return next(err);
        })
    }
}


//
//
// exports.resetPassword = (req, res, next) => {
//     if (req.body.password !== req.body.confirm)
//         return res.status(400).send('Passwords do not match');
//
//     models.patient.findOne({
//         where: {resetPasswordHash: req.params.token, resetPasswordExpires: { $gt: Date.now() } }
//     })
//         .then(function(user){
//             if (!user) {
//                 models.patient.findOne({
//                     where: {resetPasswordHash: req.params.token, resetPasswordExpires: { $gt: Date.now() } }
//                 })
//                     .then(function(user2){
//                         if (!user2)
//                             return res.status(400).send('Password reset token is invalid or has expired.');
//                         user = user2;
//                     });
//             }
//
//             user.resetPasswordHash = undefined;
//             user.resetPasswordExpires = undefined;
//             // NOTE: currently storing passwords in plaintext, MUST change
//             user.Hash = req.body.password;
//
//             user.save.then(function () {
//                 var smtpTransport = nodemailer.createTransport('SMTP', {
//                     service: 'gmail',
//                     auth: {
//                         user: 'tech.bodysync@gmail.com',
//                         pass: '/MdeUWK#<3)LEdKq'
//                     }
//                 });
//
//                 var mailOptions = {
//                     to: user.email,
//                     from: 'tech.bodysync@gmail.com',
//                     subject: 'Password Successfully Reset',
//                     text: 'Hello,\n\n' +
//                     'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
//                 };
//
//                 smtpTransport.sendMail(mailOptions, function(err) {
//                     res.send('Your password has been successfully reset');
//                 });
//             });
//         });
// }



// exports.forgotPassword = (req, res, next) => {
//     if (typeof req.body.email !== 'string')
//         return res.status(400).send('No email');
//     console.log(typeof req.body.isPt);
//     if (typeof req.body.isPt !== 'boolean')
//         return res.status(400).send('No user type');
//
//     // console.log('PRINTING THE EMAIL FROM ADDR' + config.emailFromAddr);
//     var transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: config.emailFromAddr,
//             pass: config.emailPw
//         }
//     });
//
//
//     if(!req.body.isPt)
//     {
//         console.log(req.body.email)
//
//         models.patient.findOne({
//             where:{
//                 email: req.body.email
//             }
//         }).then(function (pat) {
//             if(Object.keys(pat).length !== 0) {
//                 console.log(pat.email)
//                 // make a new token
//                 var payload = {id: pat.id, sessionNumber: null, isPt: false, isAdmin: false};
//                 var token = jwt.sign(payload, config.secret, {expiresIn: 60 * 60});
//
//                 console.log('GOT HERE')
//
//                 pat.forgotToken = token;
//                 var patPromise = pat.save();
//                 patPromise.then((user) => {
//                     var mailOptions = {
//                         to: req.body.email,
//                         from: `"${config.emailFromName}"<${config.emailFromAddr}>`,
//                         subject: 'Prompt Therapy Solutions Forgot Password',
//                         text: 'You are receiving this because you have requested to reset your password.\n\n' +
//                         'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//                         'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//                         'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//                     };
//                 transporter.sendMail(mailOptions);
//             }).catch(function (err) {
//                     return next(err);
//                 })
//             }
//             else
//             {
//                 return res.status(404).send('could not find pat');
//             }
//         }
//
//                 // pat.save()
//                 //     .then(function () {
//                 //         // email the pt's email
//                 //
//                 //         console.log('GOT HERE')
//                 //
//                 //
//                 //         try {
//                 //             var mailOptions = {
//                 //                 to: req.body.email,
//                 //                 from: `"${config.emailFromName}"<${config.emailFromAddr}>`,
//                 //                 subject: 'Prompt Therapy Solutions Forgot Password',
//                 //                 text: 'You are receiving this because you have requested to reset your password.\n\n' +
//                 //                 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//                 //                 'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//                 //                 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//                 //             };
//                 //         }
//                 //         catch(err)
//                 //         {
//                 //             console.log('in this caatch');
//                 //             return next(err);
//                 //         }
//                 //
//                 //         console.log('about to try to sendMail');
//                 //
//                 //         try{
//                 //             transporter.sendMail(mailOptions, function(err) {
//                 //                 console.log(err);
//                 //                 if(err){
//                 //                     console.log('FAILED TO SEND');
//                 //                     return next(err);
//                 //                 }
//                 //             });
//                 //         }
//                 //         catch(err)
//                 //         {
//                 //             console.log('carught it!!!!!!!!!!!!!!!!!!!')
//                 //         }
//                 //         return res.status(200).send('An e-mail has been sent to ' + user.email + ' with further instructions.');
//                 //
//                 //
//                 //
//                 //     }).catch(function (err) {
//                 //         return next(err);
//                 // })
//
//
//
//
//         }).catch(function (err) {
//             return next(err);
//         })
//     }
//     // else //TODO pt
//     // {
//     //     models.pt.findOne({where:{email:req.body.email}}).then(function (pt) {
//     //         if(Object.keys(pt).length !== 0)
//     //         {
//     //
//     //
//     //
//     //
//     //
//     //
//     //
//     //         }
//     //     }).catch(function (err) {
//     //         return next(err);
//     //     })
//     // }
//
//
// }
//



// // NOTE: this could be implemented somewhat more efficiently with tokens
// // TODO: error handling
// exports.forgotPassword = (req, res, next) => {
//     if (typeof req.body.email !== 'string')
//         return res.status(400).send('No email');
//
//     // TODO handle scenario where patient/pt have same emails
//
//     models.patient.findOne({
//         where: {email: req.body.email}
//     })
//     .then(function(user) {
//         if(Object.keys(user).length === 0)
//         {
//             // check pts, update pt if exists
//
//             models.pt.findOne({where:{email:req.body.email}}).then(function (pt) {
//                 if(Object.keys(pt).length !== 0)
//                 {
//                     // pt exists with that email
//                     user = pt;
//                 }
//                 else
//                 {
//                     return res.status(400).send('no user with that email');
//                 }
//             })
//
//             console.log('inside' + user);
//
//             //TODO test this for pts. asynchronocity problem?
//
//             // crypto.randomBytes(10, function(err, buf) {
//             //     var token = buf.toString('hex') + Date.now().toString();
//             //     user.forgotPasswordHash = token;
//             //     user.forgotPasswordExpires = Date.now() + 3600000; // 1 hour
//             //
//                 user.save().then(function () {
//                     var smtpTransport = nodemailer.createTransport('SMTP', {
//                         service: 'gmail',
//                         auth: {
//                             user: 'tech.bodysync@gmail.com',
//                             pass: '/MdeUWK#<3)LEdKq'
//                         }
//                     });
//
//                     var mailOptions = {
//                         to: user.email,
//                         from: 'tech.bodysync@gmail.com',
//                         subject: 'Bodysync Password Reset',
//                         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//                         'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//                         'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//                         'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//                     };
//
//                     smtpTransport.sendMail(mailOptions, function(err) {
//                         res.send('An e-mail has been sent to ' + user.email + ' with further instructions.');
//                     });
//
//                 });
            // });
//
//         }
//
//         console.log('OUTSIDE THE IF OF USER '+user);
//
//     }).catch(function (err) {
//         console.log(err.Error.BaseError);
//         console.error(err);
//         return res.status(404).send('couldn not find');
//     })
// }

// function reset (db, req, res, next) {
//     db.findOne({ resetPasswordHash: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
//         if (!user) {
//           return res.status(400).send('Password reset token is invalid or has expired.');
//         }
//         return res.render('reset');
//   });
// }



/*

    Token validation

 */

exports.adminRequired = (req, res, next) => validateToken(req, res, next, true, true);

exports.ptRequired = (req, res, next) => validateToken(req, res, next, true, false);

// use for shared resources that pts and patients should both be able to access
// isPtRequired = false => pt access, patient access
exports.tokenRequired = (req, res, next) => validateToken(req, res, next, false, false);

function validateToken(req, res, next, isPtRequired, isAdminRequired) {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    console.log(token);
    if (!token) {
        return res.status(403).send('Token required');
    }

    try {
        // can change to async
        var decoded = jwt.verify(token, config.secret); // do not use jwt.decode with 'jsonwebtoken', does not check the signature using secret
    } catch (err) {
        return res.status(403).send('Failed to authenticate token');
    }
    // console.log(isPtRequired);
    // console.log(isAdminRequired);
    // console.log(decoded.isPt);
    // console.log(decoded.isAdmin);
    if (isPtRequired && !decoded.isPt)
        return res.status(403).send('You do not have access');

    if (isAdminRequired && !decoded.isAdmin)
        return res.status(403).send('You do not have access');

    /*

       TBU:  should definitely do some factoring here...

     */

    // resource is restricted to pts, so validate pt
    if (isPtRequired) {
        models.pt.findOne({
            where: {id: decoded.id}
        }).then(function(pt) {
            if (!pt) return res.status(403).send('Invalid token');
            var expired = false;
            if (decoded.id !== pt.id) expired = true;
            if (expired || token !== pt.token)
                return res.status(403).send('Expired token');

            req.body.ptId = pt.id;
            req.body.token = token;
            next();
        })
    // resource is not restricted to pts,  validate patient or pt, depending on the isPt token flag
    } else {
        // query pt table if pt
        if (decoded.isPt) {
            models.pt.findOne({
                where: {id: decoded.id}
            }).then(function(pt) {
                if (!pt) return res.status(403).send('Invalid token');
                var expired = false;
                if (decoded.id !== pt.id) expired = true;
                if (expired || token !== pt.token)
                    return res.status(403).send('Expired token');
                console.log('printing token');
                console.log(token);
                req.body.token = token;

                next();
            })
        }
        // query patient table if not pt
        else {
            models.patient.findOne({
                where: {id: decoded.id}
            }).then(function(patient) {
                if (!patient) return res.status(403).send('Invalid token');
                var expired = false;
                if (decoded.id !== patient.id) expired = true;
                if (expired || token !== patient.token)
                    return res.status(403).send('Expired token');

                next();
            })
        }
    }
}


// helper function
// call to authorize when requester's id appears in the query
// i.e. check that request (query) id is same as requester (token) id
// already retrieved and verified the token, so skipping error handling for the time being
exports.checkRequestIdAgainstId = (req, res) => {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];
    var decoded = jwt.verify(token, config.secret);

    // debugging
    // console.log('token id: ' + String(decoded.id));
    // console.log('query id: ' + String(req.params.id));

    if (req.params.id != decoded.id) {
        res.status(401).send('You are not authorized to see this resource');
        return false;
    } else {
        return true;
    }
    // is bool best way to do this?
}




