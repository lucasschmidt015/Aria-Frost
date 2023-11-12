const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Chat = require("../models/chat");
const findChat = require("../util/findChat");

exports.getNewChat = (req, res, next) => {
  res.render("chat/newChat", {
    pageTitle: "New Chat",
    errorMessage: "",
    oldInput: {
      id: "",
      title: "",
      description: "",
    },
    isEditing: false,
  });
};

exports.postNewChat = (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const image = req.file;

  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.render("chat/newChat", {
      pageTitle: "New Chat",
      errorMessage: error.array()[0].msg,
      oldInput: {
        id: "",
        title,
        description,
      },
      isEditing: false,
    });
  }

  const newChat = new Chat({
    name: title,
    description,
    ownerId: req.user,
    imageName: image ? image.filename : null,
  });
  newChat
    .save()
    .then((success) => {
      res.redirect("/");
    })
    .catch((err) => {
      const throwError = new Error(err);
      throwError.httpStatusCode = 500;
      return next(throwError);
    });
};

exports.getEditChat = (req, res, next) => {
  const chatId = req.params.chatId;

  findChat
    .findChatByChatIdAndUserId(chatId, req.user)
    .then((chat) => {
      res.render("chat/newChat", {
        pageTitle: "New Chat",
        errorMessage: "",
        oldInput: {
          id: chat._id,
          title: chat.name,
          description: chat.description,
        },
        isEditing: true,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postEditChat = (req, res, next) => {
  const chatId = req.body.chatId;
  const newTitle = req.body.title;
  const newDescription = req.body.description;
  const newImage = req.file;

  let imageToRemove = undefined;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("chat/newChat", {
      pageTitle: "New Chat",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        id: chatId,
        title: newTitle,
        description: newDescription,
      },
      isEditing: true,
    });
  }
  findChat
    .findChatByChatIdAndUserId(chatId, req.user, false)
    .then((chat) => {
      if (chat.ownerId.toString() !== req.user._id.toString()) {
        throw new Error("User doesn't metch");
      }

      chat.name = newTitle;
      chat.description = newDescription;
      if (newImage) {
        imageToRemove = chat.imageName;
        chat.imageName = newImage.filename;
      }
      return chat.save();
    })
    .then((success) => {
      if (imageToRemove) {
        const dedBin = path.resolve(__dirname, "..");
        fs.unlink(
          path.join(dedBin, "public", "chat_img", imageToRemove),
          (err) => {
            res.redirect(`/chat/${success._id}`);
          }
        );
      } else {
        res.redirect(`/chat/${success._id}`);
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getChat = (req, res, next) => {
  const chatId = req.params.chatId;

  findChat
    .findChatByChatIdAndUserId(chatId, req.user)
    .then((chat) => {
      res.render("chat/chat", {
        pageTitle: chat.name,
        isOwner: chat.ownerId.toString() === req.user._id.toString(),
        chat,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getNewMember = (req, res, next) => {
  const chatId = req.params.chatId;

  Chat.findById(chatId)
    .then((chat) => {
      if (!chat) {
        return res.redirect("/");
      }

      if (chat.ownerId.toString() === req.user._id.toString()) {
        return res.redirect(`/chat/${chat._id}`);
      }

      const user = req.user;
      const userchats = user.chats;
      const updatedchats = [...userchats, chat._id];
      user.chats = updatedchats;
      user.save().then((updatedUser) => {
        return res.redirect(`/`);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getDeleteChat = (req, res, next) => {
  const chatId = req.params.chatId;

  findChat
    .findChatByChatIdAndUserId(chatId, req.user, false)
    .then((chat) => {
      return chat.deleteOne({ _id: chat.id });
    })
    .then((success) => {
      const dedBin = path.resolve(__dirname, "..");
      fs.unlink(
        path.join(dedBin, "public", "chat_img", success.imageName),
        (err) => {
          return res.redirect("/");
        }
      );
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
