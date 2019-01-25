const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const md5 = require('md5');

const user = {
    username: 'string',
    password: 'string',
}

const AdminSchema = new Schema(user);

/**
 * Hash and store password
 */
AdminSchema.methods.setPassword = function (password) {
    console.log('Password',this.password,md5(password));
    this.password = md5(password);
}

/**
 * Validate password
 */
AdminSchema.methods.validatePassword = function (password) {
    return this.password == md5(password);
}

//Create user model
module.exports = mongoose.model('Admin', AdminSchema);
