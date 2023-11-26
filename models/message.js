const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
  },
  userName: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
    required: true,
  },
  firstMessageDay: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
