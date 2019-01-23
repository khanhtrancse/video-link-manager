var express = require('express');
var router = express.Router();
var md5 = require('md5');

const database = require('../models/database');
const Code = require('../models/response-code');

router.get('/login', function (req, res, next) {
  res.render('pages/login', { error: '', data: {} });
});

router.post('/login', (req, res) => {
  const body = req.body;
  //validate input
  if (!body.email || body.email == '' || !body.password || body.password == '') {
    res.render('pages/login', {
      error: 'Username/password are incorrect.',
      data: { email: body.email }
    });
    return;
  }
  //encrypt password
  body.password = md5(body.password);

  //start login
  database.login(body.email, body.password, (err, success) => {
    let error;
    if (err) {
      error = 'Something went wrong.';
    } else if (!success) {
      error = 'Username/password are incorrect.';
    }

    if (error) {
      res.render('pages/login', { error, data: { email: body.email } });
    } else {
      res.redirect('/home');
    }
  });
});

router.get('/register', (req, res) => {
  res.render('pages/register', { user: {}, error: {} });
});

router.post('/register', (req, res) => {
  const body = req.body;
  //Todo validate user info

  //Encrypt password
  body.password = md5(body.password);

  database.createUser(body, (err) => {
    if (err) {
      const errorMessage = {};
      if (err.code == Code.DATABASE_ERROR) {
        errorMessage.general = 'Cann\'t create account. Please try later';
      } else if (err.code == Code.EMAIL_EXISTS) {
        errorMessage.email = "This email exists";
      }
      res.render('pages/register', { user: body, error: errorMessage });
    } else {
      res.render('pages/register-success');
    }
  });
});

module.exports = router;
