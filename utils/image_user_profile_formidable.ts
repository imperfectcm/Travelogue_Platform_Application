import { Request, Response } from "express";
import formidable from "formidable";
import { unlink } from "fs/promises";

let form = formidable({
  encoding: "utf-8",
  uploadDir: __dirname + "/../image_user_profile",
  keepExtensions: true,
  allowEmptyFiles: true,
});

export let profilePicParseForm = (req: Request) => {
  return new Promise<{ profilePic: string | null; userId: number | null }>(
    (resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        let userId = req?.session?.userId;
        if (!userId) throw new Error("not loggin yet");

        if (err) {
          reject(err);
        } else {
          let profilePic: string | null;
          let postId: number | null;

          if ((files.image as formidable.File).size == 0) {
            await unlink(
              `${__dirname}/../image_blog/${
                (files.image as formidable.File).newFilename
              }`
            );
            profilePic = null;
          } else {
            profilePic = (files.image as formidable.File).newFilename;
          }

          // if (fields.postId) {
          //   postId = ~~fields.postId;
          // } else {
          //   postId = null;
          // }

          resolve({ profilePic, userId });
        }
      });
    }
  );
};
