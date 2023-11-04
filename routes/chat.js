const express = require('express');
const multer = require('multer');

const isAuth = require('../middlewares/isAuth');
const isAccountValid = require('../middlewares/isAccountValid');

const updload = multer({ dest: 'upload/' });

const chatController = require('../controllers/chat');

const router = express.Router();

router.get('/newChat',isAuth, isAccountValid, chatController.getNewChat);

router.post('/newChat', isAuth, isAccountValid, chatController.postNewChat);

module.exports = router;