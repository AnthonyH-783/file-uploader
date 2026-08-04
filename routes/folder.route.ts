import { Router } from "express";
import * as folderController from "../controllers/folder.controller";

const folderRouter = Router();

folderRouter.post("/create", folderController.createFolder);
folderRouter.get("/:folderId", folderController.viewFolder);



export default folderRouter;