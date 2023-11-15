const express = require("express");

const simplePagesController = require("../controllers/simplePages");

const router = express.Router();

router.get("/about", simplePagesController.getAbout);

module.exports = router;
