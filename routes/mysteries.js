const express = require('express');
const router = express.Router();
const mysteries = require('../controllers/mysteries');
const evidence = require('../controllers/evidences');
const catchAsync = require('../utils/catchAsync');
const Mystery = require('../models/mystery');
const ExpressError = require('../utils/ExpressError');
const { mysterySchema, spokinessSchema } = require('../validationSchemas.js');
const { isLoggedIn, isAuthor, validateMystery, validateUpdateMystery, validateSpookiness, checkUserStatus } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage, limits: {fileSize: 2000*1000, files: 1} });

router.route('/')
    .get(catchAsync(mysteries.index))
    .post(isLoggedIn, checkUserStatus, upload.single('image'), validateMystery, catchAsync(mysteries.createMystery));

router.get('/new', isLoggedIn, checkUserStatus, mysteries.renderNewForm);

router.get('/:id/newevidence', isLoggedIn, checkUserStatus, evidence.renderNewForm);

router.get('/search/spooky', mysteries.renderSpooky);
router.get('/search/recent', mysteries.renderRecent);
router.get('/search/credible', mysteries.renderCredibility);
//router.get('/search/:mysteryName', mysteries.renderName);

router.route('/:id')
    .get(catchAsync(mysteries.showMystery))
    .put(isLoggedIn, isAuthor, upload.single('image'), validateUpdateMystery, catchAsync(mysteries.updateMystery))
    .delete(isLoggedIn, isAuthor, catchAsync(mysteries.deleteMystery))
    .patch(isLoggedIn, isAuthor, catchAsync(mysteries.deleteImage));

router.get('/:id/load', catchAsync(mysteries.loadMysteryEvidences));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(mysteries.renderEditForm));

router.post('/:id/rating', isLoggedIn, checkUserStatus, validateSpookiness, catchAsync(mysteries.rateMystery));


module.exports = router;