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
router.get('/videos', authentication.requiresAdmin, adminController.getVideoPage);

//GET user page
router.get('/users', authentication.requiresAdmin, adminController.getUserPage);

//GET request to logout
router.get('/logout', adminController.logout);

module.exports = router;
