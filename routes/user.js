var express = require('express');
var router = express.Router();
var request = require('request');
const userAuthMid = require('../middleware/user-auth');
var fs = require('fs');
var formidable = require('formidable');

const Video = require('../models/video');
const User = require('../models/user');

const Utils = require('../others/utils');

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

router.post('/update-user-info', userAuthMid.requiresLogin, (req, res) => {
  // const userId = '5c49b747fb70b007ffda9001';
  const userId = req.session.userId;

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
            new Date().getTime() + '-' + i;
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
          new Date().getTime() + '-' + 0;
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

        req.session.hasInfo = true;
        res.redirect('/');
      });
    } catch (err) {
      console.log(err);
      res.redirect('error');
    }
  });
});

router.get('/add-video',userAuthMid.requiresFullInfoUser, (req, res) => {
  res.render('pages/add-video', { error: '' });
});

router.post('/add-video', (req, res) => {
  const data = req.body;
  const userId = req.session.userId;
  if (!data ||
    !data.link || data.link == '' ||
    !data.subject || data.subject == '') {
    res.render('pages/add-video', { error: 'Inputs are invalid' });
    return;
  }
  data.user_id = userId;
  data.status = 'submitted';
  data.timestamp = new Date().getTime();

  Video.create(data, (err) => {
    if (err) {
      console.log('Create video error', err);
      res.render('pages/add-video', { error: 'Something went wrong' });
      return;
    }
    res.redirect('/');
  });
})

/* GET home page. This require authen user*/
router.get('/',userAuthMid.requiresFullInfoUser, function (req, res, next) {
  const userId = req.session.userId;
  Video.find({ user_id: userId }, (err, result) => {
    if (err) {
      res.render('pages/home', { videos: [] });
      return;
    }
    result = result.map(item => {
      item.thumbnail = Utils.getThumbnailImageOfVideo(item.link);
      item.time = Utils.getTimeStringOf(item.timestamp);
      return item;
    });
    res.render('pages/home', { videos: result });
  });
});

module.exports = router;
