const User = require('../models/user');
const Mystery = require('../models/mystery');
const Evidence = require('../models/evidence');
const Report = require('../models/report');
const Verificator = require('../models/verificator');
const nodemailer = require('nodemailer');
const { cloudinary } = require('../cloudinary');
const axios = require('axios');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    const captchaCheck = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.VERIFY_CAPTCHA_SECRET}&response=${req.body['g-recaptcha-response']}`,
        {},
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
          },
        },
    );
    if(!captchaCheck.data.success){
        req.flash('error', 'ReCaptcha failed. Please, try again');
        res.redirect(`back`);
    }
    console.log("A VER QUE PASA");
    console.log(captchaCheck);
    try{
        const {email, username, password, birthdate} = req.body;
        const user = new User({email, username, birthdate});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
            verifyMail(req.body.email, req.body.username);
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

module.exports.renderRecovery = (req, res) =>{
    res.render('users/recover');
};

module.exports.login = async (req, res) =>{
    req.flash('success', 'Welcome back!');
    const redirectUrl = '/mysteries';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    if(req.query.b){
        if(parseInt(req.query.b) < 999){
            req.flash('error', `Your account is banned for ${req.query.b} days.`);
            return res.redirect('/mysteries');
        } if(parseInt(req.query.b) >= 999){
            req.flash('error', `Your account has been permanently banned. How could that happen?`);
            return res.redirect('/mysteries');
        }
    }
    req.flash('success', 'You are logged out. Good luck!');
    return res.redirect('/mysteries');
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
    const reportedMystery = await Mystery.findOne({_id: req.params.reportedId}).populate('author', 'username').exec();
    if(!reportedMystery){
        req.flash('error', 'Report could not be submitted. Please try again later');
        return res.redirect('back');
    }
    const report = new Report({report: req.body.report});
    report.reportType = 'mystery',
    report.reportedElement = req.params.reportedId;
    report.author = req.user._id;
    report.authorName = req.user.username;
    report.accused = reportedMystery.author._id;
    report.accusedName = reportedMystery.author.username;
    console.log('Report OK');
    await report.save();
    req.flash('success', 'Your report has been successfully submitted');
    return res.redirect('back');
}

module.exports.reportEvidence = async (req, res) =>{
    const reportedEvidence = await Evidence.findOne({_id: req.params.reportedId}).populate('author', 'username').exec();
    const reportedMystery = await Mystery.findOne({_id: req.params.mysteryId}).exec();
    if(!reportedEvidence || !reportedMystery){
        req.flash('error', 'Report could not be submitted. Please try again later');
        return res.redirect('back');
    }
    const report = new Report({report: req.body.report});
    report.reportType = 'evidence',
    report.reportedElement = req.params.reportedId;
    report.author = req.user._id;
    report.authorName = req.user.username;
    report.accused = reportedEvidence.author._id;
    report.accusedName = reportedEvidence.author.username;
    report.evidenceContent = reportedEvidence.body;
    report.mystery = req.params.mysteryId;
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
    report.authorName = req.user.username;
    report.accused = reportedUser._id;
    report.accusedName = reportedUser.username;
    console.log('Report OK');
    await report.save();
    req.flash('success', 'Your report has been successfully submitted');
    return res.redirect('back');
}

module.exports.verifyAccount = async (req, res) =>{
    if(!req.query.q){
        req.flash('error', 'Verification code is not valid');
        return res.redirect('/mysteries');
    }
    if(req.query.q.includes('}') || req.query.q.includes(')')){
        req.flash('error', 'Verification code is not valid');
        return res.redirect('/mysteries');
    }
    const verifyMail = await Verificator.findOne({activationKey: req.query.q}).exec();
    if(!verifyMail){
        req.flash('error', 'Verification code is not valid');
        return res.redirect('/mysteries');
    }
    await User.findOneAndUpdate({username: verifyMail.newUser}, {status: 'active'});
    await Verificator.findByIdAndDelete(verifyMail._id);
    req.flash('success', 'Your account has been succesfully activated. Enjoy Hauntrip!');
    return res.redirect('/mysteries');
}

module.exports.resendVerification = async (req, res) =>{
    const verifyMail = await Verificator.findOne({newUser: req.user.username}).exec();
    if(!verifyMail){
        req.flash('error', 'Something went wrong. Please try again later.');
        return res.redirect('/user/' + req.user.username);
    }
    if(Date.now() < (Date.parse(verifyMail.updatedAt) + (5*60*1000))){
        let remainingTime = Math.round(((Date.parse(verifyMail.updatedAt)+(5*60*1000)) - Date.now())/(60*1000)); 
        req.flash('error', `A verification email was sent less than 6 minutes ago. Please, try again in ${remainingTime + 1} minutes`);
        return res.redirect('/user/' + req.user.username);
    }
    const verifyUser = await User.findOne({username: req.user.username}).exec();
    sendMail(verifyUser.email, verifyUser.username, verifyMail.activationKey);
    await Verificator.findByIdAndUpdate(verifyMail._id, {attempts: (parseInt(verifyMail.attempts) + 1)});
    req.flash('success', `A verification email was sent to ${verifyUser.email}. Please, remember to check your Spam too.`);
    return res.redirect('/user/' + req.user.username);
}

module.exports.recoverPasswordVerify = async (req, res) =>{
    const user = await User.findOne({email: req.body.email}).exec();
    if(!user || (Date(user.birthdate) !== Date(req.body.birthdate))){
        req.flash('error', `Email and/or birthdate are not valid`);
        return res.redirect('/login');
    }
    const { createHmac } = await import('crypto');
    const secret = process.env.VERIFY_MAIL_SECRET;
    const hash = createHmac('sha256', secret)
                .update(user.username + req.body.email + String(Math.random()))
                .digest('hex');
    const verificator = await Verificator.findOne({activationKey: hash});
    if(!verificator){
        const newVerificator = new Verificator({newUser: user.username, activationKey: hash });
        newVerificator.save();
    } else{
        await Verificator.findByIdAndUpdate(verificator._id, {activationKey: hash});
    }
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
        to: req.body.email,
        subject: 'Password Recovery',
        text: `Hello, ${user.username}! Someone is trying to recover your password. If it is not you, please ignore this email. Otherwise, if you want to reset your password please click the following link: http://localhost:3000/recovery/${hash}?u=${user.username}`
    };  
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
            req.flash('error', `Something went wrong. Please, try again later.`);
            return res.redirect('/login');
        } else {
            console.log("Email sent successfully");
            req.flash('success', `Your password reset request was succesful. Please, check your email for the next step.`);
            return res.redirect('/login');
        }
    });
}

module.exports.recoverPassword = async (req, res) =>{
    if(!req.query.u){
        req.flash('error', `Bad request.`);
        return res.redirect('/login');
    }
    const verificator = await Verificator.findOne({activationKey: req.params.hashId, newUser: req.query.u});
    if(!verificator){
        req.flash('error', `Verification code is not valid.`);
        return res.redirect('/login');
    }
    let tempPassword = String(Math.round(Math.random()*10000000));
    const user = await User.findOne({username: verificator.newUser}).exec();
    if(!user){
        req.flash('error', `Something went wrong, please try again later.`);
        return res.redirect('/login');
    }
    user.setPassword(tempPassword, function(){
        user.save();
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
            to: user.email,
            subject: 'New password',
            text: `Hello, ${user.username}! Your new temporary password is: ${tempPassword} Please, enter your account and set a new password. http://localhost:3000/login`
        };  
        transporter.sendMail(mailOptions, async function (err, data) {
            if (err) {
                console.log("Error " + err);
                req.flash('error', `Something went wrong. Please, try again later.`);
                return res.redirect('/login');
            } else {
                console.log("Email sent successfully");
                Verificator.findByIdAndDelete(verificator._id);
                req.flash('success', `Your password has been restablished. Please, check your email to retrieve your new temporary password.`);
                return res.redirect('/login');
            }
        });
    })
}

module.exports.renderChange = async (req, res) =>{
    const user = await User.findOne({username: req.params.username});
    if(String(req.user._id) !== String(user._id)){
        req.flash('error', `You do not have permission to do that`);
        return res.redirect(`/mysteries`);
    }
    return res.render('users/changeForm');
}

module.exports.changePassword = async (req, res) =>{
    if(String(req.user.username) !== String(req.params.username)){
        req.flash('error', `You do not have permission to do that`);
        return res.redirect(`/mysteries`);
    }
    await User.findOne({username: req.user.username})
            .then(foundUser => {
                foundUser.changePassword(req.body.oldpassword, req.body.newpassword)
                    .then(() => {
                        req.flash('success', `Your password has been successfully changed.`);
                        return res.redirect(`/user/${req.user.username}`);
                    })
                    .catch((err) =>{
                        req.flash('error', `Incorrect password`);
                        return res.redirect(`/user/${req.user.username}`);
                    })
                })
                .catch((err)=>{
                    req.flash('error', `Something went wrong. Please, try again later.`);
                    return res.redirect(`/user/${req.user.username}`);
                });
}

module.exports.normalDeleteUser = async (req, res) =>{
    await User.findOne({username: req.user.username})
    .then(foundUser => {
        foundUser.changePassword(req.body.password, req.body.password)
            .then(async () => {
                await deleteUser(req.user._id, 'normalDelete');
                req.flash('success', 'Your account has been deleted. We hope to see you again someday!');
                return res.redirect('/mysteries');
            })
            .catch((err) =>{
                req.flash('error', `Incorrect password.`);
                return res.redirect(`/user/${req.user.username}`);
            })
        })
        .catch((err)=>{
            req.flash('error', `Something went wrong. Please, try again later.`);
            return res.redirect(`/user/${req.user.username}`);
        });
}

const deleteUser = async (userID, type) =>{
    //All evidences, mysteries and images uploaded by the user must be deleted
    let imagesToDelete = []; //All images IDs are saved so they are all bulk deleted at once later
    let evidencesToDelete = []; //Same as images array, but with evidences
    const userEvidences = await Evidence.find({author: userID}).exec();
    const userMysteries = await Mystery.find({author: userID}).populate({
        path: 'evidences',
        populate:{
            path: 'images'
        }
    }).exec();
    if(userMysteries.length > 0){
        //All Evidences within the User mysteries and its images must be deleted too
        for(let mystery of userMysteries){
            if(mystery.image.url){
                imagesToDelete.push(mystery.image.filename);
            }
            if(mystery.evidences.length > 0){
                for(let evidence of mystery.evidences){
                    evidencesToDelete.push(evidence._id);
                    if(evidence.images.length > 0){
                        for(let image of evidence.images){
                            imagesToDelete.push(image.filename);
                        }
                    }
                }
            }
        }
        await Evidence.deleteMany({_id: {$in: evidencesToDelete}});
        await Mystery.deleteMany({author: userID});
    }
    //After all is clean, evidences posted by the user in any mystery must be deleted along with its images
    if(userEvidences.length > 0){
        for(let evidence of userEvidences){
            for(let image of evidence.images){
                imagesToDelete.push(image.filename);
            }
        }
        await Evidence.deleteMany({author: userID});
    }
    //Finally, all images are removed from Cloudinary, and the user credentials are deleted at last
    if(imagesToDelete.length > 0){
        await cloudinary.api.delete_resources(imagesToDelete, function(error, result){console.log('ok');});
    }
    if(type === "permaban"){
        await User.findByIdAndUpdate(userID, {banned: 999999, status: 'banned'});
    } else{
        await User.findByIdAndDelete(userID).exec();
    }
}

const verifyMail = async (userMail, username) => {
    const { createHmac } = await import('crypto');
    const secret = process.env.VERIFY_MAIL_SECRET;
    const hash = createHmac('sha256', secret)
                .update(username)
                .digest('hex');
    const verificator = new Verificator({newUser: username, activationKey: hash});
    await verificator.save();
    sendMail(userMail, username, hash);
}

const sendMail = async(userMail, username, hash) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
          accessToken: process.env.OAUTH_ACCESS_TOKEN,
        }
    });
    let mailOptions = {
        from: 'hauntrip.contact@gmail.com',
        to: userMail,
        subject: 'Verify your account',
        text: `Welcome to Hauntrip, ${username}! Get ready to explore, post, and review hundreds of mysteries. To do so, please verify your email by clicking the following link: http://localhost:3000/verify?q=${hash} Have fun!`
    };  
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
        } else {
            console.log("Email sent successfully");
        }
    });
}

