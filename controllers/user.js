const Video = require('../models/video');
const User = require('../models/user');
var request = require('request-promise');

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
        req.session.hasInfo = result.images && result.images.length > 0
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
            req.session.hasInfo = existUser.images && existUser.images.length > 0
            res.redirect('/');
        } else {
            //First login
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

    //Navigation hidden when user have not update images
    const showNav = req.session.hasInfo;

    try{
        const result = User.findOne({_id: id});
        res.render('pages/update-user-info', { user: result, showNav });
    } catch(error){
        next(error);
    }
  }
module.exports = controller;