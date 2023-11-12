const User = require("../models/user");

exports.findChatUsers = async (chatId, ownerId) => {
  try {
    const users = await User.find({
      $or: [{ _id: ownerId }, { chats: { $in: [chatId] } }],
    });

    return users;
  } catch (err) {
    throw new Error(err);
  }
};
