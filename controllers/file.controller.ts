import upload from "../middleware/configMulter";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError";
import { deleteFilesFromStorage, uploadFile } from "../db/supabase";
import prisma from "../db/prisma";
import { randomUUID } from "node:crypto";
import { Folder } from "../generated/prisma/client";
import { URLSearchParams } from "node:url";

const handleUpload = upload.array("uploaded_file");

export const multerErrHandling = (req:Request, res:Response , next:NextFunction) => {
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

export const saveFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Retrieving request info - files, category, user
        const files = (req.files ?? []) as Express.Multer.File[];
        const category: string = req.body.category;
        console.log(category);
        if (!files || files.length === 0) {
            throw new AppError(400, "No files were uploaded", true);
        }
        const userId = res.locals.currentUser.id;

        // Finding target folder
        const folder = await prisma.folder.findFirst({
            where: {name: category, ownerId: userId}
        });
        if(!folder){
            throw new AppError(404, "Selected folder does not exist", false);
        }

        // Creating array of storage objects
        const uploads = prepareFilesForUpload(files, folder.id, userId);

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

function prepareFilesForUpload(files: Express.Multer.File[], folderId:string, userId:string){
    
    return files.map((file) => {
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
                folderId
            }
        }
    })
}

export const renameFile = async(req:Request, res: Response, next: NextFunction) => {
    try{
        // Extracting request info
        const {fileId} = req.params;
        const {newName, parentId} = req.body;
        const ownerId = res.locals.currentUser.id;
        // Validating parameters
        if(typeof fileId !== "string" || typeof newName !== "string" || typeof parentId !== "string") throw new AppError(400, "Invalid parameters given for renaming file");
        const title = newName.trim();
        if(title.length > 50){
            return res.redirect(`/folders/${parentId}?error=${encodeURIComponent("File name cannot exceed 50 characters")}`);
            
        }
        // Updating file info
        const file = await prisma.file.update({
            where: {id: fileId, ownerId},
            data: {name: title}
        });
        res.status(200).redirect(`/folders/${file.folderId}`);
    }
    catch(err){
        next(err);
    }

}

export const deleteFile = async(req:Request, res:Response, next:NextFunction) => {
    try{
        const {fileId} = req.params;
        const ownerId = res.locals.currentUser.id;
        if(typeof fileId !== "string") throw new AppError(400, "Invalid file id procured");
        // Retrieving storage key
        const {storageKey, folderId, name} = await prisma.file.delete({
            where: {id: fileId, ownerId},
            select: {storageKey: true, folderId: true, name:true}
        });
        // Deleting file in storage
        try{
             await deleteFilesFromStorage([storageKey]);
        }
        catch(err){
            console.error("Storage delete failed", {ownerId, message: (err as Error).message});
        }
        const query = new URLSearchParams({msg: `${name} deleted`});
        res.redirect(`/folders/${folderId}?${query}`);
       

    }
    catch(err){
        next(err);

    }
}
