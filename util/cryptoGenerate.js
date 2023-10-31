const crypto = require('crypto');

exports.createRandomToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (error, buffer) => {
            if (error) {
                reject('Something went wrong');
            } else {
                const token = buffer.toString('hex');
                resolve(token);
            }
        })
    })
}