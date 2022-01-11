const User = require('../models/user');
const Mystery = require('../models/mystery');
const Evidence = require('../models/evidence');
const Report = require('../models/report');
const nodemailer = require('nodemailer');

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
            verifyMail('hauntrip.contact@gmail.com');
            req.flash('success', 'Welcome to Hauntrip! Please, verify your email to use all our features.');
            res.redirect('/mysteries');
        })
    } catch(e){
        if(e.message.substring(0,6) === 'E11000'){
            e.message = 'Email already in use'
        }
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) =>{
    res.render('users/login');
};

module.exports.login = (req, res) =>{
    req.flash('success', 'Welcome back!');
    const redirectUrl = '/mysteries';
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
    if(!userData){
        req.flash('error', 'User not found');
        return res.redirect('/mysteries');
    }
    const userMysteries = await Mystery.find({author: userData._id}).limit(10).sort({createdAt: -1}).select('title image').exec();
    res.render('users/show', { userData, userMysteries });
}

module.exports.loadMysteries = async (req, res) =>{
    const userData = await User.findOne({username: req.params.username});
    if(!userData){
        req.flash('error', 'User not found');
        return res.redirect('/mysteries');
    }
    const mysteryQuery = await Mystery.find({author: userData._id})
                                      .skip(parseInt(req.query.skip))
                                      .limit(10)
                                      .sort({createdAt: -1})
                                      .exec();
    return res.send(mysteryQuery);
}

module.exports.userHelp = (req, res) =>{
    res.render('users/help');
}

module.exports.reportMystery = async (req, res) =>{
    const reportedMystery = await Mystery.findOne({_id: req.params.reportedId}).exec();
    if(!reportedMystery){
        req.flash('error', 'Report could not be submitted. Please try again later');
        return res.redirect('back');
    }
    const report = new Report({report: req.body.report});
    report.reportType = 'mystery',
    report.reportedElement = req.params.reportedId;
    report.author = req.user._id;
    report.accused = reportedMystery.author;
    console.log(report);
    await report.save();
    req.flash('success', 'Your report has been successfully submitted');
    return res.redirect('back');
}

module.exports.reportEvidence = async (req, res) =>{
    const reportedEvidence = await Evidence.findOne({_id: req.params.reportedId}).exec();
    if(!reportedEvidence){
        req.flash('error', 'Report could not be submitted. Please try again later');
        return res.redirect('back');
    }
    const report = new Report({report: req.body.report});
    report.reportType = 'evidence',
    report.author = req.user._id;
    report.reportedElement = req.params.reportedId;
    report.accused = reportedEvidence.author;
    console.log(report);
    await report.save();
    req.flash('success', 'Your report has been successfully submitted');
    return res.redirect('back');
}

module.exports.reportUser = async (req, res) =>{
    const reportedUser = await User.findOne({username: req.params.reportedId}).exec();
    if(!reportedUser){
        req.flash('error', 'Report could not be submitted. Please try again later');
        return res.redirect('back');
    }
    const report = new Report({report: req.body.report});
    report.reportType = 'user',
    report.author = req.user._id;
    report.accused = reportedUser._id;
    console.log(report);
    await report.save();
    req.flash('success', 'Your report has been successfully submitted');
    return res.redirect('back');
}

const verifyMail = async (userMail) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });
    let mailOptions = {
        from: 'hauntrip.contact@gmail.com',
        to: userMail,
        subject: 'Verify your account',
        text: 'Welcome to Hauntrip! Get ready to explore, post, and review hundreds of mysteries. To do so, please verify your email by clicking the following link: '
    };  
    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
          console.log("Error " + err);
        } else {
          console.log("Email sent successfully");
        }
    });
}