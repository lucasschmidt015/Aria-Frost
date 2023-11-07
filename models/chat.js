const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    description: {
        type: String,
        required: false
    },
    imageName: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Chat', chatSchema);