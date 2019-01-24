const mongoose = require('mongoose');

//create video model
require('../models/video');
//create user model
require('./user');

/**
 * Connect to database
 * @param {string} uri 
 * @param {function} callback 
 */
function connectToDatabase(uri,callback){
    mongoose.connect(uri,callback);
}

module.exports = {
    connectToDatabase,
}