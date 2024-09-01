const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: true
    },
    recipientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: true
    },
    text: {
        type: String,
        required: true
    },
    like: {
        type: Boolean,
        default: false,
    },
},
    {timestamps: true});

const message = mongoose.model("message", messageSchema);
module.exports = message