import express from "express";
import { deleteText, getDetail, getRead, getWrite, postDetail, postWrite } from "../controllers/textController";

const textRouter = express.Router();

textRouter.route("/write").get(getWrite).post(postWrite);
textRouter.route("/read/:id").get(getRead);
textRouter.route("/detail/:id").get(getDetail).post(postDetail);
textRouter.route("/delete/:id").delete(deleteText);

export default textRouter;