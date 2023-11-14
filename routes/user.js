const express = require("express");
const { check } = require("express-validator");

const isAuth = require("../middlewares/isAuth");
const isAccountValid = require("../middlewares/isAccountValid");

const userController = require("../controllers/user");

const router = express.Router();

router.get(
  "/editUserProfile",
  isAuth,
  isAccountValid,
  userController.getEditUserProfile
);

router.post(
  "/editUserProfile",
  isAuth,
  isAccountValid,
  [check("name").isLength({ min: 1 }).withMessage("Please type your name")],
  userController.postEditUserProfile
);

module.exports = router;
