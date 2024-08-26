import { Knex } from "knex";
import { PostService } from "../services/PostService";
import PostController from "./PostController";
import { Request, Response } from "express";
import { createRequest, createResponse } from "../utils/reqAndRes";

describe("PostController", () => {
  let postController: PostController;
  let postService: PostService;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    postService = new PostService({} as Knex);
    // memoService.getMemo = jest.fn(async () => [
    //   { title: "title", content: "content", image: "image.jpeg", id: "1" },
    // ]);

    postController = new PostController(postService);
    req = createRequest() as Request;
    res = createResponse() as Response;
  });

  it("should create new post", async () => {
    postService.publishPost = jest.fn().mockResolvedValue({ id: 5 });
    await postController.publishPost(req, res);

    expect(res.status(200).json).toHaveBeenCalledWith({
      message: "Publish post successful.",
      postId: 5,
    });
  });

  it("should update html and json", async () => {
    postService.getHtmlJsonById = jest.fn().mockResolvedValue([
      {
        content_html: `<h1>testing</h1>`,
        content_json: `{"data":"test"}`,
      },
    ]);
    await postController.upatePostHtmlJson(req, res);

    expect(res.status(200).json).toHaveBeenCalledWith({
      message: "successfully update",
    });
  });

  it("should successfully set public", async () => {
    postService.publicPost = jest.fn();
    await postController.setPublic(req, res);
    expect(res.status(200).json).toHaveBeenCalledWith({
      data: "successfully set post public",
    });
  });

  it("should successfully set private", async () => {
    postService.privatePost = jest.fn();
    await postController.setPrivate(req, res);
    expect(res.status(200).json).toHaveBeenCalledWith({
      data: "successfully set post private",
    });
  });
});
