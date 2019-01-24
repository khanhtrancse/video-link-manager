const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const md5 = require('md5');


const user = {
    name: 'string',
    email: 'string',
    password: 'string',
    tp_id: 'string',
    images: ['string']
}

const UserSchema = new Schema(user);

/**
 * Hash and store password
 */
UserSchema.methods.setPassword = function (password){
    this.password = md5(password);
}

/**
 * Validate password
 */
UserSchema.methods.validatePassword = function(password){
    return this.password == md5(password);
}

/**
 * Check a email is available or not
 */
UserSchema.statics.isAvailableEmail = function(email,callback){
    this.find({email},(err,result)=>{
        if(err){
            callback(err);
            return;
        }
        callback(null,result.length == 0);
    });
}

//Create user model
module.exports = mongoose.model('User',UserSchema);
