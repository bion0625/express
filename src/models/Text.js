import mongoose from "mongoose";

const textSchema = new mongoose.Schema({
    title: {type: String, required: true, trim: true, maxLength: 80},
    text: {type: String, required: true, trim: true, minLength: 2},
    createdAt: {type: Date, required: true, default: Date.now},
    updatedAt: {type: Date, required: true, default: Date.now},
    views: {type: Number, default: 0},
    owner:{type: mongoose.Schema.Types.ObjectId, required: true, ref:"User"},
});

const Text = mongoose.model("Text", textSchema);
export default Text;