//
var models = require('../models/index');
var jwt = require('jsonwebtoken');

// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];  


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
            var payload = {id: pt.id, isPt: true, isAdmin: pt.isAdmin}
             
            // fuck with flags as you wish
            // can change to async, see docs https://github.com/auth0/node-jsonwebtoken
            var token = jwt.sign(payload, config.secret, {expiresIn: 60*60 }); // jwt.encode for 'jwt-simple'
             
            pt.token = token;
            pt.save()
                .then(function () {
                    res.json({token: token});
                });


        }
        else {
            return res.status(401).send('bad hash');
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
            var payload = {id: patient.id, isPt: false, isAdmin: false}
             
            // fuck with flags as you wish
            // can change to async, see docs https://github.com/auth0/node-jsonwebtoken

            var token = jwt.sign(payload, config.secret, {expiresIn: 60*60 }); // jwt.encode for 'jwt-simple'
         
            patient.token = token;
            patient.save()
                .then(function () {
                    res.json({token: token});
                });


        }
        else {
            return res.status(401).send('bad hash');
        }
    }).catch(function(e) {
        return res.status(401).send(JSON.stringify(e));
    })
}

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

    if (!token) {
        return res.status(403).send('Token required');
    }

    try {
        // can change to async
        var decoded = jwt.verify(token, config.secret); // do not use jwt.decode with 'jsonwebtoken', does not check the signature using secret
    } catch (err) {
        return res.status(403).send('Failed to authenticate token');
    }
    console.log(isPtRequired);
    console.log(isAdminRequired);
    console.log(decoded.isPt);
    console.log(decoded.isAdmin);
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
    console.log('token id: ' + String(decoded.id));
    console.log('query id: ' + String(req.params.id));
    
    if (req.params.id != decoded.id) {
        res.status(401).send('You are not authorized to see this resource');
        return false;
    } else { 
        return true;
    }
    // is bool best way to do this?
}

