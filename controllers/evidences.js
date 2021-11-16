const Mystery = require('../models/mystery');
const Evidence = require('../models/evidence');
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

module.exports.deleteEvidence = async (req, res) =>{
    await Mystery.findByIdAndUpdate(req.params.id, {$pull: { evidences: req.params.evidenceId }});
    await Evidence.findByIdAndDelete(req.params.evidenceId);
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
