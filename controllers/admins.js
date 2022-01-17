const User = require('../models/user');
const Mystery = require('../models/mystery');
const Evidence = require('../models/evidence');
const Report = require('../models/report');
const { cloudinary } = require('../cloudinary');

module.exports.renderAdminPanel = async (req, res) => {
    if(req.params.action === 'all'){
        let pageNum = 1
        if(req.query.page){
            pageNum = parseInt(req.query.page);
        }
        if(!pageNum){
            return res.redirect('/mysteries');
        }
        const reports = await Report.paginate({},{page: pageNum, limit:10, sort: {createdAt: 'desc',  "_id" : 'asc'}});
        if(reports.docs.length < 1){
            return res.redirect('/mysteries');
        }
        return res.render('admin/adminPanel', { reports: reports.docs, totalPages: reports.totalPages, currentPage: reports.page, searchTitle: 'All reports' });
    }
    if(req.params.action === 'mystery'){
        let pageNum = 1
        if(req.query.page){
            pageNum = parseInt(req.query.page);
        }
        if(!pageNum){
            return res.redirect('/mysteries');
        }
        const reports = await Report.paginate({reportType: 'mystery'},{page: pageNum, limit:10, sort: {createdAt: 'desc',  "_id" : 'asc'}});
        if(reports.docs.length < 1){
            return res.redirect('/mysteries');
        }
        return res.render('admin/adminPanel', { reports: reports.docs, totalPages: reports.totalPages, currentPage: reports.page, searchTitle: 'Mystery reports' });
    }
    if(req.params.action === 'evidence'){
        let pageNum = 1
        if(req.query.page){
            pageNum = parseInt(req.query.page);
        }
        if(!pageNum){
            return res.redirect('/mysteries');
        }
        const reports = await Report.paginate({reportType: 'evidence'},{page: pageNum, limit:10, sort: {createdAt: 'desc',  "_id" : 'asc'}});
        if(reports.docs.length < 1){
            return res.redirect('/mysteries');
        }
        return res.render('admin/adminPanel', { reports: reports.docs, totalPages: reports.totalPages, currentPage: reports.page, searchTitle: 'Evidence reports' });
    }
    if(req.params.action === 'user'){
        let pageNum = 1
        if(req.query.page){
            pageNum = parseInt(req.query.page);
        }
        if(!pageNum){
            res.redirect('/mysteries');
        }
        const reports = await Report.paginate({reportType: 'user'},{page: pageNum, limit:10, sort: {createdAt: 'desc',  "_id" : 'asc'}});
        if(reports.docs.length < 1){
            res.redirect('/mysteries');
        }
        return res.render('admin/adminPanel', { reports: reports.docs, totalPages: reports.totalPages, currentPage: reports.page, searchTitle: 'User reports' });
    }
    return res.redirect('admin/adminPanel/all');
};

module.exports.renderBanPanel = (req, res) => {
    res.render('admin/banPanel');
};

module.exports.renderChange = async (req, res) =>{
    const user = await User.findOne({username: req.params.username});
    if(String(req.user._id) !== String(user._id)){
        req.flash('error', `You do not have permission to do that`);
        return res.redirect(`/mysteries`);
    }
    return res.render('users/changeForm');
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

module.exports.deleteEvidence = async(req, res) =>{
    const evidence = await Evidence.findByIdAndDelete(req.params.evidenceId);
    if(!evidence){
        req.flash('error', 'Evidence is already deleted. Dismiss the report');
        return res.redirect('/adminpanel/all');
    }
    req.flash('success', 'Evidence deleted');
    return res.redirect('/adminpanel/all');
}

module.exports.dismissReport = async (req, res) =>{
    const report = await Report.findByIdAndDelete(req.params.reportId);
    req.flash('success', 'Report dismissed');
    return res.redirect('/adminpanel/all');
}

module.exports.banUser = async (req, res) => {
    const bannedUser = await User.findOneAndUpdate({username: req.body.username}, {banned: req.body.days});
    if(!bannedUser){
        req.flash('error', 'User not found');
        return res.redirect('/adminpanel/banpanel');
    }
    if(req.body.deleteEverything === 'yes'){
        deleteUser(bannedUser._id);
    }
    req.flash('success', 'User banned');
    return res.redirect('/adminpanel/banpanel');
}

const deleteUser = async (userID) =>{
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
}
