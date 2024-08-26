import express, { Router, Request, Response } from "express";
import { knex } from "../utils/knex";

import { PostService } from "../services/PostService";
import PostController from "../controllers/PostController";

export const postRouter = Router();
postRouter.use(express.json());
postRouter.use(express.urlencoded({ extended: true }));

const postService = new PostService(knex);
const postController = new PostController(postService);

// postRouter.get("/", (req: Request, res: Response) => {
//   res.status(200).send("testing post api");
// });

// ******************assume there would be middleware to check login or not
postRouter.post("/checkIsCollected", postController.isCollected);
// ******************assume there would be middleware to check login or not
postRouter.post("/cancelCollection", postController.cancelCollection);
postRouter.post("/collectPost", postController.createCollection);
postRouter.post("/getPost", postController.getPostById);
postRouter.post("/getPosts", postController.getAllPosts);
postRouter.post("/getPostsByTag", postController.getAllPostsByTag);
postRouter.post("/getUserPosts", postController.getUserPosts);
postRouter.post("/getUserCollection", postController.getUserCollectedPosts);
postRouter.post("/publishPost", postController.publishPost);
postRouter.post("/searchNationTag", postController.searchNationTag);
postRouter.delete("/postNationTag", postController.deletePostNationTag);
postRouter.put("/postNationTag", postController.createPostNationTag);
postRouter.post("/getPostJson", postController.getJsonById);
postRouter.post("/getPostHtml", postController.getHtmlById);
postRouter.post("/editHtml", postController.editHtmlById);
postRouter.post("/editJson", postController.editJsonById);
postRouter.delete("/deletePost", postController.deletePost);
postRouter.post("/setPostPublic", postController.setPostPublic);
postRouter.post("/setPostPrivate", postController.setPostPrivate);
postRouter.post("/getComments", postController.getPostComments);
postRouter.post("/createComment", postController.createComment);
postRouter.post("/updatePost", postController.updatePostImage);
postRouter.post("/updateTitle", postController.updateTitle);
// postRouter.post("/", postController.getPostsGoogleVision);
postRouter.post("/getPostsByTextInput", postController.getPostsByTextInput);

postRouter.post("/updattags", postController.editTagsOtherInfor);
postRouter.post("/setPublic", postController.setPostPublic);
postRouter.post("/setPrivate", postController.setPostPrivate);
postRouter.post("/updateEditor", postController.upatePostHtmlJson);

postRouter.post("/checkCollection", postController.checkCollection);

postRouter.post("/checkSessionMatch", postController.checkSessionMatchPost);
postRouter.post("/uploadProfile", postController.updateProfileImage);
