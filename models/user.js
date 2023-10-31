const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    verificated: {
        type: Boolean,
        required: false,
    },
    verificationToken: {
        type: String,
        required: false
    },
    verificationTokenExpiration: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('User', userSchema);