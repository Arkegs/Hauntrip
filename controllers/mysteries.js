const Mystery = require('../models/mystery');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const mysteries = await Mystery.find({}) 
    res.render('mysteries/index', { mysteries });
};

module.exports.renderNewForm = (req, res) => {
    res.render('mysteries/new');
};

module.exports.createMystery = async (req, res, next) => {
    // if(!req.body.mystery) throw new ExpressError('Invalid mystery data', 400);
    const mystery = new Mystery(req.body.mystery);
    mystery.geometry = {type: 'Point', coordinates: req.body.mystery.geometry.split(',')};
    const location = await geocoder.reverseGeocode({
        query: mystery.geometry.coordinates
    }).send();
    mystery.location = location.body.features[0].context.pop().text + ', ' + location.body.features[0].context.pop().text;
    mystery.image = { url: req.file.path, filename: req.file.filename };
    mystery.author = req.user._id;
    await mystery.save();
    console.log(mystery);
    req.flash('success', 'Succesfully made a new Mystery!');
    res.redirect(`/mysteries/${mystery._id}`);
};

module.exports.showMystery = async (req, res) => {
    const mystery = await Mystery.findById(req.params.id).populate({
        path: 'evidences',
        populate:{
            path: 'author'
        }
    }).populate('author');
    if(!mystery){
        req.flash('error', 'Mystery not found');
        return res.redirect('/mysteries');
    }
    res.render('mysteries/show', { mystery });
};

module.exports.renderEditForm = async (req, res) => {
    const mystery = await Mystery.findById(req.params.id);
    if(!mystery){
        req.flash('error', 'Mystery not found');
        return res.redirect('/mysteries');
    }
    res.render('mysteries/edit', { mystery });
};

module.exports.updateMystery = async (req, res) => {
    const { id } = req.params;
    const mystery = await Mystery.findByIdAndUpdate(id, {... req.body.mystery});
    if(req.file){
        if(Object.keys(mystery.image).length !== 0){
            await cloudinary.uploader.destroy(mystery.image.filename);
        }
        mystery.image = { url: req.file.path, filename: req.file.filename };    
    }
    await mystery.save();
    req.flash('success', 'Succesfully edited the Mystery!');
    res.redirect(`/mysteries/${mystery._id}`);
};

module.exports.deleteMystery = async (req, res) => {
    const { id } = req.params;
    await Mystery.findByIdAndDelete(id);
    req.flash('success', 'Mystery was successfully deleted');
    res.redirect('/mysteries');
};

module.exports.deleteImage = async (req, res) => {
    const { id } = req.params;
    const mystery = await Mystery.findById(id);
    if(Object.keys(mystery.image).length !== 0){
        await cloudinary.uploader.destroy(mystery.image.filename);
        mystery.image = undefined;
        await mystery.save();
        req.flash('success', 'Image deleted');
        return res.redirect(`${id}/edit`);
    } else{
        req.flash('error', 'No image to delete');
        return res.redirect(`${id}/edit`);
    }
};