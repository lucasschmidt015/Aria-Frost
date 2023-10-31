const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator')
const cryptoGenerate = require('../util/cryptoGenerate');
const sendEmail = require('../util/sendEmail');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: '',
        oldInput: {
            email: '',
            password: ''
        },
    })
}

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'SignUp',
        errorMessage: '',
        oldInput: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
    })
}

exports.postSignUp = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    let passowordInHash;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'SignUp',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                name: name,
                email: email === '@' ? '' : email,
                password: password,
                confirmPassword: confirmPassword
            },
        })
    }

    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        passowordInHash = hashedPassword;
        return cryptoGenerate.createRandomToken()
    })
    .then(token => {
        const newUser = new User({
            name: name,
            email: email,
            password: passowordInHash,
            verificated: false,
            verificationToken: token,
            verificationTokenExpiration: Date.now() +  300000
        });
        return newUser.save()
    })
    .then(user => {
        req.session.user = user;
        req.session.isLoggedIn = true;
        sendEmail.sendNewUserEmail(user);
        res.redirect('/accountConfirmationScreen')
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getAccountConfirmationScreen = (req, res, next) => {
    res.render('auth/accountConfirmation', {
        pageTitle: 'Account Confirmation'
    })
}

exports.getConfirmAccount = (req, res, next) => {
    const token = req.params.token;
    console.log(token);
}