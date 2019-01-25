var express = require('express');
var router = express.Router();

const userAuthMid = require('../middleware/authentication');
const userController = require('../controllers/user');

//GET Login page
router.get('/login', userAuthMid.requiresUnLogin, userController.getLoginPage);

//Post request to login
router.post('/login', userAuthMid.requiresUnLogin, userController.login);

//Get register page
router.get('/register', userAuthMid.requiresUnLogin, userController.getRegisterPage);

//Post request to create new user
router.post('/register', userAuthMid.requiresUnLogin, userController.createNewUser);

//Post request to login with facebook
router.post('/login-facebook', userAuthMid.requiresUnLogin, userController.loginWithFacebook);

//Request to logout
router.get('/logout', userController.logout);

//Get Update Info page
router.get('/update-user-info', userAuthMid.requiresLogin, userController.getUpdateInfoPage);

//POST request to update user info
router.post('/update-user-info', userAuthMid.requiresLogin, userController.updateUserInfo);

//GET add video page
router.get('/add-video',userAuthMid.requiresFullInfoUser, userController.getAddVideoPage);

//POST request to create new video
router.post('/add-video', userAuthMid.requiresFullInfoUser, userController.addVideo);

// GET home page. This require authen user
router.get('/',userAuthMid.requiresFullInfoUser,userController.getHomePage);

// GET home page. This require authen user
router.get('/my-videos',userAuthMid.requiresFullInfoUser,userController.getMyVideoPage);

module.exports = router;
