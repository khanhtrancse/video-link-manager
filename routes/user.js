var express = require('express');
var router = express.Router();
var request = require('request');
const userAuthMid = require('../middleware/user-auth');
var fs = require('fs');
var formidable = require('formidable');


const User = require('../models/user');

//Get login page
router.get('/login', function (req, res, next) {
  res.render('pages/login', { error: '', data: {} });
});

//Post login user
router.post('/login', (req, res) => {
  const user = req.body;
  //validate input
  if (!user || !user.email || user.email == '' || !user.password || user.password == '') {
    res.render('pages/login', {
      error: 'Username/password are incorrect.',
      data: { email: user.email }
    });
    return;
  }

  User.findOne({ email: user.email }, (err, result) => {
    let errorMessage;
    if (err) {
      errorMessage = 'Something went wrong.';
    } else if (!result || !result.validatePassword(user.password)) {
      errorMessage = 'Username/password are incorrect.';
    }

    //Has error
    if (errorMessage) {
      res.render('pages/login', { error: errorMessage, data: { email: user.email } });
    } else {
      req.session.userId = result._id;
      res.redirect('/');
    }
  });
});

/**
 * Get register page
 */
router.get('/register', (req, res) => {
  res.render('pages/register', { user: {}, error: {} });
});

/**
 * Create new user
 */
router.post('/register', (req, res) => {
  const newUser = req.body;
  //Todo validate user info

  if (newUser && newUser.email && newUser.password && newUser.name) {
    //Check email available
    User.isAvailableEmail(newUser.email, (err, available) => {
      if (err) {
        res.render('pages/register', { user: newUser, error: { general: 'Cann\'t create account. Please try later.' } });
        return;
      }

      if (available) {
        const user = new User(newUser);
        user.setPassword(newUser.password);
        user.save((err) => {
          if (err) {
            res.render('pages/register', { user: newUser, error: { general: 'Cann\'t create account. Please try later.' } });
            return;
          }
          res.render('pages/register-success');
        });
      } else {
        //Email is unavailable
        res.render('pages/register', { user: newUser, error: { email: 'This email exists.' } });
      }
    });
  } else {
    //Input is invalid
    res.render('pages/register', { user: newUser, error: { general: 'All fields are require.' } });
  }
});

//Post Login with facebook user
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

      User.findOne({ email: data.email }, (err, result) => {
        if (err) {
          console.log('Update facebook user error', err);
          res.render('pages/error', { message: 'Something went wrong.', error: {} });
          return;
        }

        //User exists
        if (!result) {
          const newUser = new User(data);
          newUser.setPassword(data.password);
          newUser.save((saveError) => {
            if (saveError) {
              console.log('Update facebook user error', saveError);
              res.render('pages/error', { message: 'Something went wrong.', error: {} });
              return;
            }
            req.session.userId = newUser._id;
            res.redirect('/');
          });
        } else { //User don't exists
          req.session.userId = result._id;
          res.redirect('/');
        }
      });
    } else {
      res.render('pages/error', { message: 'Invalid user.', error: {} });
    }
  });
});

router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  } else {
    return res.redirect('/');
  }
});

router.get('/update-user-info', (req, res, next) => {
  // const id = req.session.userId;
  const id = '5c49b747fb70b007ffda9001';
  User.findOne({ _id: id }, (err, result) => {
    if (err) {
      res.redirect('/');
      return;
    }
    res.render('pages/update-user-info', { user: result });

  });
});

router.post('/update-user-info', (req, res) => {
  const userId = '5c49b747fb70b007ffda9001';

  var form = new formidable.IncomingForm();
  form.multiples = true;
  //Image folder
  form.uploadDir = "public/upload/";
  //Start upload
  form.parse(req, function (err, fields, files) {
    try {
      const userImages = [];
      if (Array.isArray(files.images)) {
        for (let i = 0; i < files.images.length; i++) {
          const file = files.images[i];
          //path tmp in server
          var path = file.path;
          let fileName = userId + '-' +
            new Date().getTime() + '-' + file.name;
          //set new path to file
          var newpath = form.uploadDir + fileName;
          userImages.push(newpath);
          fs.rename(path, newpath, function (err) {
            if (err) throw err;
          });
        }
      } else {
        const file = files.images;
        //path tmp in server
        var path = file.path;
        let fileName = userId + '-' +
          new Date().getTime() + '-' + file.name;
        //set new path to file
        var newpath = form.uploadDir + fileName;
        userImages.push(newpath);
        fs.rename(path, newpath, function (err) {
          if (err) throw err;
        });
      }

      User.updateOne({ _id: userId }, { images: userImages }, (err) => {
        if (err) {
          console.log('UPdate image error', err);
          res.redirect('error');
          return;
        }

        res.redirect('/');
      });
    } catch (err) {
      console.log(err);
      res.redirect('error');
    }
  });
});
module.exports = router;
