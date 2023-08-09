import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./router/rootRouter";
import userRouter from "./router/userRouter";
import videoRouter from "./router/videoRouter";
import { localsMiddleware } from "./middleware";
import apiRouter from "./router/apiRouter";
import textRouter from "./router/textRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(logger);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl:process.env.DB_URL})
}))

app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/staticfile", express.static("staticfile"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/text", textRouter);
app.use("/api", apiRouter);

export default app;