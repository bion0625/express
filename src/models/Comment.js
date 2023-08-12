import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {type: String, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    text: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "Text"},
    createdAt: {type: Date, required: true, default: Date.now},
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;