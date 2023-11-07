const { validationResult } = require('express-validator')

const Chat = require('../models/chat');

exports.getNewChat = (req, res, next) => {
    res.render('chat/newChat', {
        pageTitle: 'New Chat',
        errorMessage: '',
        oldInput: {
            title: '',
            description: '',
        }
    })
}

exports.postNewChat = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const image = req.file;

    const error = validationResult(req);

    if (!error.isEmpty()) {
        console.log('We have an error');
        return res.render('chat/newChat', {
            pageTitle: 'New Chat',
            errorMessage: error.array()[0].msg,
            oldInput: {
                title,
                description,
            }
        })
    }


    const newChat = new Chat({
        name: title,
        description,
        ownerId: req.user,
        imageName: image ? image.filename : null,
    });
    newChat.save()
    .then(success => {
        res.redirect('/');
    })
    .catch(err => {
        const throwError = new Error(err);
        throwError.httpStatusCode = 500;
        return next(throwError);
    })

}