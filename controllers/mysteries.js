const Mystery = require('../models/mystery');
const Spookiness = require('../models/spookiness');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');
const { ObjectId } = require('mongodb');

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
    if(mystery.image.length){
        mystery.image = { url: req.file.path, filename: req.file.filename };
    }
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
    if(req.user){
        const userSpookiness = await Spookiness.find({mystery: req.params.id, author: req.user._id});
        let userSpookinessValue = 0;
        if(userSpookiness[0] !== undefined){
            userSpookinessValue = userSpookiness[0].value;
        }
        return res.render('mysteries/show', { mystery, userSpookinessValue });
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

module.exports.rateMystery = async (req, res) => {
    const { id } = req.params;
    mongooseId = ObjectId(id);
    //If user has not rated yet, creates a new rating on DB
    const answer = await Spookiness.findOne({author: req.user._id, mystery:id}).exec();
    if(!answer){
       const spookiness = new Spookiness();
       spookiness.value = req.body.spookiness;
       spookiness.author = req.user._id;
       spookiness.mystery = id;
       await spookiness.save();
    //Otherwise, update existing user rate  
    } else{
       await Spookiness.findByIdAndUpdate( answer._id, {value: req.body.spookiness});
    }
    //Updates Mystery average spookiness
    await Spookiness.aggregate([
        {
            $match: {
                mystery: mongooseId
            }
        },
        {
            $group: {
                _id: '$mystery',
                average: {$avg: '$value'}
            }
        }
        ], async function(err, results){
            if(err){
                throw(err);
            }else{
                newValue = Math.round(results[0].average)
                await Mystery.findByIdAndUpdate(id, {spookiness: newValue});
            }
        }
    );
    return res.redirect(`/mysteries/${id}`);
};

module.exports.deleteMystery = async (req, res) => {
    const { id } = req.params;
    await Mystery.findByIdAndDelete(id);
    await Spookiness.deleteMany({mystery: id});
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