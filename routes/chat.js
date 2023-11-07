const express = require('express');
const { check } = require('express-validator');

const isAuth = require('../middlewares/isAuth');
const isAccountValid = require('../middlewares/isAccountValid');

const chatController = require('../controllers/chat');

const router = express.Router();

router.get('/newChat',isAuth, isAccountValid, chatController.getNewChat);

router.post('/newChat', isAuth, isAccountValid, [
    check('title')
        .isLength({ min: 3})
        .withMessage('You must enter a title with at least 3 characters.')
], chatController.postNewChat);

module.exports = router;