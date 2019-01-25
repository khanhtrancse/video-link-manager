var express = require('express');
var router = express.Router();

const authentication = require('../middleware/authentication');
const userController = require('../controllers/user');

//GET Login page
router.get('/login', authentication.requiresUnLogin, userController.getLoginPage);

//Post request to login
router.post('/login', authentication.requiresUnLogin, userController.login);

//Get register page
router.get('/register', authentication.requiresUnLogin, userController.getRegisterPage);

//Post request to create new user
router.post('/register', authentication.requiresUnLogin, userController.createNewUser);

//Post request to login with facebook
router.post('/login-facebook', authentication.requiresUnLogin, userController.loginWithFacebook);

//Request to logout
router.get('/logout', userController.logout);

//Get Update Info page. This require authen user
router.get('/update-user-info', authentication.requiresLogin, userController.getUpdateInfoPage);

//POST request to update user info.  This require authen user
router.post('/update-user-info', authentication.requiresLogin, userController.updateUserInfo);

//GET add video page. This require authen user
router.get('/add-video',authentication.requiresFullInfoUser, userController.getAddVideoPage);

//POST request to create new video. This require authen user
router.post('/add-video', authentication.requiresFullInfoUser, userController.addVideo);

// GET home page. This require authen user
router.get('/',authentication.requiresFullInfoUser,userController.getHomePage);

// GET home page. This require authen user
router.get('/my-videos',authentication.requiresFullInfoUser,userController.getMyVideoPage
);

module.exports = router;
