const express = require('express');
const router = express.Router();
const mysteries = require('../controllers/mysteries');
const catchAsync = require('../utils/catchAsync');
const Mystery = require('../models/mystery');
const ExpressError = require('../utils/ExpressError');
const { mysterySchema } = require('../validationSchemas.js');
const { isLoggedIn, isAuthor, validateMystery, validateUpdateMystery } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });



router.route('/')
    .get(catchAsync(mysteries.index))
    .post(isLoggedIn, upload.single('image'), validateMystery, catchAsync(mysteries.createMystery));

router.get('/new', isLoggedIn, mysteries.renderNewForm);

router.route('/:id')
    .get(catchAsync(mysteries.showMystery))
    .put(isLoggedIn, isAuthor, upload.single('image'), validateUpdateMystery, catchAsync(mysteries.updateMystery))
    .delete(isLoggedIn, isAuthor, catchAsync(mysteries.deleteMystery))
    .patch(isLoggedIn, isAuthor, catchAsync(mysteries.deleteImage));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(mysteries.renderEditForm));


module.exports = router;