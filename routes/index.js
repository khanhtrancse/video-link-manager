var express = require('express');
var router = express.Router();
const userAuth = require('../middleware/user-auth');

/* GET home page. This require authen user*/
router.get('/', function (req, res, next) {
  res.render('pages/home');
});

module.exports = router;
