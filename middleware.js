const { mysterySchema, updateMysterySchema, evidenceSchema, spookinessSchema, userSchema, reportSchema, newPasswordSchema } = require('./validationSchemas.js');
const ExpressError = require('./utils/ExpressError');
const Mystery = require('./models/mystery');
const Evidence = require('./models/evidence');
const User = require('./models/user');

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be logged in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isBanned = async (req, res, next) =>{
    const bannedUser = await User.findOne({username: req.user.username}).exec();
    if(parseInt(bannedUser.banned) > 0){
        if(parseInt(bannedUser.banned) > 999){
            return res.redirect(`/logout?b=999999`);
        } else{
            return res.redirect(`/logout?b=${bannedUser.banned}`);
        }
    }
    next();
}

module.exports.checkUserStatus = async(req, res, next) =>{
    const checkedUser = await User.findById(req.user._id).exec();
    if(checkedUser.status === 'unconfirmed') {
        req.flash('error', 'You must first verify your email address to do that');
        return res.redirect(`/user/${req.user.username}`);
    }
    if(parseInt(checkedUser.banned) > 0 ){
        return res.redirect('/logout');
    }
    next();
}

module.exports.validateUser = (req, res, next) => {
    const userBody = {user : {username: req.body.username, password: req.body.password, email: req.body.email, birthdate: req.body.birthdate}};
    const { error } = userSchema.validate(userBody);
    if(error){
        //const msg = error.details.map(el => el.message).join('.');
        const msg = 'Data is not valid';
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validateMystery = (req, res, next) => {
    const { error } = mysterySchema.validate(req.body);
    if(error){
        //const msg = error.details.map(el => el.message).join('.');
        const msg = 'Data is not valid';
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validateUpdateMystery = (req, res, next) => {
    const { error } = updateMysterySchema.validate(req.body);
    if(error){
        //const msg = error.details.map(el => el.message).join('.');
        const msg = 'Data is not valid';
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const mystery = await Mystery.findById(id);
    const isAdmin = await User.findById(req.user._id).exec();
    if(!mystery.author.equals(req.user._id) && (isAdmin.isAdmin === false)){
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/mysteries/${mystery._id}`);
    }
    next(); 
}

module.exports.isEvidenceAuthor = async(req, res, next) => {
    const { id, evidenceId } = req.params;
    const evidence = await Evidence.findById(evidenceId);
    const isAdmin = await User.findById(req.user._id).exec();
    if(!evidence.author.equals(req.user._id) && (isAdmin.isAdmin === false)){
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/mysteries/${id}`);
    }
    next(); 
}

module.exports.validateEvidence = (req, res, next) => {
    const { error } = evidenceSchema.validate(req.body);
    if(error){
        //const msg = error.details.map(el => el.message).join('.');
        const msg = 'Data is not valid';
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validateSpookiness = (req, res, next) =>{
    const { error } = spookinessSchema.validate({spookiness: {value: req.body.spookiness}});
    if(error){
        //const msg = error.details.map(el => el.message).join('.');
        const msg = 'Data is not valid';
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validateReport = (req, res, next) =>{
    const { error } = reportSchema.validate({report: {report: req.body.report}});
    if(error){
        const msg = 'Data is not valid';
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.validatePassword = (req, res, next) =>{
    const { error } = newPasswordSchema.validate({password: {password: req.body.newpassword}});
    if(error){
        const msg = 'Data is not valid';
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

module.exports.isAdmin = (req, res, next) => {
    const err = {message: 'Page not found', stack: 'Error: Page not found at C:\\Hauntrip\\index.js:161:10 at Layer.handle [as handle_request] (C:\\Hauntrip\\node_modules\\express\\lib\router\\layer.js:95:5) at next (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:137:13) at next (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:131:14) at next (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:131:14) at next (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:131:14) at next (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:131:14) at next (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:131:14) at next (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:131:14) at Route.dispatch (C:\\Hauntrip\\node_modules\\express\\lib\\router\\route.js:112:3)'}
    if(!req.isAuthenticated()){
        return res.render('error', {err});
    }
    if(!req.user.isAdmin){
        return res.render('error', {err});
    }
    const adminUser = User.findById(req.user._id).exec();
    if(!adminUser){
        return res.render('error', {err});
    }
    next();
}