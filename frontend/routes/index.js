const express = require('express');
const router = express.Router();
const config = require('../app/models/config');
const auth = require('./auth');
const request = require('request');

router.get('/', function(req, res, next) {
    return res.render('login', { firstName: 'Josh', iconUrl: '#', footerButton: 'Contact', footerButton2: 'Submit'})
});

router.get('/patient-home', function(req, res, next) {
    return res.render('patient-home', { type: 'patient', iconUrl: '#', footerButton: 'Contact', footerButton2: 'Add Measure'})
});

router.post('/', function(req, res, next) {
    request.post(config.apiUrl + '/users', { form: req.body }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/login', function(req, res, next) {
    return res.render('login', { url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/forgotpassword', function(req, res, next) {
    return res.render('forgotpassword', { url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/reset/:token', function(req, res, next) {
    return res.render('reset', { url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('');

router.get('/exercises', function(req, res, next) {
    return res.render('exercises', { type: 'patient'});
});

router.get('/loginnew', function(req, res, next) {
    return res.render('loginnew');
});

router.get('/pt-form', function(req, res, next) {
    return res.render('pt-form', { firstName: 'Josh', url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.post('/login', function(req, res, next) {
    request.post(config.apiUrl + '/login/pt', { form: req.body }).pipe(res);
});

router.post('/loginPatient', function(req, res, next) {
    request.post(config.apiUrl + '/login/patient', { form: req.body }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/pts/:id/patients', function(req, res, next) {
    request.get(config.apiUrl + '/pts/' + req.params.id + '/patients', {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

// get a specific patient's general info
router.get('/patients/:id', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id, {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

// get a specific patient's injuries
router.get('/patients/:id/injuries', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id + '/injuries', {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
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
        headers: {'x-access-token': req.headers['x-access-token']},
        form: req.body
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/injuries/:id/romMetrics', function(req, res, next) {
    request.get(config.apiUrl + '/injuries/' + req.params.id + '/romMetrics/?token=' + req.query.token, {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

router.get('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    request.get(config.apiUrl + '/romMetrics/' + req.params.id + '/romMetricMeasures?token=' + req.query.token, {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

router.get('/romMetrics/:id', function(req, res, next) {
    request.get(config.apiUrl + '/romMetrics/' + req.params.id + '/?token=' + req.query.token, {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

router.post('/injuries/:id/romMetrics', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/injuries/' + req.params.id + '/romMetrics',
        headers: {'x-access-token': req.headers['x-access-token']},
        form: req.body
    }).pipe(res);
});

router.post('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/romMetrics/' + req.params.id + '/romMetricMeasures',
        headers: {'x-access-token': req.headers['x-access-token']},
        form: req.body
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/patients/:id/injuries', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id + '/injuries?token=' + req.query.token, function(err, response, body) {
        if (!err && response.statusCode == 200)
            return res.render('add-measure', { injuries: JSON.parse(body), id: req.params.id, url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
        else return res.render('add-measure', { injuries: [], id: req.params.id, url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
    })
});

router.post('/patients/:id/injuries', function(req, res, next) {
    if (!req.headers['x-access-token'] && !req.query.token) return res.sendStatus(400);
    request.post({
        url: config.apiUrl + '/patients/' + req.params.id + '/injuries',
        headers: { 'x-access-token': req.headers['x-access-token'] || req.query.token },
        form: req.body
    }).pipe(res);
});

router.get('/findInjuries/:id', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id + '/injuries?token=' + req.query.token, {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

router.post('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    if (!req.headers['x-access-token'] && !req.query.token) return res.sendStatus(400);
    request.post({
        url: config.apiUrl + '/romMetrics/' + req.params.id + '/romMetricMeasures',
        headers: { 'x-access-token': req.headers['x-access-token'] || req.query.token },
        form: req.body
    }).pipe(res);
});

// ------------------------------------------------------------------------------

router.get('/patients/:id/exercises', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id + '/exercises?token=' + req.query.token, {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

router.post('/patients/:id/createSingleExercise', function(req, res, next) {
    if (!req.headers['x-access-token'] && !req.query.token) return res.sendStatus(400);
    request.post({
        url: config.apiUrl + '/patients/' + req.params.id + '/createSingleExercise',
        headers: { 'x-access-token': req.headers['x-access-token'] || req.query.token },
        form: req.body
    }).pipe(res);
});

// -------------------------------------------------------------------------------

router.get('/exercises/:id', function(req, res, next) {
    request.get(config.apiUrl + '/exercises/' + req.params.id + '/?token=' + req.query.token, {
        headers: {'x-access-token': req.query.token}
    }).pipe(res);
});

router.post('/exercises/:id/exerciseCompletions', function(req, res, next) {
    if (!req.headers['x-access-token'] && !req.query.token) return res.sendStatus(400);
    request.post({
        url: config.apiUrl + '/exercises/' + req.params.id + '/exerciseCompletions',
        headers: { 'x-access-token': req.headers['x-access-token'] || req.query.token },
        form: req.body
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/pt-form', function(req, res, next) {
    return res.render('pt-form', { firstName: 'Josh', url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/add-measure', function(req, res, next) {
    return res.render('add-measure', { injuries: [{id: 1, name: 'knee'}], firstName: 'Josh', url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/create-patient', function(req, res, next) {
    return res.render('create-patient', { url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit'});
});

router.get('/new-exercise', function(req, res, next) {
    return res.render('new-exercise');
});

// -------------------------------------------------------------------------------

router.get('/patient-status', function(req, res, next) {
    return res.render('patient-status', {  type: 'pt', url: '/add-measure', firstName: 'Josh', footerButton: 'Add Measure' });
});

router.get('/patient-status-patient', function(req, res, next) {
    return res.render('patient-status', {  type: 'patient', url: '/add-measure', firstName: 'Josh', footerButton: 'Add Measure' });
});

// patient view
router.get('/patients', function(req, res, next) {
    return res.render('patients', { type: 'pt', url: '/create-patient', footerButton: 'Add Patient' });
});

// exercise form view
router.get('/exercise-form', function(req, res, next) {
    return res.render('exercise-form', { footerButton: 'Back', footerButton2: 'Submit' });
});

// exercise set view
router.get('/exercise-set', function(req, res, next) {
    return res.render('exercise-set', { footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/edit-exercise-set', function(req, res, next) {
    return res.render('edit-exercise-set', { url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

module.exports = router;

// reset password view
router.get('/reset-password', function(req, res, next) {
    return res.render('reset-password', { url: '/patients', footerButton: 'Cancel', footerButton2: 'Submit' });
});

// error page
router.get('/error', function(req, res, next) {
    return res.render('error');
});


module.exports = router;
