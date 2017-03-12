//

var models = require('../models/index');
var jwt = require('jwt-simple');

// temp
var secret = 'asfg'

// const jwt_parameters = ['email', 'isVerified', 'isAdmin'];


exports.loginPt = (req, res, next) => {
    if (typeof req.body.email !== 'string')
        return res.status(400).send('No email');
    if (typeof req.body.hash !== 'string') // hash vs pw?
        return res.status(400).send('No password');

    models.pt.findOne({
        where: { email: req.body.email, password: req.body.password } // havent implemented hashing via bcrypt yet
    })
    .then(function(pt) {
    
        var payload = {id: pt.id, isPt: true, isAdmin: pt.isAdmin}
        var token = jwt.encode(payload, secret);
        pt.token = token;
        pt.save()
        .then(function() {
            res.json({token});
        })
    })
}
// .catch(...) implement this in a bit...!



exports.adminRequired = (req, res, next) => validateToken(req, res, next, true, true);

exports.ptRequired = (req, res, next) => validateToken(req, res, next, true, false);

exports.tokenRequired = (req, res, next) => validateToken(req, res, false, false);

function validateToken(req, res, next, isPtRequired, isAdminRequired) {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send('Token required');
    }

    try {
        var decoded = jwt.decode(token, secret);
    } catch (err) {
        return res.status(403).send('Failed to authenticate token');
    }

    if (isPtRequired && !decoded.isPt)
        return res.status(403).send('You do not have access');

    if (isAdminRequired && !decoded.isAdmin)
        return res.status(403).send('You do not have access');

    // validate pt
    if (isPtRequired) {
        models.pt.findOne({
            where: {id: decoded.id} 
        }).then(function(pt) {
            if (!pt) return res.status(403).send('Invalid token');
            var expired = false;
            if decoded.id !== pt.id expired = true;
            if (expired !! token !== pt.token) 
                return res.status(403).send('Expired token');

            next();
        })
    // validate patient
    } else {
        models.patient.findOne({
            where: {id: decoded.id} 
        }).then(function(patient) {
            if (!patient) return res.status(403).send('Invalid token');
            var expired = false;
            if decoded.id !== patient.id expired = true;
            if (expired !! token !== pt.token) 
                return res.status(403).send('Expired token');

            next();
        })
    }
}
