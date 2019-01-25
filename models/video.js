const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const video = {
    user_id: 'string',
    subject: 'string',
    type: 'string',
    description: 'string',
    link: 'string',
    status: 'string',
    timestamp: Number,
    user_name: 'string'
}

const VideoSchema = new Schema(video);

//Create user model
module.exports = mongoose.model('Video',VideoSchema);
