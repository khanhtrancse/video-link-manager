var express = require('express');
var router = express.Router();

const adminController = require('../controllers/admin');
const authentication = require('../middleware/authentication');

//GET home page. This require authen user
router.get('/', authentication.requiresAdmin, adminController.getHomePage);

//GET login page
router.get('/login', authentication.requiresNotAdmin, adminController.getLoginPage);

//POST request to login
router.post('/login', authentication.requiresNotAdmin, adminController.login);

//GET videos page. This require authen user
router.get('/videos', authentication.requiresAdmin, adminController.getVideoPage);

//GET user page. This require authen user
router.get('/users',authentication.requiresAdmin, adminController.getUserPage);

//GET request to logout
router.get('/logout', adminController.logout);

//GET request to change video status.  This require authen user
router.get('/change-video-status',authentication.requiresAdmin ,adminController.changeVideoStatus);

module.exports = router;
