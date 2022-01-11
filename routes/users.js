const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const { reportSchema } = require('../validationSchemas.js');
const { isLoggedIn, validateUser, checkUserStatus, validateReport } = require('../middleware');
const User = require('../models/user');

router.route('/register')
    .get(users.renderRegister)
    .post(validateUser, catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

router.get('/help', users.userHelp);

router.get('/user/:username', users.showUser);

router.get('/user/:username/load', users.loadMysteries);

router.post('/report/mystery/:reportedId', isLoggedIn, validateReport, catchAsync(users.reportMystery));
router.post('/report/evidence/:reportedId', isLoggedIn, validateReport, catchAsync(users.reportEvidence));
router.post('/report/user/:reportedId', isLoggedIn, validateReport, catchAsync(users.reportUser));

module.exports = router;