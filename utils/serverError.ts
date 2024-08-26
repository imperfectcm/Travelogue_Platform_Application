import { Response } from "express";

export function serverErr(err: any, res: Response) {
    console.log(err);
    res.status(500).send(err);
    return;
}