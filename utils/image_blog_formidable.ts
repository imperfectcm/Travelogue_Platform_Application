import { Request, Response } from "express";
import formidable from "formidable";
import { unlink } from "fs/promises";
import path from "path";
import vision from "@google-cloud/vision";
import { nationArray } from "../countries";

let form = formidable({
  encoding: "utf-8",
  uploadDir: __dirname + "/../image_blog",
  keepExtensions: true,
  allowEmptyFiles: true,
});

const searchForm = formidable({
  uploadDir: "images/image_search",
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 1024 * 1024 * 5,
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

export let search = (req: Request) => {
  return new Promise<any>((resolve, reject) => {
    searchForm.parse(req, async (err, fields, files) => {
      if (err) {
        // res.status(500).json("Form parsing error");
        reject("Form parsing error");
        return;
      }

      const file = files.image as formidable.File;
      if (!file) {
        // res.status(400).json("No image file provided");
        reject("No image file provided");

        return;
      }

      const absolutePath = path.join(
        __dirname,
        `/../images/image_search/${file.newFilename}`
      );

      resolve(absolutePath);
    });
  });
};

export let blogImageParseForm = (req: Request) => {
  return new Promise<{ blogImage: string | null; userId: number | null }>(
    (resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          let blogImage: string | null;
          let userId: number | null;

          if ((files.image as formidable.File).size == 0) {
            await unlink(
              `${__dirname}/../image_blog/${
                (files.image as formidable.File).newFilename
              }`
            );
            blogImage = null;
          } else {
            blogImage = (files.image as formidable.File).newFilename;
          }

          if (fields.userId) {
            userId = ~~fields.userId;
          } else {
            userId = null;
          }

          resolve({ blogImage, userId });
        }
      });
    }
  );
};
