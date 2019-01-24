const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = {
    username: 'string',
    email: 'string',
    password: 'string',
    tp_id: 'string',
}

const UserSchema = new Schema(user);

module.exports = UserSchema;