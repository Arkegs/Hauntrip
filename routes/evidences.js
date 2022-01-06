const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateEvidence, isLoggedIn, isEvidenceAuthor } = require('../middleware');
const evidence = require('../controllers/evidences');
const catchAsync = require('../utils/catchAsync');
const Mystery = require('../models/mystery');
const Evidence = require('../models/evidence');
const ExpressError = require('../utils/ExpressError');
const { evidenceSchema } = require('../validationSchemas.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage, limits: {fileSize: 1000*1000} });

router.post('/', isLoggedIn, upload.array('images', 3), validateEvidence, catchAsync(evidence.createEvidence));

router.route('/:evidenceId')
    .post(isLoggedIn, catchAsync(evidence.rateEvidence))
    .delete(isLoggedIn, isEvidenceAuthor, catchAsync(evidence.deleteEvidenceImages), catchAsync(evidence.deleteEvidence));

module.exports = router;