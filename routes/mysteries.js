const express = require('express');
const router = express.Router();
const mysteries = require('../controllers/mysteries');
const catchAsync = require('../utils/catchAsync');
const Mystery = require('../models/mystery');
const ExpressError = require('../utils/ExpressError');
const { mysterySchema, spokinessSchema } = require('../validationSchemas.js');
const { isLoggedIn, isAuthor, validateMystery, validateUpdateMystery, validateSpookiness } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });



router.route('/')
    .get(catchAsync(mysteries.index))
    .post(isLoggedIn, upload.single('image'), validateMystery, catchAsync(mysteries.createMystery));

router.get('/new', isLoggedIn, mysteries.renderNewForm);

router.get('/search/spooky', mysteries.renderSpooky);
router.get('/search/recent', mysteries.renderRecent);
router.get('/search/credible', mysteries.renderCredibility);
//router.get('/search/:mysteryName', mysteries.renderName);

router.route('/:id')
    .get(catchAsync(mysteries.showMystery))
    .put(isLoggedIn, isAuthor, upload.single('image'), validateUpdateMystery, catchAsync(mysteries.updateMystery))
    .delete(isLoggedIn, isAuthor, catchAsync(mysteries.deleteMystery))
    .patch(isLoggedIn, isAuthor, catchAsync(mysteries.deleteImage));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(mysteries.renderEditForm));

router.post('/:id/rating', isLoggedIn, validateSpookiness, catchAsync(mysteries.rateMystery));


module.exports = router;