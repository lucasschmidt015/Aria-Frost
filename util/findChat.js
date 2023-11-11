const Chat = require("../models/chat");

/**
 *
 * @param {OBjectId} chatId Pass here the chat id
 * @param {UserObject} user Pass here the user id
 * @returns An object with chat data
 */
exports.findChatByChatIdAndUserId = async (chatId, user) => {
  try {
    const chat = await Chat.findOne({
      $and: [
        { _id: chatId },
        { $or: [{ ownerId: user._id }, { _id: { $in: user.chats } }] },
      ],
    });
    return chat;
  } catch (err) {
    throw err;
  }
};

/**
 *
 * @param {UserObject} user Pass here the user id
 * @returns Many objects with chat data
 */
exports.findAllChatsByUserId = async (user) => {
  try {
    const chats = await Chat.find({
      $or: [{ ownerId: user._id }, { _id: { $in: user.chats } }],
    });
    return chats;
  } catch (err) {
    throw err;
  }
};
