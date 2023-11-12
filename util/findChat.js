const Chat = require("../models/chat");

/**
 *
 * @param {OBjectId} chatId Pass here the chat id
 * @param {UserObject} user Pass here the user id
 * @param {boolean} includeGuestChat If you just want to retrive user data, pass it as true
 * @returns An object with chat data
 */
exports.findChatByChatIdAndUserId = async (
  chatId,
  user,
  includeGuestChat = true
) => {
  try {
    const orFilter = [{ ownerId: user._id }];
    if (includeGuestChat) {
      orFilter.push({ _id: { $in: user.chats } });
    }
    const chat = await Chat.findOne({
      $and: [{ _id: chatId }, { $or: orFilter }],
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
