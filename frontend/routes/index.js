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

router.post('/pts', function(req, res, next) {
    request.post({
        url: config.apiUrl + '/pts',
        form: req.body
    }).pipe(res);
});

router.get('/new-exercise', function(req, res, next) {
    return res.render('new-exercise');
});
router.get('/add-measure', function(req, res, next) {
    return res.render('add-measure', {firstName: 'Josh'});
});

router.get('/create-patient', function(req, res, next) {
    return res.render('create-patient', { firstName: 'Josh', footerButton: 'Cancel', footerButton2: 'Submit' });
});

router.post('/login', function(req, res, next) {
    request.post(config.apiUrl + '/users', { form: req.body }).pipe(res);
});

router.get('/admin', auth.adminRequired, function(req, res, next) {
    if (req.user.isAdmin || req.user.isSuperAdmin)
        return res.redirect('/admin/coupons?token=' + req.token);
    return res.render('login');
});

router.get('/admin/coupons', auth.adminRequired, function(req, res, next) {
    return res.render('coupons', {
        token: req.token,
        isAdmin: !!req.user.isAdmin,
        isSuperAdmin: !!req.user.isSuperAdmin
    });
});

module.exports = router;