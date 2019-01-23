const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = {
    name: 'string',
    email: 'string',
    password: 'string',
}

const UserSchema = new Schema(user);

module.exports = UserSchema;