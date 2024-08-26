import { Request, Response } from "express";
import formidable from "formidable";
import { unlink } from "fs/promises";

export function createRequest() {
  return {
    session: { userId: 1 },
    cookies: {},
    headers: {},
    query: {},
    body: {},
    fields: {},
    files: {},
    params: {},
  } as unknown as Request;
}

export function createResponse() {
  let res: any = {};
  res.status = jest.fn((status: number) => res);
  res.json = jest.fn(() => null);
  return res as Response;
}

let form = formidable({
  encoding: "utf-8",
  uploadDir: __dirname + "/../image_search",
  keepExtensions: true,
  allowEmptyFiles: true,
});

export const parseForm = (req: Request) => {
  return new Promise<{
    image: string | undefined;
  }>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        let image: string | undefined;

        if ((files.image as formidable.File).size == 0) {
          await unlink(
            `${__dirname}/../image_search/${
              (files.image as formidable.File).newFilename
            }`
          );
          image = undefined;
        } else {
          image = (files.image as formidable.File).newFilename;
        }

        resolve({ image });
      }
    });
  });
};
