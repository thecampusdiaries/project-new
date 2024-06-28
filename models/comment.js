const mongoose = require('mongoose')
const { Schema } = mongoose

const commentSchema = new Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("Comment", commentSchema)