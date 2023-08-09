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
    res.redirect("/text/write");
};

export const getRead = async (req, res) => {
    const {id} = req.params;
    const text = await Text.findById(id);
    text.views++;
    await text.save();
    res.render("text/read", {text});
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