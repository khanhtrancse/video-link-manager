const mongoose = require('mongoose');
const UserSchema = require('./user-schema');

const Code = require('./response-code');

const dbHost = 'mongodb://khanh:khanh123@ds163984.mlab.com:63984/video-link-manager';

const User = mongoose.model('User', UserSchema);

//Connect to database
let isConnected = false;
mongoose.connect(dbHost, (err) => {
    if (err) {
        console.log('Connect to database error', err);
        isConnected = false;
    } else {
        isConnected = true;
        console.log('Connected to database');
    }
});

/**
 * Check a email is available or not
 * @param {*} email 
 * @param {*} cb (err,available: boolean)=>{}
 */
function checkEmailAvailable(email, cb) {
    if (!isConnected) {
        cb({ code: Code.DATABASE_ERROR });
        return;
    }

    User.findOne({ email: email }, (err, res) => {
        if (err) {
            cb({ code: Code.DATABASE_ERROR });
            return;
        }

        if (res) {
            cb(null, false);
        } else {
            cb(null, true);
        }
    });
}

/**
 * Create new account
 * @param {*} user 
 * @param {*} cb (err)=>{}. callback will be invoked with a param is err
 */
function createUser(user, cb) {
    //Check connect to database
    if (!isConnected) {
        cb({ code: Code.DATABASE_ERROR });
    } else {
        //check email is available or not
        checkEmailAvailable(user.email, (err, available) => {
            if (err) {
                cb(err);
                return;
            }
            if (available) {
                User.create(user, (err) => {
                    if (err) {
                        cb({ code: Code.DATABASE_ERROR });
                        return;
                    }
                    cb();
                });
            } else {
                cb({ code: Code.EMAIL_EXISTS });
            }
        });
    }
}

function createOrUpdateUser(user,cb){
      //Check connect to database
      if (!isConnected) {
        cb({ code: Code.DATABASE_ERROR });
        return;
    } 

    User.updateOne({email: user.email},user,{upsert: true}, (err) => {
        if (err) {
            cb({ code: Code.DATABASE_ERROR });
            return;
        }
        User.findOne({email: user.email},(err, user) => {
            if (err || !user) {
                cb({ code: Code.DATABASE_ERROR });
                return;
            }
            cb(null,user);
        });
    });
}

/**
 * Login with email and password
 * @param {*} email 
 * @param {*} password 
 * @param {*} cb (err,user)=>{}
 */
function login(email,password, cb){
    if (!isConnected) {
        cb({ code: Code.DATABASE_ERROR });
        return;
    }

    User.findOne({ email, password }, (err, res) => {
        if (err) {
            cb({ code: Code.DATABASE_ERROR });
            return;
        }

        if (res) {
            cb(null, res);
        } else {
            cb(null, false);
        }
    });
}

module.exports = {
    createUser,
    login,
    createOrUpdateUser
}