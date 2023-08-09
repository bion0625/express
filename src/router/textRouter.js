import express from "express";
import { getWrite, postWrite } from "../controllers/textController";

const textRouter = express.Router();

textRouter.route("/write").get(getWrite).post(postWrite);

export default textRouter;