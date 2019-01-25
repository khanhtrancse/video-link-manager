var express = require('express');
var router = express.Router();

const Admin = require('../models/admin');
const Video = require('../models/video');
const User = require('../models/user');

const userAuth = require('../middleware/user-auth');
const Utils = require('../others/utils');

router.get('/', (req, res) => {
    res.render('pages/admin/home');
});

router.get('/login', (req, res) => {
    res.render('pages/admin/login', { data: {}, error: '' });
});

router.post('/login', (req, res) => {
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
});

router.get('/videos', (req, res) => {
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
});

router.get('/users', (req, res) => {
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
});

module.exports = router;
