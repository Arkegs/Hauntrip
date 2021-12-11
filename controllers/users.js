const User = require('../models/user');
const Mystery = require('../models/mystery');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try{
        const {email, username, password, birthdate} = req.body;
        const user = new User({email, username, birthdate});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash('success', 'Welcome to Hauntrip');
            res.redirect('/mysteries');
        })
    } catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) =>{
    res.render('users/login');
};

module.exports.login = (req, res) =>{
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/mysteries';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out. Good luck!');
    res.redirect('/mysteries');
};

module.exports.showUser = async (req, res) => {
    const userData = await User.findOne({username: req.params.username});
    const userMysteries = await Mystery.find({author: userData._id}).limit(10).sort({createdAt: -1}).select('title image').exec();
    if(!userData){
        req.flash('error', 'User not found');
        return res.redirect('/mysteries');
    }
    console.log(userMysteries);
    res.render('users/show', { userData, userMysteries });
}