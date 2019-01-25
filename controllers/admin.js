const Admin = require('../models/admin');
const Video = require('../models/video');
const User = require('../models/user');

const Utils = require('../others/utils');

const controller = {};

//Display home page
controller.getHomePage = (req, res) => {
    res.render('pages/admin/home');
};

//Display login page
controller.getLoginPage = (req, res) => {
    res.render('pages/admin/login', { data: {}, error: '' });
};

//Request login
controller.login = async (req, res, next) => {
    const user = req.body;
    console.log('Admin', user);
    if (!user || !user.username || !user.password) {
        res.render('pages/admin/login', { data: user, error: 'Username or password is incorrect.' });
        return;
    }

    // const admin = new Admin(user);
    // admin.setPassword(user.password);
    // await Admin.create(admin);

    Admin.findOne({ username: user.username }, (error, result) => {
        if (error) {
            res.render('pages/admin/login', { data: user, error: 'Something wrent wrong.' });
            return;
        } else if (!result || !result.validatePassword(user.password)) {
            res.render('pages/admin/login', { data: user, error: 'Username or password is incorrect.' });
            return;
        }

        req.session.adminId = result._id;
        req.session.admin = true;
        res.redirect('/admin');
    });
};

//Display video page
controller.getVideoPage = async (req, res, next) => {
    try {
        const result = await Video.find(null, null, { sort: { timestamp: -1 } });
        let videos = result ? result : [];
        videos = videos.map(item => {
            item.thumbnail = Utils.getThumbnailImageOfVideo(item.link);
            item.time = Utils.getTimeStringOf(item.timestamp);
            return item;
        });
        res.render('pages/admin/videos', { videos });
    } catch (error) {
        next(error);
    }
};

//Display user page
controller.getUserPage = async (req, res,next ) => {
    try{
        const result = await User.find(null,null,{sort: {name: 1}});
        let users = result?result:[];
        users = users.map(item=>{
            item.join_time = Utils.getTimeStringOf(item.join_timestamp);
            return item;
        })
        res.render('pages/admin/users', {users });
    } catch(error){
        next(error);
    }
};

//Request to logout
controller.logout = (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
            res.redirect('/admin');
        })
    } else {
        res.redirect('/admin');
    }
}

//Change video status
controller.changeVideoStatus = async (req, res, next) => {
    const id = req.query.id;
    const status = req.query.status;
    const nextUrl = req.query.nextUrl;
    try {
        if (!id || !status) {
            res.redirect(req.originalUrl)
            return;
        }

        await Video.updateOne({ _id: id }, { status });
        res.redirect(nextUrl);
    } catch (error) {
        next(error);
    }
}

module.exports = controller;