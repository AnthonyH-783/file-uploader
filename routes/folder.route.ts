import { Router } from "express";
import * as folderController from "../controllers/folder.controller";

const folderRouter = Router();
folderRouter.post("/create", folderController.createFolder);
folderRouter.get("/", folderController.viewFolder);
folderRouter.get("/:folderId", folderController.viewFolder);
folderRouter.get("/:folderId/edit", folderController.getFolderEditForm);



export default folderRouter;