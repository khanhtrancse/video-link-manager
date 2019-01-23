var express = require('express');
var router = express.Router();
var md5 = require('md5');

const database = require('../models/database');
const Code = require('../models/response-code');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('/login');
});

router.get('/home', function (req, res, next) {
  res.render('pages/home');
});

module.exports = router;
