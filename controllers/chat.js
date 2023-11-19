const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Chat = require("../models/chat");
const User = require("../models/user");
const findChat = require("../util/findChat");
const findUserChat = require("../util/findUserChat");

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

  let chatData;

  findChat
    .findChatByChatIdAndUserId(chatId, req.user)
    .then((chat) => {
      chatData = chat;
      return findUserChat.findChatUsers(chat._id, chatData.ownerId);
    })
    .then((users) => {
      const messages = chatData.messages.map((m) => ({
        userId: m.userId.toString(),
        userName: m.userName,
        userImage: m.userImage,
        message: m.message,
        time: new Date(m.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      }));
      res.render("chat/chat", {
        pageTitle: chatData.name,
        isOwner: chatData.ownerId.toString() === req.user._id.toString(),
        chat: chatData,
        loggedUser: req.user._id,
        users,
        messages: JSON.stringify(messages),
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
        return res.redirect(`/chat/${chatId}`);
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

exports.getLeaveServer = (req, res, next) => {
  const chatId = req.params.chatId;
  const user = req.user;

  findChat
    .findChatByChatIdAndUserId(chatId, user)
    .then((chat) => {
      if (!chat) {
        throw new Error("Chat not found");
      }

      if (chat.ownerId.toString() === user._id.toString()) {
        //In future updates, consider incorporating a notification message at this point to inform the user that they cannot leave a server for which they are the owner.
        return res.redirect(`/chat/${chatId}`);
      }

      const userChats = user.chats;
      const updatedUserChat = userChats.filter(
        (c) => c._id.toString() !== chatId.toString()
      );
      user.chats = updatedUserChat;
      user.save().then((success) => {
        return res.redirect("/");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postMakeAdmin = (req, res, next) => {
  const userId = req.body.userId;
  const chatId = req.body.chatId;

  findChat
    .findChatByChatIdAndUserId(chatId, req.user)
    .then((chat) => {
      chat.ownerId = userId;
      return chat.save();
    })
    .then((updatedChat) => {
      const user = req.user;
      const userChats = user.chats;
      userChats.push(updatedChat._id);
      user.chats = userChats;
      return user.save();
    })
    .then((userUpdated) => {
      return User.findById(userId);
    })
    .then((newOwner) => {
      const chatsNewOwner = newOwner.chats;
      const updatedOwnerChats = chatsNewOwner.filter(
        (e) => e.toString() !== chatId.toString()
      );
      newOwner.chats = updatedOwnerChats;
      return newOwner.save();
    })
    .then((success) => {
      res.redirect(`/chat/${chatId}`);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postRemoveMember = (req, res, next) => {
  const userId = req.body.userId;
  const chatId = req.body.chatId;

  User.findById(userId)
    .then((user) => {
      const userChats = user.chats;
      const updatedChats = userChats.filter((c) => {
        return c.toString() !== chatId.toString();
      });
      user.chats = updatedChats;
      return user.save();
    })
    .then((success) => {
      res.redirect(`/chat/${chatId}`);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.addNewMessage = async (msg) => {
  try {
    const chat = await Chat.findById(msg.chatId);
    const messages = chat.messages;
    const { name: userName, imageName: userImage } = await User.findById(
      msg.userId
    );
    messages.push({
      userId: msg.userId,
      userName,
      userImage,
      message: msg.message,
      date: msg.date,
    });
    chat.messages = messages;
    await chat.save();

    const formatedMessage = {
      userId: msg.userId,
      userName: userName,
      userImage,
      message: msg.message,
      time: new Date(msg.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    return formatedMessage;
  } catch (err) {
    console.log(err);
  }
};
