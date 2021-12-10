const Mystery = require('../models/mystery');
const Evidence = require('../models/evidence');
const User = require('../models/user');
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
    await evidence.save();
    await mystery.save();
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
    //Updates Evidence total helpfulness value
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
                const updatedEvidence = await Evidence.findByIdAndUpdate(evidenceId, {helpfulness: newValue});
                //If evidence is considered helpful, experience points are given both to evidence author and mystery author
                if(updatedEvidence.expgiven === 0 && newValue === 5){
                    await Evidence.findByIdAndUpdate(evidenceId, {expgiven: 5});
                    await User.findByIdAndUpdate(updatedEvidence.author, {$inc: {exp: 5}});
                    const mysteryAuthor = await Mystery.findOne({_id: id}).select('author');
                    await User.findByIdAndUpdate(mysteryAuthor.author, {$inc: {exp: 2}});
                }
                //If evidence is VERY helpful, bonus experience points are given to evidence author
                if(updatedEvidence.expgiven === 5 && newValue === 10){
                    await Evidence.findByIdAndUpdate(evidenceId, {expgiven: 15});
                    await User.findByIdAndUpdate(updatedEvidence.author, {$inc: {exp: 10}});
                }
                //Helpful evidences will impact on Mystery credibility
                if(newValue >= 3 && newValue <= 6){
                    const mysteryId = ObjectId(req.params.id);
                    if(newValue >= 5){
                        var isHelpful = true;
                    } 
                    if(newValue <= 4){
                        var isHelpful = false;
                    }
                    //Search all helpful evidences
                    await Evidence.findByIdAndUpdate(evidenceId, { isHelpful });
                    const mysteryEvidences = await Mystery.findOne({_id: id}).populate({
                        path: 'evidences',
                        select: 'conclusion',
                        match: { isHelpful: true }
                    }).select('evidences').exec();
                    //Calculates a ratio between real helpful evidences vs total helpful evidences
                    const realTotal = mysteryEvidences.evidences.reduce((acc, current) => {
                        if(current.conclusion === 'real'){ 
                            return acc + 1
                        }
                        return acc;
                    }, 0);
                    const ratio = Math.round((realTotal/mysteryEvidences.evidences.length)*100);
                    await Mystery.findByIdAndUpdate(id, {credibility: ratio});
                }
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
