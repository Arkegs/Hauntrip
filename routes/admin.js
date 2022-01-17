const express = require('express');
const router = express.Router();
const passport = require('passport');
const admins = require('../controllers/admins');
const catchAsync = require('../utils/catchAsync');
const { reportSchema } = require('../validationSchemas.js');
const { isAdmin, isUser, validateUser, checkUserStatus, isBanned, validateReport, validatePassword } = require('../middleware');
const User = require('../models/user');

router.route('/banpanel')
    .get(isAdmin, admins.renderBanPanel)
    .post(isAdmin, admins.banUser);

router.route('/:action')
    .get(isAdmin, admins.renderAdminPanel)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(isBanned));

router.delete('/evidenceDelete/:evidenceId', isAdmin, catchAsync(admins.deleteEvidence));
router.delete('/reportDismiss/:reportId', isAdmin, catchAsync(admins.dismissReport));

module.exports = router;