import Comment from "../models/Comment";
import Text from "../models/Text";

export const deleteComment = async (req, res) => {
    const { id } = req.params;
    try{
        await Comment.findByIdAndDelete(id);
        res.sendStatus(200);
    }catch{
        res.sendStatus(404);
    }
};

export const createTextComment = async (req, res) => {
    const {
        session: { user },
        params: { id },
        body: { content }
    } = req;
    const text = await Text.findById(id);

    if(!text){
        return res.sendStatus(404);
    }

    const comment = await Comment.create({
        content,
        owner: user._id,
        text: id
    });
    return res.status(201).json({newCommentId:comment._id});
};