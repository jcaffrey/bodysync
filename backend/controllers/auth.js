//
var models = require('../models/index');
var jwt = require('jsonwebtoken');

// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var nodemailer = require('nodemailer');

exports.loginPt = (req, res, next) => {
    if (typeof req.body.email !== 'string')
        return res.status(400).send('No email');
    if (typeof req.body.password !== 'string') // plaintext password
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
                            console.log('here');
                            req.body.token = token;
                            res.json({token: token});
                            return next();
                        });


                } else {
                    console.log('hfd');
                    var payload = {id: pt.id, isPt: true, sessionNumber: 1, isAdmin: pt.isAdmin};

                    var token = jwt.sign(payload, config.secret, {expiresIn: 60*60 }); // expiresIn is in seconds

                    pt.token = token;
                    console.log(pt);
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
};

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
};

exports.forgotPassword = (req, res, next) => {
    if (typeof req.body.email !== 'string')
        return res.status(400).send('No email');
    if (typeof req.body.isPt !== 'boolean' && typeof req.body.isPt !== 'string')
        return res.status(400).send('No user type');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.emailFromAddr,
            pass: config.emailPw
        }
    });

    if(req.body.isPt == 'false')
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
                        'http://' + config.frontendServer + '/reset-token/' + token + '/false' + '\n\n' +
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
    } else {
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
                ptPromise.then((pt) => {
                    var mailOptions = {
                        to: req.body.email,
                        from: `"${config.emailFromName}"<${config.emailFromAddr}>`,
                        subject: 'Prompt Therapy Solutions Forgot Password',
                        text: 'You are receiving this because you have requested to reset your password.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + config.frontendServer + '/reset-token/' + token + '/true' + '\n\n' +
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
};

// IMPT: after hitting the forgotPassword route, we will email the patient a link to the frontend
// then the frontend will post to /reset/:id on the backend with {isPt: false, newPassword: "plaintext"}
// if frontend recieves success from here, they should redirect to login

exports.resetPassword = (req, res, next) => {
    if (typeof req.body.isPt !== 'boolean' && typeof req.body.isPt !== 'string')
        return res.status(400).send('no isPt bool');
    if (typeof req.body.newPassword !== 'string')
        return res.status(400).send('no new pw');

    console.log('made it');

    if (req.body.isPt == 'false')
    {
        console.log('made it 1');
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

            } else {
                return res.status(400).send('no patient found')
            }
        }).catch(function (err) {
            return next(err);
        })
    } else {
        console.log('made it 2');
        models.pt.findOne({
            where: {
                forgotToken: req.params.token
            }
        }).then(function (pt) {
            console.log('made it 3');
            if (Object.keys(pt).length !== 0)
            {
                console.log('made it 4');
                pt.hash = models.pt.generateHash(req.body.newPassword);
                pt.forgotToken = null;
                console.log('made it 5');
                pt.save().then(() => {
                    return res.status(200).send('successfully reset pt pw');
                }).catch(function (err) {
                    console.log('made it 6');
                    return next(err);
                });
            } else {
                return res.status(400).send('no pt found');
            }
        }).catch(function (err) {
            console.log('made it 7');
            return next(err);
        })
    }
};

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




