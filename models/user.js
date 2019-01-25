const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const md5 = require('md5');


const user = {
    name: 'string',
    email: 'string',
    password: 'string',
    tp_id: 'string',
    passport_front: 'string',
    passport_real: 'string',
    avatar: 'string',
    updated_info: Boolean,
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
UserSchema.statics.isAvailableEmail = async function(email,callback){
    //Find user by email
    const result = await this.findOne({email});
    return !result;
}

//Create user model
module.exports = mongoose.model('User',UserSchema);
