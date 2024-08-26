import { Request, Response } from "express";
import formidable from "formidable";
import { unlink } from "fs/promises";


let form = formidable({
  encoding: 'utf-8',
  uploadDir: __dirname + '/../image_post',
  keepExtensions: true,
  allowEmptyFiles: true
})

export let postImageParseForm =(req: Request) =>{
  return new Promise<{ postImage: string | null, postId: number | null }>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err)
      } else {

        let postImage: string | null
        let postId: number | null

        if ((files.image as formidable.File).size == 0) {
          await unlink(`${__dirname}/../image_post/${((files.image as formidable.File).newFilename)}`)
          postImage = null
        } else {
          postImage = ((files.image as formidable.File).newFilename)
        }

        if (fields.postId) {
          postId = ~~fields.postId
        } else {
          postId = null
        }

        resolve({ postImage, postId })
      }
    })
  })
}