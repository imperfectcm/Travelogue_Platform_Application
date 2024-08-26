import { Request, Response } from "express";
import { PostService } from "../services/PostService";
import { serverErr } from "../utils/serverError";
import { postImageParseForm } from "../utils/image_post_formidable";
import { mainpageCoverList } from "../utils/searchMainpageCoverFile";
import getFileData from "../utils/readFile";
import path from "path";
import { generateToken } from "../utils/generateToken";
import writeFile from "../utils/writeFile";
import fs from "fs";
import { profilePicParseForm } from "../utils/image_user_profile_formidable";

export default class PostController {
  constructor(private postService: PostService) {}

  // ==================== Post init ====================
  publishPost = async (req: Request, res: Response) => {
    let userId = req?.session?.userId;
    if (!userId) {
      res.status(400).json({ msg: "please login first" });
      return;
    }

    let {
      postImage,
      title,
      departureDate,
      travelDays,
      travellerCounts,
      averageExpenditure,
      content_json,
      content_html,
      status,
      nationTag,
      otherTag,
    } = req.body;

    try {
      let jsonFileName: string;
      let htmlFileName: string;

      jsonFileName = content_json ? `${generateToken()}.json` : null;
      htmlFileName = content_html ? `${generateToken()}.html` : null;

      let returnId: any = await this.postService.publishPost(
        ~~userId,
        postImage,
        title,
        departureDate,
        travelDays,
        travellerCounts,
        averageExpenditure,
        jsonFileName,
        htmlFileName,
        status
      );

      if (jsonFileName && htmlFileName) {
        //create html
        writeFile(
          path.join(__dirname, "../blog_htmls", htmlFileName),
          content_html
        );

        //create json
        writeFile(
          path.join(__dirname, "../blog_json", jsonFileName),
          JSON.stringify(content_json)
        );
      }

      let postId = ~~returnId.id;

      if (nationTag) {
        try {
          // let nationTagIdList = [];

          for (let eachNationTag of nationTag) {
            let eaahNationTagId = await this.postService.getNationTagId(
              eachNationTag
            );
            // if (eaahNationTagId) nationTagIdList.push(eaahNationTagId.id);
            if (eaahNationTagId)
              await this.postService.createNationTagRelation(
                postId,
                eaahNationTagId.id
              );
          }

          // nationTagIdList.forEach(
          //   async (eachTagId) =>
          //     await this.postService.createNationTagRelation(postId, eachTagId)
          // );
        } catch (err) {
          serverErr;
        }
      }

      if (otherTag) {
        try {
          await otherTag.forEach((eachOtherTag) =>
            this.postService.createOtherTag(postId, eachOtherTag)
          );
        } catch (err) {
          serverErr;
        }
      }

      res.status(200).json({
        message: "Publish post successful.",
        postId: postId,
      });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== update html json of article ====================

  upatePostHtmlJson = async (req: Request, res: Response) => {
    try {
      const { postId, json, html } = req.body;
      const data = await this.postService.getHtmlJsonById(~~postId);

      const htmlFileName = data[0].content_html;
      const jsonFileName = data[0].content_json;

      if (htmlFileName && jsonFileName) {
        //create html
        writeFile(path.join(__dirname, "../blog_htmls", htmlFileName), html);

        //create json
        writeFile(
          path.join(__dirname, "../blog_json", jsonFileName),
          JSON.stringify(json)
        );
      }

      res.status(200).json({ message: "successfully update" });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== set post public ====================
  setPostPublic = async (req: Request, res: Response) => {
    try {
      const { postId } = req.body;
      await this.postService.publicPost(postId);
      res.json({ data: "successfully set public" });
    } catch (err) {
      res.status(500).json({ data: "internal error" });
    }
  };

  // ==================== set post private ====================
  setPostPrivate = async (req: Request, res: Response) => {
    try {
      const { postId } = req.body;
      await this.postService.privatePost(postId);
      res.json({ data: "successfully set private" });
    } catch (err) {
      res.status(500).json({ data: "internal error" });
    }
  };

  // ==================== Search nation tags ====================
  searchNationTag = async (req: Request, res: Response) => {
    let { nationTag } = req.body;

    try {
      let nationTagListReturn = await this.postService.searchNationTag(
        nationTag
      );

      let nationTagList = nationTagListReturn.map(
        (eachNationTag) => eachNationTag.tag_name
      );

      res.status(200).json({ nationTagList: nationTagList });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== Update post image ====================
  updatePostImage = async (req: Request, res: Response) => {
    // let { postId, postImage } = req.body

    try {
      let { postImage, postId } = await postImageParseForm(req);

      if (postImage) await this.postService.updatePostImage(postId, postImage);

      res.status(200).json({ message: "Post image update successful." });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== Update profile image ====================

  updateProfileImage = async (req: Request, res: Response) => {
    // let { postId, postImage } = req.body

    try {
      let { profilePic, userId } = await profilePicParseForm(req);

      if (profilePic)
        await this.postService.updateProfileImage(userId, profilePic);

      res.status(200).json({ message: "profile image update successful." });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ***********************************for user to cancel collection
  cancelCollection = async (req: Request, res: Response) => {
    try {
      const { postId } = req.body;
      let userId = req?.session?.userId;

      const result = await this.postService.checkCollection(
        Number(postId),
        Number(userId)
      );
      if (result.length == 0) {
        res.status(400).json({ error: "failure in cancel collection" });
        return;
      } else {
        const result = await this.postService.deleteCollectPost(
          Number(postId),
          Number(userId)
        );
        res.status(200).json({ data: "success in cancelling collection" });
        return;
      }

      //check if there is collection //
    } catch (err) {
      res.status(500).json({ data: "internal error" });
    }
  };

  // ***********************************check collection or not
  checkCollection = async (req: Request, res: Response) => {
    try {
      const { postId } = req.body;
      let userId = req?.session?.userId;
      const result = await this.postService.checkCollection(~~postId, userId);
      if (result.length > 0) {
        res.status(200).json({ collected: true });
      } else {
        res.status(200).json({ collected: false });
      }
    } catch (err) {
      res.status(500).json({ err: "internal error" });
    }
  };

  // ***********************************for user to create collection
  createCollection = async (req: Request, res: Response) => {
    try {
      let userId = req?.session?.userId;
      // will be replaced by seession id
      const { postId } = req.body;
      const result = await this.postService.checkCollection(postId, userId);
      if (result.length > 0) {
        res.status(400).json({ err: "the post is already collected by u" });
      }
      await this.postService.collectPost(postId, userId);
      res.status(200).json({ data: "successfully collect" });
    } catch (err) {
      res.status(500).json({ err: "internal error" });
    }
  };

  // ==================== Update post info ====================
  updatePostInfo = async (req: Request, res: Response) => {
    let { updateDate, updateDays, updateCount, updateExpense, postId } =
      req.body;

    try {
      await this.postService.updatePostInfo(
        updateDate,
        updateDays,
        updateCount,
        updateExpense,
        postId
      );

      res.status(200).json({ message: "Post information edit successful." });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== Update nation tags only ====================

  // Delete nation tags
  deletePostNationTag = async (req: Request, res: Response) => {
    let { postId } = req.body;
    try {
      await this.postService.deletePostNationTag(postId);

      res
        .status(200)
        .json({ message: "Post nation tag/tags delete successful." });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // Create nation tags
  createPostNationTag = async (req: Request, res: Response) => {
    let { postId, nationTag } = req.body;
    try {
      let nationTagIdList = [];

      for (let eachNationTag of nationTag) {
        let eaahNationTagId = await this.postService.getNationTagId(
          eachNationTag
        );
        if (eaahNationTagId) nationTagIdList.push(eaahNationTagId.id);
      }

      nationTagIdList.forEach(
        async (eachTagId) =>
          await this.postService.createNationTagRelation(postId, eachTagId)
      );

      res
        .status(200)
        .json({ message: "Post nation tag/tags update successful." });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };
  // ==================== Update title only ====================

  updateTitle = async (req: Request, res: Response) => {
    const { updateTitle, postId } = req.body;
    try {
      await this.postService.updateTitle(updateTitle, ~~postId);
      res.status(200).json({ message: "update successfully" });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== Update other tags only ====================

  // Delete other tags
  deletePostOtherTag = async (req: Request, res: Response) => {
    let { postId } = req.body;
    try {
      await this.postService.deletePostOtherTag(postId);

      res
        .status(200)
        .json({ message: "Post other tag/tags delete successful." });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // Create other tags
  createOtherTag = async (req: Request, res: Response) => {
    let { postId, otherTag } = req.body;
    try {
      // review: map => insert
      otherTag.forEach(
        async (eachOtherTag) =>
          await this.postService.createOtherTag(postId, eachOtherTag)
      );

      res
        .status(200)
        .json({ message: "Post other tag/tags delete successful." });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ******************************get all the post with pagination and sorting
  getAllPosts = async (req: Request, res: Response) => {
    let mainpageCoverListReturn = await mainpageCoverList;
    console.log(mainpageCoverListReturn);

    try {
      const {
        page,
        perPage,
        orderDirection,
        orderBy,
      }: {
        page?: number;
        perPage?: number;
        orderDirection?: "asc" | "desc";
        orderBy?: "count" | "created_at";
      } = req.body;
      const finalOrderBy = orderBy === "count" ? "count" : `posts.${orderBy}`;
      const result = await this.postService.getAllPosts(
        page,
        perPage,
        orderDirection,
        finalOrderBy
      );

      if (result.length === 0) {
        res
          .status(200)
          .json({ message: "There are no more posts", hasPosts: false });
        return;
      }

      res.status(200).json({
        data: result,
        mainpageCoverList: mainpageCoverListReturn,
        hasPosts: true,
      });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ******************************get user post with pagination and sorting
  getUserPosts = async (req: Request, res: Response) => {
    // let userId = 2;
    //assume will be replaced by session id
    try {
      const {
        page,
        perPage,
        orderDirection,
        orderBy,
        userId,
      }: {
        page?: number;
        perPage?: number;
        orderDirection?: "asc" | "desc";
        orderBy?: "count" | "created_at";
        userId: number;
      } = req.body;
      const finalOrderBy = orderBy === "count" ? "count" : `posts.${orderBy}`;
      const result = await this.postService.getUserPosts(
        page,
        perPage,
        orderDirection,
        finalOrderBy,
        userId
      );
      res.status(200).json({ data: result });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };
  // ******************************get user collected post with pagination and sorting

  getUserCollectedPosts = async (req: Request, res: Response) => {
    let userId = req?.session?.userId;
    //assume will be replaced by session id
    try {
      const {
        page,
        perPage,
        orderDirection,
        orderBy,
      }: {
        page?: number;
        perPage?: number;
        orderDirection?: "asc" | "desc";
        orderBy?: "count" | "created_at";
      } = req.body;
      const finalOrderBy = orderBy === "count" ? "count" : `posts.${orderBy}`;
      const result = await this.postService.getUserCollectedPosts(
        page,
        perPage,
        orderDirection,
        finalOrderBy,
        userId
      );
      res.status(200).json({ data: result });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ******************************get all comments of post
  getPostComments = async (req: Request, res: Response) => {
    try {
      const { postId } = req.body;
      const comments = await this.postService.getPostComments(postId);
      res.status(200).json({ data: comments });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };
  // ******************************create comment
  createComment = async (req: Request, res: Response) => {
    let userId = req?.session?.userId;
    if (!userId) {
      res.status(400).json({ msg: "please login first" });
      return;
    }

    try {
      const { postId, comment } = req.body;
      const comments = await this.postService.createComment(
        postId,
        userId,
        comment
      );
      res.status(200).json({ data: comments });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // *************************************************** check post is collected or not assuming middleware already check is logged in
  isCollected = async (req: Request, res: Response) => {
    try {
      const postId: number = Number(req.body.id);
      ///sample userid will be replaced by session id
      let userId = req?.session?.userId;
      if (!userId) {
        res.status(400).json({ msg: "please login first" });
        return;
      }
      let isCollected: boolean;
      // logic to check if post is collected
      const CollectedArray = await this.postService.isPostCollected(
        postId,
        userId
      );
      if (CollectedArray.length == 0) {
        isCollected = false;
      } else {
        isCollected = true;
      }
      res.status(200).json({ data: isCollected });
    } catch (err) {
      res.status(500).json({ err: "internal error" });
    }
  };

  // *************************************************** Get the post details by id
  getPostById = async (req: Request, res: Response) => {
    try {
      let resultData: any = {};

      const { postId } = req.body;
      //logic to search post content
      const post = await this.postService.getPostInforById(postId);

      const authorProfile = await this.postService.getAuthorProfile(postId);

      // logic to get the collection number of post
      const collectionCount: any = await this.postService.collectionCount(
        postId
      );

      // logic to get the nation tag
      const nationTag = await this.postService.getPostNationTag(postId);

      // logic to get the other tag
      const otherTag = await this.postService.getPostOtherTag(postId);

      resultData = {
        post,
        authorProfile,
        collectionCount: Number(collectionCount[0]?.count),
      };

      if (nationTag) {
        resultData.nationTag = nationTag;
      }

      if (otherTag) {
        resultData.otherTag = otherTag;
      }

      if (req.session.userId as number) {
        let userId = req.session.userId as number;
        const isPostCollected: any = await this.postService.isPostCollected(
          userId,
          postId
        );
        resultData.isCollected = isPostCollected;
      }
      res.status(200).json({ resultData });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // *************************get json file
  getJsonById = async (req: Request, res: Response) => {
    try {
      const postId = req.body.id;
      const jsonFile: any = await this.postService.getJsonfile(postId);
      const el = jsonFile[0].content_json;
      const fileName = path.join(__dirname, "../blog_json", el);
      const jsonData = getFileData(fileName);
      const data = JSON.parse(jsonData);

      res.status(200).json({ data });
    } catch (err) {
      res.status(500).json({ err: "internal error" });
    }
  };
  // *************************get html file
  getHtmlById = async (req: Request, res: Response) => {
    try {
      const postId = req.body.id;
      const jsonFile: any = await this.postService.getHtmlfile(postId);
      const el = jsonFile[0].content_html;
      const fileName = path.join(__dirname, "../blog_htmls", el);
      const htmlData = getFileData(fileName);

      res.status(200).json({ data: htmlData });
    } catch (err) {
      res.status(500).json({ err: "internal error" });
    }
  };

  // *************************edit html file
  editHtmlById = async (req: Request, res: Response) => {
    try {
      const { id, content } = req.body;

      // get the file name
      const jsonFile: any = await this.postService.getHtmlfile(id);

      const fileName = jsonFile[0].content_html;
      const filePath = path.join(__dirname, "../blog_htmls", fileName);
      writeFile(filePath, content);
      res.status(200).json({ data: "successfully edited html", id });
    } catch (err) {
      res.status(500).json({ err: err });
    }
  };

  // *************************edit json file
  editJsonById = async (req: Request, res: Response) => {
    try {
      const { id, content } = req.body;
      // get the file name
      // const postId = await this.postService.checkId(id);
      const jsonFile: any = await this.postService.getJsonfile(id);
      const fileName = jsonFile[0].content_json;
      const filePath = path.join(__dirname, "../blog_json", fileName);
      writeFile(filePath, JSON.stringify(content));
      res.status(200).json({ data: "successfully edited json", id });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // *************************delete post unlink json and html file
  deletePost = async (req: Request, res: Response) => {
    try {
      const id = req.body.id;
      const html = (await this.postService.getHtmlfile(id))[0].content_html;
      const json = (await this.postService.getJsonfile(id))[0].content_json;
      await this.postService.deletePostById(id);

      fs.unlink(path.join(__dirname, "../blog_htmls", html), (err) => {
        console.error(err);
      });
      fs.unlink(path.join(__dirname, "../blog_json", json), (err) => {
        console.error(err);
      });
      res.status(200).json({ data: "successfully deleted" });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== Search nation tags ====================
  searchByNationTag = async (req: Request, res: Response) => {
    let { nationTag } = req.query;

    try {
      let nationTagListReturn = await this.postService.searchNationTag(
        nationTag
      );

      let nationTagList = nationTagListReturn.map(
        (eachNationTag) => eachNationTag.tag_name
      );

      res.status(200).json({ nationTagList: nationTagList });
      return;
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== Search posts by google ====================

  // getPostsGoogleVision = async (req: Request, res: Response) => {
  //   let mainpageCoverListReturn = await mainpageCoverList.then(
  //     (mainpageCoverList) => {
  //       return mainpageCoverList;
  //     }
  //   );

  //   try {
  //     const {
  //       page,
  //       perPage,
  //       orderDirection,
  //       orderBy,
  //       tagName,
  //     }: {
  //       page?: number;
  //       perPage?: number;
  //       orderDirection?: "asc" | "desc";
  //       orderBy?: "count" | "created_at";
  //       tagName?: string;
  //     } = req.body;

  //     const finalOrderBy = orderBy === "count" ? "count" : `posts.${orderBy}`;

  //     const result = await this.postService.getPostsGoogleVision(
  //       page,
  //       perPage,
  //       orderDirection,
  //       finalOrderBy,
  //       tagName
  //     );

  //     if (result.length === 0) {
  //       res.status(200).json({ message: "There are no more posts" });
  //       return;
  //     }

  //     res.status(200).json({
  //       data: result,
  //       mainpageCoverList: mainpageCoverListReturn,
  //     });
  //   } catch (err) {
  //     serverErr(err, res);
  //     return;
  //   }
  // };
  // ==================== editing tags and other information ====================
  editTagsOtherInfor = async (req: Request, res: Response) => {
    let userId = req?.session?.userId;
    if (!userId) {
      res.status(400).json({ msg: "please login first" });
      return;
    }
    const {
      postId,
      departureDate,
      travelDays,
      travellerCounts,
      averageExpenditure,
      nationTag,
      otherTag,
    } = req.body;
    try {
      //udpate post optional info
      await this.postService.updatePostInfo(
        departureDate,
        ~~travelDays,
        ~~travellerCounts,
        ~~averageExpenditure,
        ~~postId
      );
      // delet all the tags
      await this.postService.deletePostNationTag(postId);
      await this.postService.deletePostOtherTag(postId);
      if (!nationTag && !otherTag) {
        res.status(200).json({ message: "successfully updated" });
        return;
      }
      //only nation need to create
      if (nationTag) {
        for (let tag of nationTag) {
          const nationId = await this.postService.getNationTagId(tag);
          await this.postService.createNationTagRelation(
            ~~postId,
            ~~nationId.id
          );
        }
      }

      if (otherTag) {
        for (let tag of otherTag) {
          await this.postService.createOtherTag(~~postId, tag);
        }
      }
      res.status(200).json({ message: "successfully created" });
      //only other tag need to create
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ====================set post public====================//
  setPublic = async (req: Request, res: Response) => {
    const { postId } = req.body;
    try {
      await this.postService.publicPost(~~postId);
      res.status(200).json({ data: "successfully set post public" });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ====================set post public====================  //
  setPrivate = async (req: Request, res: Response) => {
    const { postId } = req.body;
    try {
      await this.postService.privatePost(~~postId);
      res.status(200).json({ data: "successfully set post private" });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  //=====================search post by text input ==============//

  getPostsByTextInput = async (req: Request, res: Response) => {
    let mainpageCoverListReturn = await mainpageCoverList.then(
      (mainpageCoverList) => {
        return mainpageCoverList;
      }
    );

    try {
      const {
        page,
        perPage,
        orderDirection,
        orderBy,
        inputValue,
      }: {
        page?: number;
        perPage?: number;
        orderDirection?: "asc" | "desc";
        orderBy?: "count" | "created_at";
        inputValue?: string;
      } = req.body;
      const finalOrderBy = orderBy === "count" ? "count" : `posts.${orderBy}`;

      const result = await this.postService.getPostsByTextInput(
        page,
        perPage,
        orderDirection,
        finalOrderBy,
        inputValue
      );

      if (result.length === 0) {
        res.status(200).json({ message: "There are no more posts" });
        return;
      }

      res.status(200).json({
        data: result,
        mainpageCoverList: mainpageCoverListReturn,
      });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  checkSessionMatchPost = async (req: Request, res: Response) => {
    const { postId } = req.body;
    const userId = req.session.userId;

    try {
      if (!userId) {
        res.status(400).json({ msg: "not logged in yet " });
        return;
      }

      const { user_id } = await this.postService.getPostInforById(~~postId);
      if (user_id === userId) {
        res.status(200).json({
          match: true,
        });
      } else {
        res.status(200).json({
          match: false,
        });
      }
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  // ==================== get all the post by tag searching with pagination and sorting ====================
  getAllPostsByTag = async (req: Request, res: Response) => {
    let mainpageCoverListReturn = await mainpageCoverList.then(
      (mainpageCoverList) => {
        return mainpageCoverList;
      }
    );

    try {
      const {
        page,
        perPage,
        orderDirection,
        orderBy,
        tag,
      }: {
        page?: number;
        perPage?: number;
        orderDirection?: "asc" | "desc";
        orderBy?: "count" | "created_at";
        tag: string;
      } = req.body;

      const finalOrderBy = orderBy === "count" ? "count" : `posts.${orderBy}`;
      const result = await this.postService.getAllPostsByTag(
        page,
        perPage,
        orderDirection,
        finalOrderBy,
        tag
      );

      if (result.length === 0) {
        res
          .status(200)
          .json({ message: "There are no more posts", hasPosts: false });
        return;
      }

      res.status(200).json({
        data: result,
        mainpageCoverList: mainpageCoverListReturn,
        hasPosts: true,
      });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };

  getNationTagsByUserId = async (req: Request, res: Response) => {
    let userId = req?.session?.userId;
    if (!userId) {
      res.status(400).json({ msg: "please login first" });
      return;
    }

    try {
      const { postId, comment } = req.body;
      const comments = await this.postService.createComment(
        postId,
        userId,
        comment
      );
      res.status(200).json({ data: comments });
    } catch (err) {
      serverErr(err, res);
      return;
    }
  };
}
