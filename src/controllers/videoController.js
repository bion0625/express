import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

// export const home = async (req, res) => {
//     const videos = await Video.find({}).populate("owner").sort({createdAt:"desc"});
//     return res.render("home", {pageTitle:"Home", videos})
// };
export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if(!video){
        return res.status(404).render("404", {pageTitle:"Video not found"});
    }
    return res.render("watch", {pageTitle: video.title, video});
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {user:{_id}} = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle:"Video not found"});
    }
    if(String(video.owner) !== String(_id)){
        req.flash("error", "You are not the owner of the video.");
        return res.status(403).redirect("/");
    }
    return res.render("edit", {pageTitle:`Edit:${video.title}`, video});
};

export const postEdit = async (req, res) => {
    const { id } = req.params;
    const {user:{_id}} = req.session;
    const { title, description, hashtags } = req.body;
    const video = await Video.findById(id);
    if(!video){
        return res.render("404", {pageTitle:"Video not found"});
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title, 
        description, 
        hashtags: Video.formatHashtags(hashtags)
    })
    req.flash("success", "Changes saved");
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle:"Upload Video"});
};

export const postUpload = async (req, res) => {
    const {
        body: {
            title, description, hashtags
        }, 
        files: {video, thumb},
        session: {
            user: {
                _id
            }
        }
    } = req;
    try{
        const isFly = res.locals.isFly;
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: isFly ? video[0].location : '/'+video[0].path,
            thumbUrl: isFly ? thumb[0].location : '/'+thumb[0].path,
            hashtags: Video.formatHashtags(hashtags),
            owner:_id
        });
        const user = await User.findById(_id).populate("videos");
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect(`/`);
    }catch(error){
        return res.status(400).render("upload", {
            pageTitle:"Upload Video",
            errorMessage: error._message
        });
    }
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const {user:{_id}} = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.render("404", {pageTitle:"Video not found"});
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async (req, res) => {
    const {keyword} = req.query;
    let videos = [];
    if(keyword){
        videos = await Video.find({
            title:{
                $regex: new RegExp(keyword, "i") // like '%keyword%' i는 대소문자 모두 적용
                // $regex: new RegExp(`^${keyword}`, "i") // like 'keyword%'
                // $regex: new RegExp(`${keyword}$`, "i") // like '%keyword'
            }
        }).populate("owner").sort({createdAt:"desc"});
    }
    return res.render("search", {pageTitle:"Search", videos});
}

export const registerView = async (req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
};

export const createComment = async (req, res) => {
    const {
        session: { user },
        params: { id },
        body: { text }
    } = req;
    
    const video = await Video.findById(id);

    if(!video){
        return res.sendStatus(404);
    }

    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id
    });
    video.comments.push(comment._id);
    await video.save();
    const commentUser = await User.findById(user._id);
    commentUser.comments.push(comment._id);
    commentUser.save();
    return res.status(201).json({newCommentId:comment._id});
};

export const deleteComment = async (req, res) => {
    const { id } = req.params;
    try{
        await Comment.findByIdAndDelete(id);
        res.sendStatus(200);
    }catch{
        res.sendStatus(404);
    }
};