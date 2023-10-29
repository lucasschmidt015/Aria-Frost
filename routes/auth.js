const express = require('express');

//Controllers
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignUp);

module.exports = router;