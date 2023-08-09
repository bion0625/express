import Text from "../models/Text";

export const home = async (req, res) => {
    // const videos = await Video.find({}).populate("owner").sort({createdAt:"desc"});
    const texts = await Text.find({}).populate("owner").sort({createdAt:"desc"});
    return res.render("home", {pageTitle:"Home", texts});
};