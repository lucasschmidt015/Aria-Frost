const express = require("express");
const { check } = require("express-validator");

const isAuth = require("../middlewares/isAuth");
const isAccountValid = require("../middlewares/isAccountValid");

const chatController = require("../controllers/chat");

const router = express.Router();

router.get("/newChat", isAuth, isAccountValid, chatController.getNewChat);

router.post(
  "/newChat",
  isAuth,
  isAccountValid,
  [
    check("title")
      .isLength({ min: 3, max: 20 })
      .withMessage(
        "The title must have a minimum of 3 and a maximum of 20 characters."
      ),
  ],
  chatController.postNewChat
);

router.get("/editChat/:chatId", chatController.getEditChat);

router.post(
  "/editChat",
  [
    check("title")
      .isLength({ min: 3, max: 20 })
      .withMessage(
        "The title must have a minimum of 3 and a maximum of 20 characters."
      ),
  ],
  chatController.postEditChat
);

router.get("/chat/:chatId", isAuth, isAccountValid, chatController.getChat);

router.get(
  "/deleteChat/:chatId",
  isAuth,
  isAccountValid,
  chatController.getDeleteChat
);

router.get(
  "/getNewMember/:chatId",
  isAuth,
  isAccountValid,
  chatController.getNewMember
);

router.get(
  "/getLeaveServer/:chatId",
  isAuth,
  isAccountValid,
  chatController.getLeaveServer
);

router.post("/makeAdmin", isAuth, isAccountValid, chatController.postMakeAdmin);

router.post(
  "/removeMember",
  isAuth,
  isAccountValid,
  chatController.postRemoveMember
);

module.exports = router;
