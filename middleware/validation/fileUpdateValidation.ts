import { ValidationChain } from "express-validator";
import { body } from "express-validator";
const emptyErr = "Name cannot be left blank";
const MAX_NAME_LENGTH:number = 50;
const lengthErr = (MAX_NAME_LENGTH:number) => `Name can be at most ${MAX_NAME_LENGTH} chars long`;

export const validateFileUpdate = () : ValidationChain[] => {
    return [
        body("name").trim().notEmpty().withMessage(emptyErr)
        .isLength({max: MAX_NAME_LENGTH}).withMessage(lengthErr(MAX_NAME_LENGTH)),
        body("folderId").trim().notEmpty().withMessage("Parent Folder not provided")
    ]
}