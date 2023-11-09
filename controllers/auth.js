const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator')
const cryptoGenerate = require('../util/cryptoGenerate');

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

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            }
        })
    }

    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                errorMessage: 'User not found.',
                oldInput: {
                    email: email,
                    password: password
                }
            })
        }
        bcrypt.compare(password, user.password)
        .then(doMetch => {
            if (!doMetch) {
                return res.render('auth/login', {
                    pageTitle: 'Login',
                    errorMessage: "Password doesn't metch. Please try again.",
                    oldInput: {
                        email: email,
                        password: password
                    }
                })
            }
            req.session.isLoggedIn = true;
            req.session.user = user;

            req.session.save(err => {
                const nextPage = user.verificated ? '/' : '/accountConfirmationScreen';
                return res.redirect(nextPage);
            })
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
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
            verificationTokenExpiration: Date.now() +  300000,
            passwordResetToken: null,
            passwordResetTokenExpiration: null,
        });
        return newUser.save()
    })
    .then(user => {
        req.session.user = user;
        req.session.isLoggedIn = true;
        user.sendNewUserEmail(user);
        res.redirect('/accountConfirmationScreen')
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getAccountConfirmationScreen = (req, res, next) => {
    User.findById(req.user._id)
    .then(user => {
        if (!user || req.user.verificated) {
            return res.redirect('/');
        }
        return user.updateUserConfirmationToken(user)
        .then(success => {
            res.render('auth/accountConfirmation', {
                pageTitle: 'Account Confirmation'
            })
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getConfirmAccount = (req, res, next) => {
    const token = req.params.token;
    User.findOne({verificationToken: token, verificationTokenExpiration: {$gt: Date.now()} })
    .then(user => {
        if (!user) {
            throw new Error('Something went wrong');
        }
        user.verificated = true;
        user.verificationToken = null;
        user.verificationTokenExpiration = null;
        return user.save();
    })
    .then(updatedUser => {
        res.redirect('/');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Password Reset',
        errorMessage: '',
        oldInput: {
            email: ''
        }
    })
}

exports.postReset = (req, res, next) => {

    const email = req.body.email;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('auth/reset', {
            pageTitle: 'Password Reset',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email
            }   
        })
    }

    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            return res.render('auth/reset', {
                pageTitle: 'Password Reset',
                errorMessage: "We didn't find any users with this E-mail.",
                oldInput: {
                    email: email
                }   
            })  
        }
        user.updateResetPasswordToken(user)
        .then(updatedUser => {
            return res.redirect('/resetMessage');
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.getResetMessage = (req, res, next) => {
    res.render('auth/resetMessage', {
        pageTitle: 'Confirm your E-Mail',
    })
}

exports.getPasswordReset = (req, res, next) => {
    const token = req.params.token;

    User.findOne({ passwordResetToken: token, passwordResetTokenExpiration: {$gt: Date.now()} })
    .then(user => {
        if (!user) {
            return res.redirect('/login');
        }

        return res.render('auth/newPassword', {
                pageTitle: 'New Password',
                errorMessage: '',
                oldInput: {
                    password: '',
                    confirmPassword: '',
                },
                token: token,
                userId: user._id,
            })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.postPasswordReset = (req, res, next) => {
    const token = req.body.token;
    const userId = req.body.userId;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    let user;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('auth/newPassword', {
            pageTitle: 'New Password',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                password: password,
                confirmPassword: confirmPassword,
            },
            token: token,
            userId: userId
        })
    }

    User.findById(userId)
    .then(userDoc => {
        user = userDoc;
        return bcrypt.hash(password, 12)
    })
    .then(hashedPassword => {
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetTokenExpiration = null;
        return user.save()
    })
    .then(updatedUser => {
        res.redirect('/login');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}