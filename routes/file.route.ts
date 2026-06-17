import express, {Request, Response} from "express";
import path from "node:path";
import fs from "node:fs";
import upload from "../middleware/configMulter";
import * as FileController from "../controllers/file.controller";

// Setting up the upload middleware
    
const fileRouter = express.Router();

fileRouter.post("/upload", FileController.saveFile);

export default fileRouter;