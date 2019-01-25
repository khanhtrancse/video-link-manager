var express = require('express');
var router = express.Router();

const adminController = require('../controllers/admin');
const authentication = require('../middleware/authentication');

//GET home page
router.get('/', authentication.requiresAdmin, adminController.getHomePage);

//GET login page
router.get('/login', authentication.requiresNotAdmin, adminController.getLoginPage);

//POST request to login
router.post('/login', authentication.requiresNotAdmin, adminController.login);

//GET videos page
router.get('/videos', adminController.getVideoPage);

//GET user page
router.get('/users', adminController.getUserPage);

//GET request to logout
router.get('/logout', adminController.logout);

router.get('/change-video-status',adminController.changeVideoStatus);

module.exports = router;