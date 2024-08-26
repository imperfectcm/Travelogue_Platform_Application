import { AuthService } from "../services/AuthService";
import AuthController from "./AuthController";
import { createRequest, createResponse } from "../utils/reqAndRes";
import { Request, Response } from "express";
import { Knex } from "knex";
import { testEmail } from "../utils/sendVerificationMail";

jest.mock('../utils/sendVerificationMail', () => ({
    testEmail: jest.fn()
}));

describe("AuthController", () => {
    let authController: AuthController;
    let authService: AuthService;
    let req: Request;
    let res: Response;

    beforeEach(() => {
        authService = new AuthService({} as Knex);
        authController = new AuthController(authService);

        authService.checkUserDuplicate = jest.fn(async () => [{ username: "iu", email: "iu@gmail.com", password: 1234 }]);
        authService.createNewUser = jest.fn(async () => [{ id: 1 }]);

        req = createRequest()
        res = createResponse()
        req.session.userId = 1
    })


    it("should failed to register", async () => {
        req.body = { username: "iu", email: "iu@gmail.com", password: 1234 }

        // step 2: call the method
        await authController.register(req, res);

        // Step 3: expectation
        expect(authService.checkUserDuplicate).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ message: "User with this email already exists" });
    });


    it("should register successful", async () => {
        authService.checkUserDuplicate = jest.fn(async () => { });

        req.body = { username: "karina", email: "karina@gmail.com", password: 1234 }
        // let emailtoken = 4321;
        // let status = "pending";
        // let blog_image = "abc.jpg";
        // let profile_pic = "def.png";

        // step 2: call the method
        await authController.register(req, res);

        // Step 3: expectation
        expect(authService.checkUserDuplicate).toHaveBeenCalledTimes(1);
        expect(authService.createNewUser).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ "newUser": [{ "id": 1 }] });
    });


})