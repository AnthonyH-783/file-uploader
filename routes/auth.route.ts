import express from "express";
import * as authController from "../controllers/auth.controller";
import { validateSignup } from "../middleware/validation/signupValidation";
import { requireAuth } from "../middleware/authentication/requireAuth";
const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup", validateSignup(), authController.signup);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/login",authController.getLogin);
authRouter.get("/signup", authController.getSignup);


export default authRouter;
