const Mystery = require('../models/mystery');
const Spookiness = require('../models/spookiness');
const Helpfulness = require('../models/helpfulness');
const Evidence = require('../models/evidence');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');
const { ObjectId } = require('mongodb');

module.exports.index = async (req, res) => {
    const mysteries = await Mystery.find({}) 
    res.render('mysteries/index', { mysteries });
};

module.exports.renderSpooky = async(req, res) => {
    let pageNum = 1
    if(req.query.page){
        pageNum = parseInt(req.query.page);
    }
    if(!pageNum){
        res.redirect('/mysteries');
    }
    const mysteries = await Mystery.paginate({},{page: pageNum, limit:4, sort: {spookiness: 'desc',  "_id" : 'asc'}});
    if(mysteries.docs.length < 1){
        res.redirect('/mysteries');
    }
    res.render('mysteries/searchIndex', { mysteries: mysteries.docs, totalPages: mysteries.totalPages, currentPage: mysteries.page, searchTitle: 'Spookiest mysteries' });
};

module.exports.renderRecent = async(req, res) => {
    let pageNum = 1
    if(req.query.page){
        pageNum = parseInt(req.query.page);
    }
    if(!pageNum){
        res.redirect('/mysteries');
    }
    const mysteries = await Mystery.paginate({},{page: pageNum, limit:4, sort: {createdAt: 'desc',  "_id" : 'asc'}});
    if(mysteries.docs.length < 1){
        res.redirect('/mysteries');
    }
    console.log(mysteries);
    res.render('mysteries/searchIndex', { mysteries: mysteries.docs, totalPages: mysteries.totalPages, currentPage: mysteries.page, searchTitle: 'Most recent mysteries' });
};

module.exports.renderCredibility = async(req, res) => {
    let pageNum = 1
    if(req.query.page){
        pageNum = parseInt(req.query.page);
    }
    if(!pageNum){
        res.redirect('/mysteries');
    }
    const mysteries = await Mystery.paginate({},{page: pageNum, limit:4, sort: {credibility: 'desc',  "_id" : 'asc'}});
    if(mysteries.docs.length < 1){
        res.redirect('/mysteries');
    }
    res.render('mysteries/searchIndex', { mysteries: mysteries.docs, totalPages: mysteries.totalPages, currentPage: mysteries.page, searchTitle: 'Most credible mysteries' });
};

module.exports.renderNewForm = (req, res) => {
    res.render('mysteries/new');
};

module.exports.createMystery = async (req, res, next) => {
    // if(!req.body.mystery) throw new ExpressError('Invalid mystery data', 400);
    const mystery = new Mystery(req.body.mystery);
    mystery.geometry = {type: 'Point', coordinates: req.body.mystery.geometry.split(',').reverse()};
    const location = await geocoder.reverseGeocode({
        query: mystery.geometry.coordinates
    }).send();
    if(location.body.features.length > 0){
        mystery.location = location.body.features[0].context.pop().text + ', ' + location.body.features[0].context.pop().text;
    }
    else{
        mystery.location = 'Unknown location'
    }
    if(req.file){
        mystery.image = { url: req.file.path, filename: req.file.filename };
    }
    mystery.author = req.user._id;
    await mystery.save();
    req.flash('success', 'Succesfully made a new Mystery!');
    res.redirect(`/mysteries/${mystery._id}`);
};

module.exports.showMystery = async (req, res) => {
    const mystery = await Mystery.findById(req.params.id).populate({
        path: 'evidences',
        options:{
            limit: 5,
            sort: {createdAt: -1}
        },
        populate:{
            path: 'author'
        }
    }).populate('author');
    console.log(mystery.evidences);
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

module.exports.loadMysteryEvidences = async (req, res) =>{
    const mysteryQuery = await Mystery.findById(req.params.id).populate({
        path: 'evidences',
        options:{
            skip: parseInt(req.query.skip),
            limit: 5,
            sort: {createdAt: -1}
        },
        populate:{
            path: 'author'
        }
    }).populate('author').exec();
    if(req.user){
        const mystery = {
            mystery: mysteryQuery,
            currentUser: req.user._id.toString()
        }
        console.log(mystery);
        return res.send(mystery);
    }
    const mystery = mysteryQuery;
    return res.send(mystery);
}

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
    console.log(req.file);
    if(req.file){
        if(mystery.image.filename){
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
    //If user has not rated this mystery yet, a new rating is created on DB
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
    const deletedMystery = await Mystery.findById(id).exec();
    //If Mystery has related Evidence, it must be deleted too
    if(deletedMystery.evidences.length > 0){
        console.log(deletedMystery.evidences);
        //Must check if Evidence has photos. If so, remove them from Cloudinary
        for(let evidence of deletedMystery.evidences){
            deletedEvidence = await Evidence.findById(evidence).exec();
            if(deletedEvidence.images.length > 0){
                let toDestroy = [];
                for(let evidenceImage of deletedEvidence.images){
                    toDestroy.push(evidenceImage.filename);
                }
                await cloudinary.api.delete_resources(toDestroy);
            }
            //All upvotes from every Evidence is deleted too    
            await Helpfulness.deleteMany({evidence: evidence});
            //Finally, each Evidence is deleted
            await Evidence.findByIdAndDelete(evidence).exec();
        }
    }
    //Once the Mystery has no longer related Evidence, it will be deleted starting on its image
    if(deletedMystery.image.filename){
        await cloudinary.uploader.destroy(deletedMystery.image.filename);
    }
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