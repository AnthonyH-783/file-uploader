import express, {Request, Response} from "express";
import path from "node:path";
import fs from "node:fs";
import upload from "../middleware/configMulter";
import * as fileController from "../controllers/file.controller";
import { validateFileUpdate } from "../middleware/validation/fileUpdateValidation";
import { requireAuth } from "../middleware/authentication/requireAuth";
import { requireFileOwner } from "../middleware/authorization";

// Setting up the upload middleware
    
const fileRouter = express.Router();
// Authentication and Authorization middleware
fileRouter.use(requireAuth);
fileRouter.param("fileId", requireFileOwner);

fileRouter.post("/upload", fileController.multerErrHandling, fileController.saveFile);
fileRouter.get("/:fileId", fileController.showFile);
fileRouter.get("/:fileId/edit", fileController.getFileEditForm);
fileRouter.post("/:fileId/edit", ...validateFileUpdate(), fileController.updateFile);
fileRouter.get("/:fileId/delete", fileController.getFileDeleteForm);
fileRouter.post("/:fileId/delete", fileController.deleteFile);

export default fileRouter;