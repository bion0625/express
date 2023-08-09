import express from "express";
import { 
    getEdit,
    postEdit, 
    see, 
    logout, 
    startGithubeLogin, 
    finishGithubeLogin, 
    getChangePassword,
    postChangePassword
} from "../controllers/userController";
import { avatarUpload, protectorMiddleware, publicOnlyMiddleware } from "../middleware";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/githube/start", publicOnlyMiddleware, startGithubeLogin);
userRouter.get("/githube/finish", publicOnlyMiddleware, finishGithubeLogin);
userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);
userRouter.get("/:id", see);

export default userRouter;