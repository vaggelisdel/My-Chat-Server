const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username: {
            type: String
        },
        email: {
            type: String
        },
        password: {
            type: String
        },
        socketID: {
            type: String
        },
        registerDate: { type : Date, default: Date.now }
    }
);

let User = mongoose.model("Users", userSchema);

module.exports = User;
