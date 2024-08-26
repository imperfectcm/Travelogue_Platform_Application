import { AuthService } from "../services/AuthService";
import { Request, Response } from "express";
import { serverErr } from "../utils/serverError";

/*********************Email Function****************/
import FormData from "form-data";
import knex, { Knex } from "knex";

import { Session, SessionData } from "express-session";
import { generateToken } from "../utils/generateToken";
import { testEmail } from "../utils/sendVerificationMail";
import { blogImageParseForm } from "../utils/image_blog_formidable";
import { getRandomInteger } from "../utils/generateRandomNumf";

interface UserInfo {
  id: number;
  email: string;
  password: string;
  status: string;
}

const formData = new FormData();

//const mailgun = new Mailgun(formData);

//const DOMAIN = 'sandboxd87a7e472e50495abbb2f8298cf1df6c.mailgun.org';
//const mg = mailgun({apikey:process.env.MAILGUN_APIKEY, domain:DOMAIN});
// //const mailgun = Mailgun({apiKey: process.env.MAILGUN_APIKEY || 'key-yourkeyhere',
// domain: DOMAIN,
//   });
export default class AuthController {
  // Register

  //private mailgun: Mailgun;

  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    let { username, email, password } = req.body;
    let status = "pending";
    let emailtoken = generateToken();
    try {
      //check if the user already exists
      let registerInfo = await this.authService.checkUserDuplicate(email);

      if (registerInfo) {
        //return an error response when user already exists
        res
          .status(400)
          .json({ message: "User with this email already exists" });
        return;
      }

      const randomNum = getRandomInteger(1, 13);
      const blog_image = `d-cat${randomNum}.jpg`;
      const profile_pic = `d-cat${randomNum}.jpg`;

      const newUser = await this.authService.createNewUser(
        username,
        email,
        password,
        emailtoken,
        status,
        blog_image,
        profile_pic
      );

      testEmail(email, newUser.id);

      return res.status(201).json({ newUser });
    } catch (err) {
      serverErr(err, res);
    }
  };

  /*********************Email Function****************/
  verifyEmail2 = async (req: Request, res: Response) => {
    const emailToken = req.query.emailToken;

    try {
      if (!emailToken) return res.status(404).json("EmailToken not found...");

      const users = await this.authService.verifySuccess(emailToken);
      const user = users[0];

      if (user) {
        res.redirect("/");
        return;
      }
      return;
    } catch (err) {
      serverErr(err, res);
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const userInfo: UserInfo | null = await this.authService.getUserByEmail(
        email
      );

      if (userInfo && userInfo.status === "pending") {
        res
          .status(400)
          .json({ message: "Didn't Registrate or activated by Email" });
        return;
      }

      if (userInfo && userInfo.password === password) {
        req.session.userId = userInfo.id;
        res.status(200).json({
          userId: req.session.userId,
          data: userInfo,
        });
        return;
      }

      res.status(400).json({ message: "Login Failed" });
      return;
    } catch (err: any) {
      serverErr(err, res);
    }
  };

  // Logout
  logout = async (req: Request, res: Response) => {
    try {
      if (req.session.userId) {
        req.session.destroy((err) => {
          if (err) {
            res.status(400).json({ message: "Unable to log out." });
            return;
          } else {
            res.status(200).json({ message: "Logout successful." });
          }
        });
      } else {
        res.status(400).json({ message: "You are not logged in." });
        return;
      }
    } catch (err) {
      serverErr(err, res);
    }
  };

  // Get user page information
  getUserPageInfo = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      const result = await this.authService.getUserInfos(~~userId);
      res.status(200).json({ result });
      // return;
    } catch (err) {
      serverErr(err, res);
    }
  };

  // Get user page information
  getOwnInfo = async (req: Request, res: Response) => {
    try {
      if (req.session.userId) {
        let userId: number;
        userId = req.session.userId;
        let userInfo = await this.authService.getUserInfos(userId);
        res.status(200).json({ userInfo, loggedIn: true });
        return;
      } else {
        res
          .status(200)
          .json({ message: "User did not log in.", loggedIn: false });
      }
    } catch (err) {
      serverErr(err, res);
    }
  };

  // Update blog image
  updateBlogImage = async (req: Request, res: Response) => {
    // let { userId, blogImage } = req.body;

    try {
      let userId = req.session.userId;
      let { blogImage } = await blogImageParseForm(req);

      if (blogImage) await this.authService.updateBlogImage(userId, blogImage);

      res
        .status(200)
        .json({ message: "Update personal cover image successful." });
      return;
    } catch (err) {
      serverErr(err, res);
    }
  };

  // // Update profile pic
  // updateProfilePic = async (req: Request, res: Response) => {
  //   let { userId, profilePic } = req.body;

  //   try {
  //     await this.authService.updateProfilePic(userId, profilePic);

  //     res.status(200).json({ message: "Update profile picture successful." });
  //     return;
  //   } catch (err) {
  //     serverErr(err, res);
  //   }
  // };

  // Update user personal info
  updateUserInfo = async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    if (!userId) {
      res.status(400).json({ msg: "not loggin yet" });
      return;
    }
    let { username, caption, livingLocation } = req.body;

    try {
      await this.authService.updateUserInfo(
        userId,
        username,
        caption,
        livingLocation
      );

      res
        .status(200)
        .json({ message: "Edit personal informarion successful." });
      return;
    } catch (err) {
      serverErr(err, res);
    }
  };

  // ==================== Update user password ====================

  // Check user password
  checkUserPassword = async (req: Request, res: Response) => {
    let { userId, password } = req.body;

    try {
      let originalPassword = (await this.authService.getUserPassword(userId))
        .password;

      if (password == originalPassword) {
        res.status(200).json({ message: "Original password match." });
        return;
      }
      res.status(400).json({ message: "Original password does not match." });
      return;
    } catch (err) {
      serverErr(err, res);
    }
  };

  // Update user password
  updateUserPassword = async (req: Request, res: Response) => {
    let { userId, password } = req.body;

    try {
      await this.authService.updateUserPassword(userId, password);

      res.status(200).json({ message: "Edit password successful." });
      return;
    } catch (err) {
      serverErr(err, res);
    }

    //

    // Forgot password
  };

  checkSessionMatchUserId = async (req: Request, res: Response) => {
    const { userId } = req.body;

    const sessionId = req.session.userId;

    try {
      if (!sessionId) {
        res.status(400).json({ msg: "not logged in yet " });
        return;
      }
      if (sessionId == userId) res.status(200).json({ match: true });
      else if (sessionId !== userId) res.status(200).json({ match: false });
      // logic to check if the session id match with id

      // const { user_id } = await this.postService.getPostInforById(~~postId);
      // if (user_id === userId) {
      //   res.status(200).json({
      //     match: true,
      //   });
      // } else {
      //   res.status(200).json({
      //     match: false,
      //   });
    } catch (err) {
      serverErr(err, res);
      res.status(500).json({
        message: "internal error",
      });
    }
  };
}
