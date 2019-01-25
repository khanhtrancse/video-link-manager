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
controller.login = async (req, res) => {
    const user = req.body;
    console.log('Admin', user);
    if (!user || !user.username || !user.password) {
        res.render('pages/admin/login', { data: user, error: 'Username or password is incorrect.' });
        return;
    }

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
controller.getVideoPage = async (req, res) => {
    Video.find((error, result) => {
        let errorMessage = '';
        let videos = [];
        if (error) {
            errorMessage = 'Database error';
        } else if (result) {
            videos = result;
        }

        res.render('pages/admin/videos', { error: errorMessage, videos });
    });
};

//Display user page
controller.getUserPage = async (req, res) => {
    User.find((error, result) => {
        let errorMessage = '';
        let users = [];
        if (error) {
            errorMessage = 'Database error';
        } else if (result) {
            users = result;
        }

        res.render('pages/admin/users', { error: errorMessage, users });
    });;
};

//Request to logout
controller.logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            res.redirect('/admin');
        })
    } else {
        res.redirect('/admin');
    }
}

module.exports = controller;