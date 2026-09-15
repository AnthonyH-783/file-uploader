import { Router } from "express";
import * as folderController from "../controllers/folder.controller";
import { validateFolderUpdate } from "../middleware/validation/folderValidation";

const folderRouter = Router();
folderRouter.post("/new", folderController.createFolder);
folderRouter.get("/new", folderController.getFolderCreationForm);
folderRouter.get("/", folderController.viewFolder);
folderRouter.get("/:folderId", folderController.viewFolder);
folderRouter.get("/:folderId/edit", folderController.getFolderEditForm);
folderRouter.post("/:folderId/edit", ...validateFolderUpdate(), folderController.moveFolder, folderController.renameFolder);
folderRouter.get("/:folderId/delete", folderController.getFolderDeletionForm);
folderRouter.post("/:folderId/delete", folderController.deleteFolder);




export default folderRouter;