import express from "express";
import * as authController from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.get("/logout", authController.logout);
authRouter.get("/sign-in",authController.getLogin);


export default authRouter;
