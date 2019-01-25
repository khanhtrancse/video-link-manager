const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var session = require('express-session')

const database = require('./models/database');
const config = require('./config');

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Use session
//Because this project serves research purpuse, this uses RAM to save session
app.use(session({
  secret: 'abc-xyz-video-link',
  resave: true,
  saveUninitialized: true
}))

//Connect to database
database.connectToDatabase(config.DATABASE_URI,(err)=>{
  if(err){
    console.log('Connect to database error');
  } else{
    console.log('Connect to database success');
  }
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//use router
app.use('/admin',adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('pages/error');
});

module.exports = app;
