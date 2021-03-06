const express = require('express');
const router = express.Router();
// var env = process.env.NODE_ENV || 'development';
const config = require('../app/models/config');//[env];
const auth = require('./auth');
const request = require('request');
const aws = require('aws-sdk');

router.get('/', function(req, res, next) {
    return res.render('login', { url: 'mailto:prompttherapysolutions@gmail.com', footerButton: 'Contact', footerButton2: 'Submit'})
});

router.post('/login', function(req, res, next) {
  console.log('printing config.apiUrl'+config.apiUrl);
  request.post(config.apiUrl + '/login/pt', { form: req.body }).pipe(res);
});

router.post('/loginPatient', function(req, res, next) {
    request.post(config.apiUrl + '/login/patient', { form: req.body }).pipe(res);
});

router.post('/loginAdmin', function(req, res, next) {
    request.post(config.apiUrl + '/login/pt', { form: req.body }).pipe(res);
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

router.get('/admin-login', function(req, res, next) {
    return res.render('admin-login', { url: '/admin', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/logoff', function(req, res, next) {
    request.get(config.apiUrl + '/logoff', {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.get('/forgotpassword', function(req, res, next) {
    return res.render('forgotpassword', { footerButton: 'Cancel', footerButton2: 'Submit'});
});

router.get('/reset-token/:token/:isPt', function(req, res, next) {
    return res.render('reset-password', { footerButton: 'Cancel', footerButton2: 'Submit', token: req.params.token, isPt: req.params.isPt });
});

router.post('/reset/:token', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/reset/' + req.params.token,
        headers: { 'x-access-token': req.headers['x-access-token'] },
        form: req.body
    }).pipe(res);
});

router.post('/forgotpassword', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/forgotpassword',
        form: req.body
    }).pipe(res);
});

router.get('/pts/:id/isVerified', function(req, res, next) {
    request.get(config.apiUrl + '/pts/' + req.params.id + '/isVerified?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.get('/patients/:id/isVerified', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id + '/isVerified?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.get('/agree', function(req, res, next) {
    request.get(config.apiUrl + '/agree/?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.get('/ptSessions/:patientId', function(req, res, next) {
    request.get(config.apiUrl + '/ptSessions/' + req.params.patientId + '/?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

// reset password view
router.get('/reset-password', function(req, res, next) {
    return res.render('reset-password', { footerButton: 'Cancel', footerButton2: 'Submit'});
});

router.get('/password-reset-message', function(req, res, next) {
    return res.render('password-reset-message', { url: '/login', footerButton: 'login' });
});

router.get('/exercises', function(req, res, next) {
    return res.render('exercises', { type: 'patient'});
});

router.get('/loginnew', function(req, res, next) {
    return res.render('loginnew');
});

router.get('/pt-form', function(req, res, next) {
    return res.render('pt-form', { footerButton: 'Cancel', footerButton2: 'Submit' });
});

// -------------------------------------------------------------------------------
router.get('/pts/:id/patients', function(req, res, next) {
    request.get(config.apiUrl + '/pts/' + req.params.id + '/patients', {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

// get a specific patient's general info
router.get('/patients/:id', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.delete('/patients/:id', function(req, res, next) {
  request.delete(config.apiUrl + '/patients/' + req.params.id + '/?token=' + req.query.token, {
    headers: { 'x-access-token': req.query.token }
  }).pipe(res);
});

// get a specific patient's injuries
router.get('/patients/:id/injuries', function(req, res, next) {
    request.get(config.apiUrl + '/patients/' + req.params.id + '/injuries', {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.post('/patients', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/pts',
        form: req.body
    }).pipe(res);
});

router.post('/pts', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/pts/',
        headers: {'x-access-token': req.headers['x-access-token']},
        form: req.body
    }).pipe(res);
});


router.put('/patients/:id', function(req, res, next) {
    if (!req.headers['x-access-token'] && !req.query.token) return res.sendStatus(400);
    request.put({
        url: config.apiUrl + '/patients/' + req.params.id,
        headers: { 'x-access-token': req.headers['x-access-token'] || req.query.token },
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

router.get('/pts/:id/isVerified', function(req, res, next) {
    request.get(config.apiUrl + '/pts/' + req.params.id + '/isVerified/?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/injuries/:id/romMetrics', function(req, res, next) {
    request.get(config.apiUrl + '/injuries/' + req.params.id + '/romMetrics/?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.get('/romMetrics/:id/romMetricMeasures', function(req, res, next) {
    request.get(config.apiUrl + '/romMetrics/' + req.params.id + '/romMetricMeasures?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.get('/romMetrics/:id', function(req, res, next) {
    request.get(config.apiUrl + '/romMetrics/' + req.params.id + '/?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
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
            return res.render('add-measure', { injuries: JSON.parse(body), id: req.params.id, footerButton: 'Cancel', footerButton2: 'Submit' });
        else return res.render('add-measure', { injuries: [], id: req.params.id, footerButton: 'Cancel', footerButton2: 'Submit' });
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
        headers: { 'x-access-token': req.query.token }
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
        headers: { 'x-access-token': req.query.token }
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
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

router.get('/exercises/:id/exerciseCompletions', function(req, res, next) {
    request.get(config.apiUrl + '/exercises/' + req.params.id + '/exerciseCompletions/?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
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

router.put('/exercises/:id', function(req, res, next) {
    if (!req.headers['x-access-token'] && !req.query.token) return res.sendStatus(400);
    request.put({
        url: config.apiUrl + '/exercises/' + req.params.id,
        headers: { 'x-access-token': req.headers['x-access-token'] || req.query.token },
        form: req.body
    }).pipe(res);
});

router.delete('/exercises/:id', function(req, res, next) {
    request.delete(config.apiUrl + '/exercises/' + req.params.id + '/?token=' + req.query.token, {
        headers: { 'x-access-token': req.query.token }
    }).pipe(res);
});

// -------------------------------------------------------------------------------
router.get('/pt-form', function(req, res, next) {
    return res.render('pt-form', { footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/add-measure', function(req, res, next) {
    return res.render('add-measure', { footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/add-injury', function(req, res, next) {
    return res.render('add-injury', { footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.get('/create-patient', function(req, res, next) {
    return res.render('create-patient', { footerButton: 'Cancel', footerButton2: 'Submit' });
});

// -------------------------------------------------------------------------------

router.get('/patient-status', function(req, res, next) {
    return res.render('patient-status', {  type: 'pt', url: '/add-measure', footerButton: 'Add Measure' });
});

router.get('/patient-status-patient', function(req, res, next) {
    return res.render('patient-status', {  type: 'patient', url: '/add-measure', footerButton: 'Add Measure' });
});

// patient view
router.get('/patients', function(req, res, next) {
    return res.render('patients', { type: 'pt', url: '/create-patient', footerButton: 'Add Patient' });
});

// admin view
router.get('/admin', function(req, res, next) {
    return res.render('admin', { type: 'admin', url: '/admin', footerButton: 'Clear', footerButton2: 'Submit' });
});

// exercise set view
router.get('/exercise-set', function(req, res, next) {
    return res.render('exercise-set', { footerButton: 'Back', footerButton2: 'Submit' });
});

router.get('/edit-exercise-set', function(req, res, next) {
    return res.render('edit-exercise-set', { footerButton: 'Cancel', footerButton2: 'Submit' });
});

// module.exports = router;

// error page
router.get('/error', function(req, res, next) {
    return res.render('error');
});

// AWS photo upload
router.get('/sign-s3', (req, res, next) => {
    const s3 = new aws.S3({
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        signatureVersion: 'v4',
        region: 'us-east-1',
    });
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: config.S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if(err){
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${config.S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(fileName)}`
        };
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

module.exports = router;
