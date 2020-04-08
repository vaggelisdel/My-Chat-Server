const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        senderId: {
            type: String
        },
        receiverId: {
            type: String
        },
        message: {
            type: String
        },
        date: { type: String }
    }
);

let Message = mongoose.model("Messages", messageSchema);

module.exports = Message;
