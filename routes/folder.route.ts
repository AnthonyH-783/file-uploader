import { Router } from "express";
import * as folderController from "../controllers/folder.controller";
import { validateFolderUpdate } from "../middleware/validation/folderValidation";
import { requireAuth } from "../middleware/authentication/requireAuth";
import { requireFolderOwner } from "../middleware/authorization";

const folderRouter = Router();
// Authentication and authorization
folderRouter.use(requireAuth);
folderRouter.param("folderId", requireFolderOwner);
// Routes
folderRouter.post("/new", folderController.createFolder);
folderRouter.get("/new", folderController.getFolderCreationForm);
folderRouter.get("/", requireFolderOwner,  folderController.viewFolder);
folderRouter.get("/:folderId", folderController.viewFolder);
folderRouter.get("/:folderId/edit", folderController.getFolderEditForm);
folderRouter.post("/:folderId/edit", ...validateFolderUpdate(), folderController.moveFolder, folderController.renameFolder);
folderRouter.get("/:folderId/delete", folderController.getFolderDeletionForm);
folderRouter.post("/:folderId/delete", folderController.deleteFolder);




export default folderRouter;