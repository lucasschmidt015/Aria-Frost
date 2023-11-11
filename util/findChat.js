const Chat = require('../models/chat');



/**
 * 
 * @param {OBjectId} chatId Pass here the chat id
 * @param {OBjectId} userId Pass here the user id
 * @returns An object with chat data 
 */
exports.findChatByChatIdAndUserId = (chatId, userId) => {
    return Chat.findOne({ _id: chatId, ownerId: userId })
}

/**
 * 
 * @param {*} userId Pass here the user id
 * @returns Many objects with chat data 
 */
exports.findAllChatsByUserId = (userId) => {
    return Chat.find({ ownerId: userId })
}