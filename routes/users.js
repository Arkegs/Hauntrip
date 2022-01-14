const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const { reportSchema } = require('../validationSchemas.js');
const { isLoggedIn, isUser, validateUser, checkUserStatus, isBanned, validateReport } = require('../middleware');
const User = require('../models/user');

router.route('/register')
    .get(users.renderRegister)
    .post(validateUser, catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(isBanned), users.login);

router.get('/logout', users.logout);

router.get('/help', users.userHelp);

router.get('/verify', catchAsync(users.verifyAccount));
router.get('/resend', catchAsync(users.resendVerification));

router.route('/recovery')
     .get(users.renderRecovery)
     .post(catchAsync(users.recoverPasswordVerify));

router.get('/recovery/:hashId', catchAsync(users.recoverPassword));

router.route('/user/:username/passwordchange')
     .get(isLoggedIn, users.renderChange)
     .post(isLoggedIn, catchAsync(users.changePassword));

router.route('/user/:username')
      .get(users.showUser)
      .delete(isLoggedIn, users.normalDeleteUser);

router.get('/user/:username/load', users.loadMysteries);

router.post('/report/mystery/:reportedId', isLoggedIn, checkUserStatus, validateReport, catchAsync(users.reportMystery));
router.post('/report/evidence/:reportedId', isLoggedIn, checkUserStatus, validateReport, catchAsync(users.reportEvidence));
router.post('/report/user/:reportedId', isLoggedIn, checkUserStatus, validateReport, catchAsync(users.reportUser));

module.exports = router;