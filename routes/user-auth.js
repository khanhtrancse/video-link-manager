var express = require('express');
var router = express.Router();
var md5 = require('md5');
var request = require('request');

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
  database.login(body.email, body.password, (err, user) => {
    let error;
    if (err) {
      error = 'Something went wrong.';
    } else if (!user) {
      error = 'Username/password are incorrect.';
    }

    if (error) {
      res.render('pages/login', { error, data: { email: body.email } });
    } else {
      //login susccess
      console.log('User',user);
      req.session.userId = user._id;
      res.redirect('/');
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

router.post('/login-facebook', (req, res) => {
  const user = req.body;
  //Validate user from facebook
  const api = 'https://graph.facebook.com/me?fields=id&access_token=' + user.access_token;
  request(api, function (error, response, body) {
    try {
      body = JSON.parse(body);
    } catch (err) {
      res.render('pages/error', { message: 'Something went wrong.', error: {} });
      return;
    }

    if (response && response.statusCode == 200 && body && body.id == user.id) {
      //Update database is neccessary
      const data = { tp_id: user.id, email: user.email, username: user.username };
      database.createOrUpdateUser(data, (err,user) => {
        if (err) {
          console.log('Update facebook user error', err);
          res.render('pages/error', { message: 'Something went wrong.', error: {} });
          return;
        }
        req.session.userId = user._id;
        res.redirect('/');
      });
    } else {
      res.render('pages/error', { message: 'Invalid user.', error: {} });
    }
  });
});

router.get('/logout',(req,res)=>{
  req.session.userId = undefined;
  res.redirect('/');
})

module.exports = router;
