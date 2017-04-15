var models = require('../models/index');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
// app.locals.config = config not working?
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];

// const url = require('url');

module.exports.createSession = (req, res, next) => {
    console.log('in create session');
    console.log(req.url);
    return;
}
module.exports.logSession = (req, res, next) => {
    console.log('in log session');
    console.log(req.url);
    return;
}

module.exports.endSession = (req, res, next) => {
    console.log('in end session');
    console.log(req.url);
    return;
}