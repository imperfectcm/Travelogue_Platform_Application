import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { authRouter } from "./router/authRouter";
import { postRouter } from "./router/postRouter";
import { searchRouter } from "./router/searchRouter";
import expressSession from "express-session";

//const dotenv = require('dotenv');
const PORT = 8080;
const app = express();

//***************************************For Email Function
//import mg from "mailgun-js";
import cors from "cors";
import { isLoggedIn } from "./utils/guard";
app.use(cors());

dotenv.config();

// const mailgun = () =>
//   mg({
//     apiKey: process.env.MAILGUN_API_KEY,
//     domain: process.env.MAILGUN_DOMAIN
//   })
//****************************************************** */
app.use(
  expressSession({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

// ****************************************parsing middleware
// app.use(express.urlencoded());
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// ****************************************api routers
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/searchRouter", searchRouter);
app.use(express.static("public"));
app.use(express.static("utils"));
app.use(express.static("images/image_blog"));
app.use(express.static("images/image_user_profile"));
app.use(express.static("images/image_mainpage_cover"));
app.use(express.static("images/image_user_profile"));
app.use(express.static("images/image_post"));

//*****************************************end point
app.use("/", express.static("public/main_page"));
app.use("/blog", express.static("public/user_page"));
app.use("/post", express.static("public/post_page"));
app.use("/post-init", isLoggedIn, express.static("public/post_init_page"));
// app.use("/search", express.static("public/search_page"));
app.use("/login", express.static("public/login_page"));
app.use("/register", express.static("public/register_page"));
// app.use("/posts/:id", express.static("public/post_page"));

//***************************************** */ testing
app.get("/", function (req: Request, res: Response) {
  res.end("Hello from Project3");
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`);
});
