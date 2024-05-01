const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    board: { type: String, required: true },
    text: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    bumped_on: { type: Date, default: Date.now },
    reported: { type: Boolean, default: false },
    delete_password: { type: String, required: true },
    replies: [{
        text: { type: String, required: true },
        created_on: { type: Date, default: Date.now },
        reported: { type: Boolean, default: false },
        delete_password: { type: String, required: true }
    }]
});

const Message = mongoose.model("Message", MessageSchema);

exports.Message = Message;
