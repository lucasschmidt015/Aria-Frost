const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  userName: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
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

const chatSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  description: {
    type: String,
    required: false,
  },
  imageName: {
    type: String,
    required: false,
  },
  messages: [messageSchema],
});

module.exports = mongoose.model("Chat", chatSchema);
