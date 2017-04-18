const express = require('express');
const router = express.Router();
const config = require('../app/models/config');
const auth = require('./auth');
const request = require('request');

router.get('/', function(req, res, next) {
    return res.render('index', { firstName: 'Josh', iconUrl: '#', footerButton: 'Contact', footerButton2: 'Add Measure'})
});

router.post('/', function(req, res, next) {
    request.post(config.apiUrl + '/users', { form: req.body }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/login', function(req, res, next) {
    return res.render('login', {footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.post('/login', function(req, res, next) {
    request.post(config.apiUrl + '/login/pt', { form: req.body }).pipe(res);
});

router.get('/logind', function(req, res, next) {
    return res.render('dev-login', {footerButton: 'Cancel', footerButton2: 'Submit' });
});

// -------------------------------------------------------------------------------
router.get('/pts/:id/patients', function(req, res, next) {
    request.get(config.apiUrl + '/pts/' + req.params.id + '/patients', {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

router.get('/patients', function(req, res, next) {
    return res.render('patients', {
        firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit'
    });
});

router.post('/patients', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/pts',
        form: req.body
    }).pipe(res);
});

router.post('/pts/:id/patients', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/pts/' + req.params.id + '/patients',
        form: req.body
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    request.get({
        url: config.apiUrl + '/romMetrics' + req.params.id + '/romMetricMeasures',
        headers: {'x-access-token': req.query.token}
    }, function(err, response, body) {
        return JSON.parse(body)
    })
});

router.post('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/romMetrics/' + req.params.id + '/romMetricMeasures',
        form: req.body
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/patients/:id/injuries', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id + '/injuries?token=' + req.query.token, function(err, response, body) {
        if (!err && response.statusCode == 200)
            return res.render('add-measure', { injuries: JSON.parse(body), footerButton: 'Cancel', footerButton2: 'Submit' });
        else return res.render('add-measure', { injuries: [], footerButton: 'Cancel', footerButton2: 'Submit' });
    })
});

router.post('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    if (!req.headers['x-access-token'] && !req.query.token) return res.sendStatus(400);
    request.post({
        url: config.apiUrl + '/romMetrics/' + req.params.id + '/romMetricMeasures',
        headers: { 'x-access-token': req.headers['x-access-token'] || req.query.token },
        form: req.body
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/pt-form', function(req, res, next) {
    return res.render('pt-form', { firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/create-patient', function(req, res, next) {
    return res.render('create-patient', { firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit', ptId: 1});
});

router.get('/new-exercise', function(req, res, next) {
    return res.render('new-exercise');
});

// -------------------------------------------------------------------------------

router.get('/patient-status', function(req, res, next) {
    return res.render('patient-status', {firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit', Id: 1});
});

module.exports = router;