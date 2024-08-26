import express, { Router, Request, Response } from "express";
import { knex } from "../utils/knex";
import { SearchService } from "../services/SearchService";
import SearchController from "../controllers/SearchController";

export const searchRouter = Router();
searchRouter.use(express.json());
searchRouter.use(express.urlencoded({ extended: true }));

const searchService = new SearchService(knex);
const searchController = new SearchController(searchService);

// googleVisionRouter.post("/", (req: Request, res: Response) => {
//   res.status(200).send("testing google vision api");
// });

searchRouter.post("/googleVision", searchController.resultByGoogleVision);
// searchRouter.post("/text", searchController.resultByText);
searchRouter.post("/search", searchController.displaySearchList);
