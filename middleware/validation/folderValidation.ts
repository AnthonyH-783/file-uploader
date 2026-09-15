import { body, ValidationChain, Meta} from "express-validator";
import prisma from "../../db/prisma";
import { AppError } from "../../errors/AppError";
import { authedRequest } from "../../types/types";

export const validateFolderUpdate = (): ValidationChain[] => [
    body("name").trim().notEmpty().withMessage("Folder should have a name")
    .isLength({max: 50}).withMessage("Folder name can't be longer than 50 chars"),
    body("targetFolderId")
    .isUUID()
    .custom(checkFolderExists)
    .withMessage("Target directory is invalid")
];

const checkFolderExists = async (targetFolderId:string, meta: Meta) => {
    const req = meta.req as authedRequest;
    const ownerId = req.user.id;
    await prisma.folder.findUniqueOrThrow({
        where: {ownerId, id: targetFolderId}
    });
    return true;
    
}