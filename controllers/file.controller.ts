import upload from "../middleware/configMulter";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError";
import { uploadFile } from "../db/supabase";
import prisma from "../db/prisma";
import { randomUUID } from "node:crypto";
import { Folder } from "../generated/prisma/client";

const handleUpload = upload.array("uploaded_file");

export const saveFile = (req:Request, res:Response , next:NextFunction) => {
    // Defining error handling for failing to attach files to req
    handleUpload(req, res, (err:unknown) => {
 
        if(err instanceof multer.MulterError){
            if(err.code.match('415')){
                return res.redirect(`/main?error=${err.message}`);
            }
            const {message} = err;
            return next(new AppError(400, message, true));
        }
        if(err){
            return next(err);
        }
        next(); // Move to next middleware with req.files

    })
}

export const uploadToCloud = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Retrieving files and category from request object
        const files = (req.files ?? []) as Express.Multer.File[];
        const category: string = req.body.category;
        if (!files || files.length === 0) {
            throw new AppError(400, "No files were uploaded", true);
        }
        // Finding corresponding folder
        const userId = String(res.locals.currentUser.id);
        const folder = await prisma.folder.findFirst({
            where: {name: category, ownerId: String(userId)}
        });
        if(!folder){
            throw new AppError(500, "Selected folder does not exist", false);
        }

        // Creating array of storage objects
        const uploads = files.map((file) => {
            const id = randomUUID();
            return {
                file,
                record: {
                    name: file.filename,
                    mimeType: file.mimetype,
                    id,
                    ownerId: userId,
                    storageKey: `${userId}/${id}`,
                    size: file.size,
                    folderId: folder.id
                }
            }
        });

        // Storing files in database
        await prisma.file.createMany({data: uploads.map((upload) => upload.record)});

        // Uploading files to supabase storage
        await Promise.all(uploads.map(async({file, record}) => {
            await uploadFile(file, record.storageKey)}
        ));
      


       res.redirect("/main");
    } catch (err) {
    
        next(err);
    }
};
