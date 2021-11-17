const { mysterySchema, updateMysterySchema, evidenceSchema, spookinessSchema } = require('./validationSchemas.js');
const ExpressError = require('./utils/ExpressError');
const Mystery = require('./models/mystery');
const Evidence = require('./models/evidence');

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be logged in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateMystery = (req, res, next) => {
    const { error } = mysterySchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join('.');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validateUpdateMystery = (req, res, next) => {
    const { error } = updateMysterySchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join('.');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const mystery = await Mystery.findById(id);
    if(!mystery.author.equals(req.user._id)){
        req.flash('error', 'You have no permission to do that.');
        return res.redirect(`/mysteries/${mystery._id}`);
    }
    next(); 
}

module.exports.isEvidenceAuthor = async(req, res, next) => {
    const { id, evidenceId } = req.params;
    const evidence = await Evidence.findById(evidenceId);
    if(!evidence.author.equals(req.user._id)){
        req.flash('error', 'You have no permission to do that.');
        return res.redirect(`/mysteries/${id}`);
    }
    next(); 
}

module.exports.validateEvidence = (req, res, next) => {
    const { error } = evidenceSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join('.');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validateSpookiness = (req, res, next) =>{
    console.log(req.body);
    const { error } = spookinessSchema.validate({spookiness: {value: req.body.spookiness}});
    if(error){
        const msg = error.details.map(el => el.message).join('.');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}