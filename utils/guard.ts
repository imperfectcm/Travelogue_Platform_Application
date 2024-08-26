import { NextFunction, Request, Response } from "express";

export async function isLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session?.userId) {
    next();
  } else {
    // Check if the request is for a static file
    // if (req.path.startsWith("/static/")) {
    //   // Redirect to the home page
    //   res.redirect("/");
    res.redirect("/");
    // } else {
    //   res.status(400).json({ message: "You are not logged in" });
    // }
  }
}
