import dotenv from "dotenv";
import { Request, Response } from "express";
import fs from "fs";
import { SearchService } from "../services/SearchService";
import { search } from "../utils/image_blog_formidable";
import { serverErr } from "../utils/serverError";
import {
  photoRecognition,
  getCountryNamefromAddress,
} from "../utils/countryNameSearch";
dotenv.config();
const uploadDir = "image_search";
fs.mkdirSync(uploadDir, { recursive: true });

export default class SearchController {
  constructor(private searchService: SearchService) {}

  //============search by google vision============================

  resultByGoogleVision = async (req: Request, res: Response) => {
    const absolutePath = await search(req);
    const photoRecognitionResult = await photoRecognition(absolutePath);

    // console.log({ photoRecognitionResult });
    if (!photoRecognitionResult) {
      res
        .status(400)
        .json("The photo is not specific enough, please try another photo");
      return;
    }

    const countryName = await getCountryNamefromAddress(
      photoRecognitionResult.address
    );
    if (!countryName) {
      res.status(400).json({
        msg: "The photo is not specific enough, please try another photo",
      });
      return;
    }

    const nation_tag = await this.searchService.searchNationTagByPhoto(
      countryName
    );

    console.log("nation_tag", nation_tag);

    if (nation_tag.length === 0) {
      res
        .status(400)
        .json(
          `No related post for the country ${countryName}\n Landmark:${photoRecognitionResult.landMarkName}`
        );
      return;
    }

    console.log({
      landmark_address: photoRecognitionResult.address,
      country_name: nation_tag[0].tag_name,
      landMarkName: photoRecognitionResult.landMarkName,
    });
    res.status(200).json({
      landmark_address: photoRecognitionResult.address,
      country_name: nation_tag[0].tag_name,
      landMarkName: photoRecognitionResult.landMarkName,
    });
  };

  //==============================search by text input========

  displaySearchList = async (req: Request, res: Response) => {
    const { tag } = req.body;

    if (!tag) {
      res
        .status(200)
        .json({ message: "No search result.", hasSearchResult: false });
      return;
    }

    let tagList = [];

    try {
      let nationTag = await this.searchService.searchNationTagByWord(tag);
      let otherTag = await this.searchService.searchOtherTagByWord(tag);

      if (nationTag) {
        tagList = nationTag.map((i) => i.tag_name);
      }

      if (otherTag) {
        for (let i of otherTag) {
          if (tagList.includes(i.tag_name)) continue;
          tagList.push(i.tag_name);
        }
      }

      if (tagList.length > 0) {
        res.status(200).json({ tagList: tagList, hasSearchResult: true });
      } else {
        res
          .status(200)
          .json({ message: "No search result.", hasSearchResult: false });
      }
    } catch (err) {
      serverErr(err, res);
    }
  };
}
