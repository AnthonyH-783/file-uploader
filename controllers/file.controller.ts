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
    // Invoking middleware
    handleUpload(req, res, (err:unknown) => {
        console.log("In handleUpload");
        if(err instanceof multer.MulterError){
            console.log("in multer error");
            if(err.code.match('415')){
                return res.redirect(`/main?error=${err.message}`);
            }
            const {message} = err;
            return next(new AppError(400, message, true));
        }
        if(err){
            console.log("In saveFile error handler");
            return next(err);
        }
        console.log("At the end of handleupload");
        next();

    })
}

export const uploadToCloud = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.Multer.File[];
        const category: string = req.body.category;

        if (!files || files.length === 0) {
            throw new AppError(400, "No files were uploaded", true);
        }
        // Constructing needed variable
        const userId = String(res.locals.currentUser.id);
        console.log(`Here is the category: ${category} and the user id: ${userId}`)
        const folder = await prisma.folder.findFirst({
            where: {name: category, ownerId: String(userId)}
        });

        if(!folder){
            throw new AppError(500, "Selected folder does not exist", false);
        }
        // Creating array of storage objects
        const data = files.map((file) => {
            const fileId = randomUUID();
            return {
                file,
                name: file.filename,
                mimeType: file.mimetype,
                id: fileId,
                ownerId: userId,
                storageKey: `${userId}/${fileId}`,
                size: file.size,
                folderId: folder.id
            }
        });

        // Storing files in database
        await prisma.file.createManyAndReturn({
            data: data.map((fileData) => ({
                name: fileData.name,
                id: fileData.id,
                ownerId: fileData.ownerId,
                storageKey: fileData.storageKey,
                size: fileData.size,
                folderId: fileData.folderId,
                mimeType: fileData.mimeType
            }))
        })

        // Uploading files to supabase storage
        await Promise.all(
            data.map(async (fileData) => {
                await uploadFile(fileData.file, fileData.storageKey);
                return;
            })
        );


        res.redirect("/main");
    } catch (err) {
    
        next(err);
    }
};
