const express = require("express");

const simplePagesController = require("../controllers/simplePages");

const isAuth = require("../middlewares/isAuth");
const isAccountValid = require("../middlewares/isAccountValid");

const router = express.Router();

router.get("/about", isAuth, isAccountValid, simplePagesController.getAbout);

module.exports = router;
