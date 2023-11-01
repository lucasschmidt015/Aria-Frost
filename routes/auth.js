const express = require('express');
const { check, body } = require('express-validator');
const isAuth = require('../middlewares/isAuth');

//Controllers
const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', [
    check('email')
        .isEmail()
        .withMessage('Please, enter a valid E-Mail address.')
        .normalizeEmail(),
    check('password')
        .trim()
], authController.postLogin);

router.get('/signup', authController.getSignUp);

router.post('/signup', [
    check('name')
        .isLength({ min: 1 })
        .withMessage('Please type your name'),
    check('email')
        .isEmail()
        .withMessage('Please enter a valid E-mail.')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-Mail already exists, please pick a diffferent one.')
                }
            })
        })
        .normalizeEmail(),
    check('password')
        .isLength({ min: 5 })
        .withMessage('Please enter a password with least 5 characteres.')
        .isAlphanumeric()
        .withMessage('Please type a password with only numbers and text.')
        .trim(),
    check('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!')
            }
            return true;
        })

], authController.postSignUp);

router.get('/accountConfirmationScreen', isAuth, authController.getAccountConfirmationScreen);

router.get('/confirmAccount/:token', authController.getConfirmAccount);

module.exports = router;