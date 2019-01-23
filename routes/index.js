var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/login');
});

router.get('/register', (req,res)=>{
  res.render('pages/register',{user: {}, error:{}});
});

router.post('/register',(req,res)=>{
  const body = req.body;
  console.log(body);
  res.render('pages/register',{user: body, error:{email: 'Exists'}});
});

module.exports = router;
