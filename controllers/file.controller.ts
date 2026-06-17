import upload from "../middleware/configMulter";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError";

const handleUpload = upload.array("uploaded_file");

export const saveFile = (req:Request, res:Response , next:NextFunction) => {
    // Invoking middleware
    handleUpload(req, res, (err:unknown) => {
        if(err instanceof multer.MulterError){
            const {message} = err;
            return next(new AppError(400, message, true));
        }
        if(err){
            return next(err);
        }

        next();
    })
}

export const uploadToCloud = (req:Request, res:Response, next:NextFunction) => {
    const {body, files} = req;
    res.status(200).json({
        body,
        files
    })
}

