const express = require('express');
const router = express.Router();
const config = require('../app/models/config');
const auth = require('./auth');
const request = require('request');

router.get('/', (req, res, next) => {
    return res.render('index', { firstName: 'Josh', iconUrl: '#', footerButton: 'Contact', footerButton2: 'Add Measure'});
});

router.post('/', function(req, res, next) {
    request.post(config.apiUrl + '/users', { form: req.body }).pipe(res);
});

router.get('/login', function(req, res, next) {
    return res.render('login');
});

router.get('/pt-form', function(req, res, next) {
    return res.render('pt-form', { firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit' });
});

// added
router.get('/pt/patients', (req, res, next) => {
    request.get(config.apiUrl + '/patients', (err, response, body) => {
    if (!err && response.statusCode == 200)
return res.render('patients', {patients: JSON.parse(body)});
else return res.render('patients', {footerButton2: 'Add Patient', patients: []});
});
});

// router.post('/pt/patients', (req, res, next) => {
//     request.post(config.apiUrl + '/patients', {
//         headers: { 'x-access-token': req.headers['x-access-token'] },
//         form: req.body
//     }).pipe(res);
// });

// router.put('/pt/patients', (req, res, next) => {
//     request.put(config.apiUrl + '/patients/' + req.body.id, {
//         headers: { 'x-access-token': req.headers['x-access-token'] },
//         form: req.body
//     }).pipe(res);
// });

// router.post('/pt/deletepatient', (req, res, next) => {
//     if (!req.body.id) return res.sendStatus(400);
//     request.delete(config.apiUrl + '/patients/' + req.body.id, {
//         headers: { 'x-access-token': req.headers['x-access-token'] }
//     }).pipe(res);
// });

router.get('/pts/:id/patients', function(req, res, next) {
    request.get({
        url: config.apiUrl + '/pts/' + req.params.id + '/patients',
        headers: {'x-access-token': req.query.token},
    }, (err, response, body) => {
        return res.render('patients', {firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit', patients: JSON.parse(body)});
    });
});

router.post('/patients', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/pts',
        form: req.body
    }).pipe(res);
});

// end added

router.get('/new-exercise', function(req, res, next) {
    return res.render('new-exercise');
});
router.get('/add-measure', function(req, res, next) {
    return res.render('add-measure', {firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit', Id: 1});
});

router.get('/patient-status', function(req, res, next) {
    return res.render('patient-status', {firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit', Id: 1});
});

router.post('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/romMetrics/' + req.params.id + '/romMetricMeasures',
        form: req.body
    }).pipe(res);
});

router.get('/create-patient', function(req, res, next) {
    return res.render('create-patient', { firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit', ptId: 1});
});

router.post('/pts/:id/patients', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/pts/' + req.params.id + '/patients',
        form: req.body
    }).pipe(res);
});

router.post('/login', function(req, res, next) {
    request.post(config.apiUrl + '/login/pt', { form: req.body }).pipe(res);
});

module.exports = router;