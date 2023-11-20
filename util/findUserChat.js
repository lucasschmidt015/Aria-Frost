const User = require("../models/user");

exports.findChatUsers = async (chatId, ownerId) => {
  try {
    const users = await User.find({
      $or: [{ _id: ownerId }, { chats: { $in: [chatId] } }],
    });

    const ordedUsers = users.sort((a, b) => {
      if (a._id.equals(ownerId)) return -1;
      if (b._id.equals(ownerId)) return 1;
      return a.name.localeCompare(b.name);
    });

    return ordedUsers;
  } catch (err) {
    throw new Error(err);
  }
};
