import Comment from "../models/Comment";
import Text from "../models/Text";

export const getWrite = (req, res) => {
    res.render("text/write");
};

export const postWrite = async (req, res) => {
    const {
        body: {title, text},
        session: {user:{_id}}
    } = req;
    await Text.create({
        title,
        text,
        owner:_id
    });
    res.redirect("/");
};

export const getRead = async (req, res) => {
    const {id} = req.params;
    const text = await Text.findById(id);
    text.views++;
    await text.save();
    const comments = await Comment.find({text:id}).sort({createdAt:"desc"});
    res.render("text/read", {text, comments});
};

export const getDetail = async (req, res) => {
    const {id} = req.params;
    const text = await Text.findById(id);
    res.render("text/detail", {text});
};

export const postDetail = async (req, res) => {
    const {
        params: {id},
        body: {title, text}
    } = req;
    const newText = await Text.findByIdAndUpdate(
        id,
        {title, text},
        );
    res.redirect(`/text/read/${id}`); 
};

export const deleteText = async (req, res) => {
    const {id} = req.params;
    try{
        await Text.findByIdAndDelete(id);
        res.sendStatus(200);
    }catch{
        res.sendStatus(404);
    }
};

export const search = async (req, res) => {
    const {keyword} = req.query;
    let texts = [];
    if(keyword){
        texts = await Text.find({
            $or:[
                {
                    title:{
                        $regex: new RegExp(keyword, "i") // like '%keyword%' i는 대소문자 모두 적용
                        // $regex: new RegExp(`^${keyword}`, "i") // like 'keyword%'
                        // $regex: new RegExp(`${keyword}$`, "i") // like '%keyword'
                    }
                },
                {
                    text:{
                        $regex: new RegExp(keyword, "i")
                    }
                }
            ]
        }).populate("owner").sort({createdAt:"desc"});
    }
    return res.render("search", {pageTitle:"Search", texts});
}