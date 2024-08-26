import { Knex } from "knex";
import { Request, Response } from "express";
import SearchController from "./SearchController";
import { SearchService } from "../services/SearchService";
import { createRequest, createResponse } from "../utils/reqAndRes";
import * as image_blog_formidable from "../utils/image_blog_formidable";
import fs from "fs/promises";
import * as SearchFun from "../utils/countryNameSearch";

let searchController: SearchController;
let searchService: SearchService;

let req: Request;
let res: Response;

// let resolveObj = {
//   image: "test_post_content.jpg",
// };

// jest.spyOn(upload, "parseForm").mockResolvedValue(resolveObj);

beforeEach(() => {
  searchService = new SearchService({} as Knex);
  fs.unlink = jest.fn();
  req = createRequest() as Request;
  res = createResponse() as Response;
  searchController = new SearchController(searchService);

  // searchService.searchNationTagByPhoto = jest.fn(async () => [
  //   { id: 1, tag_name: "Japan" },
  // ]);
});

// describe.only("SearchController", () => {
//   it.only("should not get post 1", async () => {
//     jest.spyOn(image_blog_formidable, "search").mockResolvedValue("image_path");
//     jest.spyOn(SearchFun, "photoRecognition").mockResolvedValue(null);

//     await searchController.resultByGoogleVision(req, res);
//     // expect(searchService.searchNationTagByPhoto).toHaveBeenCalledTimes(1);
//     expect(res.json).toHaveBeenCalledWith({
//       msg: "The photo is not specific enough, please try another photo",
//     });
//   });
// });

describe.only("SearchController", () => {
  it.only("should get post", async () => {
    jest
      .spyOn(image_blog_formidable, "search")
      .mockResolvedValue("images/image_search/af82c8f388257e8640d875100.jpg");
    jest.spyOn(SearchFun, "photoRecognition").mockResolvedValue({
      address: "address",
      landMarkName: "landMarkName",
    });
    jest
      .spyOn(SearchFun, "getCountryNamefromAddress")
      .mockResolvedValue("countryName");
    searchService.searchNationTagByPhoto = jest.fn(async () => [
      {
        tag_name: "james",
      },
      {
        tag_name: 2,
      },
    ]);
    await searchController.resultByGoogleVision(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    // expect(searchService.searchNationTagByPhoto).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      landmark_address: "address",
      country_name: "james",
      landMarkName: "landMarkName",
    });
  });
});
