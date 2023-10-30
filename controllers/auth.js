const User = require('../models/user');

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator')

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
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            verificated: false,
        });
        return newUser.save()
    })
    .then(success => {
        res.redirect('/login')
    })
    .catch(err => {
        console.log(err);
    })
}