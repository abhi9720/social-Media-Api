const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    name: {
        // if user deleted their account and they still want to keep their post
        type: String,
    },
    text: {
        type: String,
        required: true,
    },

    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            text: {
                type: String,
                require: true,
            },
            name: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = Post = mongoose.model("Post", PostSchema);
