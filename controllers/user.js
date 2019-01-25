const request = require('request-promise');
const fs = require('fs');
const formidable = require('formidable');

const Video = require('../models/video');
const User = require('../models/user');
const Utils = require('../others/utils');
const Config = require('../config');

const controller = {};

/**
 * Render login page with error and data
 * @param {*} res response
 * @param {string} error message
 * @param {*} user
 */
function renderLoginPage(res, error, user) {
    res.render('pages/login', { error, data: user });
}

//Display login page without error and user data
controller.getLoginPage = async (req, res) => {
    renderLoginPage(res, '', {});
}

//Login
controller.login = async (req, res, next) => {
    const user = req.body;

    //validate input
    if (!user || !user.email || user.email == '' || !user.password || user.password == '') {
        renderLoginPage(res, 'Username/password are incorrect.', { email: user.email });
        return;
    }

    try {
        const result = await User.findOne({ email: user.email });

        //Incorrect user
        if (!result || !result.validatePassword(user.password)) {
            renderLoginPage(res, 'Username/password are incorrect.', { email: user.email });
            return;
        }

        req.session.userId = result._id;
        req.session.userName = result.name;
        req.session.hasInfo = result.updated_info;
        res.redirect('/');
    } catch (error) {
        next(error);
    }
}

/**
 * Render register page with user data and error
 * @param {*} res 
 * @param {*} error {email: 'msg'}
 * @param {*} user {email: '', name: ''}
 */
function renderRegisterPage(res, error = {}, user = {}) {
    res.render('pages/register', { user, error });
}

//Display register page
controller.getRegisterPage = (req, res) => {
    renderRegisterPage(res);
}

//Create new user
controller.createNewUser = async (req, res, next) => {
    const newUser = req.body;

    //Validate user info
    if (!newUser || !newUser.email || !newUser.password || !newUser.name) {
        renderRegisterPage(res, { general: 'All fields are required' }, newUser);
        return;
    }

    try {
        //Check email exists or not
        const available = await User.isAvailableEmail(newUser.email);
        if (!available) {
            renderRegisterPage(res, { email: 'Email exists.' }, newUser);
            return;
        }

        newUser.avatar = Config.DEFAULT_AVATAR;
        newUser.passport_front = Config.DEFAULT_PASSPORT;
        newUser.passport_real = Config.DEFAULT_PASSPORT;
        newUser.join_timestamp = new Date().getTime();

        const user = new User(newUser);
        user.setPassword(newUser.password);
        await user.save();
        res.render('pages/register-success');
    } catch (error) {
        next(error);
    }
}

//Login with facebook
controller.loginWithFacebook = async (req, res, next) => {
    const user = req.body;
    //Validate user from facebook
    const api = 'https://graph.facebook.com/me?fields=id&access_token=' + user.access_token;
    try {
        const result = await request(api);
        const { id } = JSON.parse(result);

        if (id != user.id) {
            next({ message: 'Can\' login with facebook.' });
            return;
        }

        const data = { tp_id: user.id, email: user.email, name: user.username };
        const existUser = await User.findOne({ email: data.email });

        if (existUser) {
            req.session.userId = existUser._id;
            req.session.userName = existUser.name;
            req.session.hasInfo = existUser.updated_info;
            res.redirect('/');
        } else {
            //First login
            data.avatar = Config.DEFAULT_AVATAR;
            data.passport_front = Config.DEFAULT_PASSPORT;
            data.passport_real = Config.DEFAULT_PASSPORT;
            newUser.join_timestamp = new Date().getTime();
            const newUser = new User(data);
            await newUser.save();
            req.session.userId = newUser._id;
            res.redirect('/');
        }

    } catch (error) {
        next(error);
    }
}

//Logout
controller.logout = (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return res.redirect('error');
            } else {
                return res.redirect('/');
            }
        });
    } else {
        return res.redirect('/');
    }
}

//Display update info page
controller.getUpdateInfoPage = async (req, res, next) => {
    const id = req.session.userId;
    // const id = '5c4ad9c77929a1108af00cd1';
    //Navigation hidden when user have not update images
    const showNav = req.session.hasInfo;

    try {
        const result = await User.findOne({ _id: id });
        res.render('pages/update-user-info', { user: result, showNav });
    } catch (error) {
        next(error);
    }
}

//Update avatar and passport
controller.updateUserInfo = async (req, res, next) => {
    // const userId = '5c49b747fb70b007ffda9001';
    const userId = req.session.userId;

    const updateFields = {};
    var form = new formidable.IncomingForm();
    //Image folder
    form.uploadDir = "public/upload/";
    form.parse(req, function (err, fields, files) {
        if (err) {
            next(err);
            return;
        }
        try {
            const imageNames = ['avatar', 'passport_real', 'passport_front'];
            imageNames.forEach(item => {
                //path tmp in server
                const file = files[item];
                var path = file.path;
                let fileName = userId + '-' + item;
                //set new path to file
                var newpath = form.uploadDir + fileName;
                updateFields[item] = '/upload/' + fileName;
                fs.rename(path, newpath, function (err) {
                    if (err) throw err;
                });
            })

            updateFields.updated_info = true;
            User.updateOne({ _id: userId }, updateFields, (err) => {
                if (err) {
                    next(err);
                    return;
                }

                req.session.hasInfo = true;
                res.redirect('/');
            });
        } catch (err) {
            console.log(err);
            res.redirect('error');
        }
    });
};

/**
 * Render add video page with exist data and error
 * @param {*} res 
 * @param {*} error 
 * @param {*} data 
 */
function renderAddVideoPage(res, error, data) {
    res.render('pages/add-video', { error, data });
}

//Display add video page
controller.getAddVideoPage = (req, res) => {
    renderAddVideoPage(res);
}

//Add new video
controller.addVideo = async (req, res) => {
    const data = req.body;
    const userId = req.session.userId;
    if (!data ||
        !data.link || data.link == '' ||
        !data.subject || data.subject == '') {
        res.render('pages/add-video', { error: 'Inputs are invalid' });
        return;
    }
    data.user_id = userId;
    data.user_name = req.session.userName;
    data.status = 'submitted';
    data.timestamp = new Date().getTime();

    Video.create(data, (err) => {
        if (err) {
            next(err);
            return;
        }
        res.redirect('/my-videos');
    });
}

//Display home page
controller.getHomePage = async function (req, res, next) {
    const userId = req.session.userId;
    try {
        const result = await Video.find({ status: 'approved' },null,{sort: {timestamp: -1}});
        const videos = result?result.map(item => {
            item.thumbnail = Utils.getThumbnailImageOfVideo(item.link);
            item.time = Utils.getTimeStringOf(item.timestamp);
            return item;
        }):[];
        res.render('pages/home', { videos, showAddVideoButton: false });
    } catch (error) {
        next(error);
    }
}

//Display my video page
controller.getMyVideoPage = async function (req, res, next) {
    const userId = req.session.userId;
    try {
        const result = await Video.find({ user_id: userId },null,{sort: {timestamp: -1}});
        const videos = result?result.map(item => {
            item.thumbnail = Utils.getThumbnailImageOfVideo(item.link);
            item.time = Utils.getTimeStringOf(item.timestamp);
            return item;
        }):[];
        res.render('pages/home', { videos , showAddVideoButton: true });
    } catch (error) {
        next(error);
    }
}


module.exports = controller;