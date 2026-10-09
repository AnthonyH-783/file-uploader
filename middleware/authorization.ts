import {Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";
import { AppError } from "../errors/AppError";

export const requireFileOwner = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {fileId} = req.params;
        if(typeof fileId !== 'string') throw new AppError(400, "Malformed file id");
        const file = await prisma.file.findUnique({
            where: {id: fileId}
        });
        // If file doesn't exist
        if(!file){
            throw new AppError(404, "File not found");
        }
        // Unauthorized access (internal log)
        if(file.ownerId !== req.user!.id){
            console.warn(`User ${req.user!.id} attempted to access file ${fileId} owned by ${file.ownerId}`);
            throw new AppError(404, "File not found");
        }
        next();

    }
    catch(err){
        next(err);
    }
}

export const requireFolderOwner = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let folderId = req.params.folderId;
        if(typeof folderId !== 'string'){
            folderId = "0"; // Root folder by default
        }
        const folder = await prisma.folder.findUnique({
            where: {id: folderId}
        });
        // If file doesn't exist
        if(!folder){
            throw new AppError(404, "Folder  not found");
        }
        // Unauthorized access (internal log)
        if(folder.ownerId !== req.user!.id){
            console.warn(`User ${req.user!.id} attempted to access file ${folderId} owned by ${folder.ownerId}`);
            throw new AppError(404, "Folder  not found");
        }
        next();

    }
    catch(err){
        next(err);
    }
}