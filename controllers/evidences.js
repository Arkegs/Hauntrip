const Mystery = require('../models/mystery');
const Evidence = require('../models/evidence');
const Helpfulness = require('../models/helpfulness');
const { ObjectId } = require('mongodb');
const { cloudinary } = require('../cloudinary');

module.exports.createEvidence = async (req, res) => {
    const mystery = await Mystery.findById(req.params.id);
    const evidence = new Evidence(req.body.evidence);
    console.log(req.body);
    evidence.author = req.user._id;
    evidence.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
    mystery.evidences.push(evidence);
    console.log("Hasta aqui vamos bien");
    await evidence.save();
    await mystery.save();
    console.log(evidence);
    req.flash('success', 'Succesfully posted new Evidence');
    res.redirect(`/mysteries/${mystery._id}`); 
};

module.exports.rateEvidence = async (req, res) => {
    const { id, evidenceId } = req.params;
    mongooseId = ObjectId(evidenceId);
    //If user has not rated evidence yet, creates a new rating on DB
    const answer = await Helpfulness.findOne({author: req.user._id, evidence:evidenceId}).exec();
    if(!answer){
       const helpfulness = new Helpfulness();
       helpfulness.value = req.body.helpfulness;
       helpfulness.author = req.user._id;
       helpfulness.evidence = evidenceId;
       await helpfulness.save();
    //Otherwise, update existing user rate  
    } else{
       await Helpfulness.findByIdAndUpdate( answer._id, { value: req.body.helpfulness });
    }
    //Updates Evidence total helpfulness
    await Helpfulness.aggregate([
        {
            $match: {
                evidence: mongooseId
            }
        },
        {
            $group: {
                _id: '$evidence',
                total: {$sum: '$value'}
            }
        }
        ], async function(err, results){
            if(err){
                throw(err);
            }else{
                newValue = Math.round(results[0].total)
                console.log(newValue);
                await Evidence.findByIdAndUpdate(evidenceId, {helpfulness: newValue});
            }
        }
    );
    return res.redirect(`/mysteries/${id}`);
};

module.exports.deleteEvidence = async (req, res) =>{
    await Mystery.findByIdAndUpdate(req.params.id, {$pull: { evidences: req.params.evidenceId }});
    await Evidence.findByIdAndDelete(req.params.evidenceId);
    await Helpfulness.deleteMany({evidence: req.params.evidenceId});
    req.flash('success', 'Evidence was successfully deleted');
    res.redirect(`/mysteries/${req.params.id}`);
}

module.exports.deleteEvidenceImages = async (req, res, next) => {
    const { evidenceId } = req.params;
    const evidence = await Evidence.findById(evidenceId);
    if(evidence.images.length > 0){
        for (let img of evidence.images){
            await cloudinary.uploader.destroy(img.filename);
        }
    }
    next();
};
