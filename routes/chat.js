const express = require('express');

const chatController = require('../controllers/chat');

const router = express.Router();

router.get('/newChat', chatController.getNewChat);

router.post('/newChat', chatController.postNewChat);

module.exports = router;