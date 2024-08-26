import express, { Router, Request, Response } from "express";
import { knex } from "../utils/knex";

import { AuthService } from "../services/AuthService";
import AuthController from "../controllers/AuthController";

//import { Request } from 'express';
//import { Session, SessionData } from 'express-session';

export const authRouter = Router();
// authRouter.use(express.json());
// authRouter.use(express.urlencoded({ extended: true }));

const authService = new AuthService(knex);
const authController = new AuthController(authService);

authRouter.post("/register", authController.register);
authRouter.get("/verify-email", authController.verifyEmail2);

authRouter.post("/logout", authController.logout);
authRouter.post("/userInfo", authController.getUserPageInfo);
authRouter.get("/userInfo", authController.getOwnInfo);
authRouter.put("/blogImage", authController.updateBlogImage);
authRouter.post("/login", authController.login);
//authRouter.post("/sendemail", authController.sendemail)

authRouter.post("/updateInfor", authController.updateUserInfo);
authRouter.post("/matchSession", authController.checkSessionMatchUserId);

authRouter.get("/", (req: Request, res: Response) => {
  res.status(200).send("testing auth api");
});

// declare module 'express-session' {
//   interface Session extends SessionData {
//     userId: number;
// }

// declare module 'express-session' {
//   interface SessionData {
//     userId: number;
//   }
// }

// declare module 'express' {
//   interface Request {
//     session: Session;
//   }
// }
