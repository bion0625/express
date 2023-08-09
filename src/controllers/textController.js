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