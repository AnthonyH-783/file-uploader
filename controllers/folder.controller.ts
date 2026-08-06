import { Request, Response, NextFunction } from "express"
import { randomUUID } from "node:crypto";
import prisma from "../db/prisma";
import { AppError } from "../errors/AppError";
import { Folder, Prisma } from "../generated/prisma/client";
import { error } from "node:console";

export const createFolder = async (req:Request, res:Response, next:NextFunction) => {
    try{
        // Extracting request data 
        const {name} = req.body;
        const parentId = req.body.parentId || null;
        const ownerId = res.locals.currentUser.id;
        // Validating user
        if(!ownerId){
            throw new AppError(500, "User not signed in");
        }
        // Validating parent folder
        if(parentId){
            const parent = prisma.folder.findFirst({where: {id:parentId, ownerId}});
            if(!parent){
                throw new AppError(404, "Parent Not found");
            }
        }
        // Creating folder and re-directing to its view
        const folder = await prisma.folder.create({data: {name, ownerId, parentId}});
        return res.redirect(`folders/${folder.id}`);

    }
    catch(err){
        if(err instanceof Prisma.PrismaClientKnownRequestError && err.code == "P2002"){
            // Error in case folder already exists
            return res.redirect(`folders/create?error=${encodeURIComponent(`
                Folder ${req.body.name} already exists `)}`);
        }
        next(err);
    }
}

export const viewFolder = async(req:Request, res:Response, next:NextFunction) => {
    try{
        // Extracting identifying info
        const ownerId = res.locals.currentUser.id;
        const {folderId} = req.params ?? null;
        // Destructuring query params with default 
        const {sort = "name", dir = "asc"} = req.query;
        // Sorting object parameter used by prisma
        const orderBy = {[sort as string] : dir as "asc" | "desc"};

        // Getting folder
        let folder = null;
        if(folderId){
            folder = await prisma.folder.findFirst({
                where: {ownerId, id: folderId as string}
            });
            if(!folder) throw new AppError(404, "Folder not found");
        }
        const [childFolders, files] = await Promise.all([
            prisma.folder.findMany({
                where:{ownerId, parentId: folderId as string},
                orderBy
            }),
            prisma.file.findMany({
                where:{ownerId, parentId: folderId as string},
                orderBy
            })

        ]);
        res.render("components/folder", {
            folder, childFolders, files, error: req.query.error ?? null
        });
        

    }
    catch(err){
        next(err);
    }
}


export const renameFolder = async (req:Request, res:Response, next:NextFunction) => {
    try{
    // Identifying owner
    const ownerId = res.locals.currentUser.id;
    // Getting request information
    const {folderId} = req.params;
    const {newName} = req.body;
    // Finding and validating folder
    if(!folderId || typeof folderId !== "string" || !ownerId) throw new AppError(403, "Target folder could not be identified");
    await prisma.folder.update({
        where: {id: folderId, ownerId},
        data: {name: newName}
        
    }); // throws P2025 prisma error when not found
    res.redirect(`/folders/${folderId}?msg=${encodeURIComponent("Folder Successfully Renamed")}`);
    }
    catch(err){
        next(err);

    }
}

export const moveFolder = async (req:Request, res:Response, next:NextFunction) => {
    try{
        // Identifying owner
        const ownerId = res.locals.currentUser.id;
        // Extracting request info
        const {folderId} = req.params;
        const {targetDirId} = req.body;
        if(typeof folderId !== "string" || typeof targetDirId !== "string"){
            throw new AppError(403,"Some folder(s) could not be identified");
        }
        if(folderId === targetDirId){
            throw new AppError(400, "Cannot move folder into itelsef");
        }
        // Finding and validating folders
        const [folder, targetDir] = await Promise.all([
            prisma.folder.findUniqueOrThrow({where: {id: folderId, ownerId}}),
            prisma.folder.findUniqueOrThrow({where: {id: targetDirId, ownerId}})
        ]); // Throws P2025 if not found
        if(!folder || !targetDir) throw new AppError(403, "Folders not found");

        // Checking for cycles and throwing error is one found
        await checkCycle({targetDirId, folderId, ownerId});

        // Changing parent id to point to the new directory
        await prisma.folder.update({
                where: {id: folderId, ownerId},
                data: {parentId: targetDirId}
            })
        const queryString = new URLSearchParams({
            msg: `${folder.name} moved to ${targetDir.name}`
        }); 
        res.redirect(`/folders/${folder.parentId}?${queryString}`);
    
    }
    catch(err){
        next(err);
    }
}

async function checkCycle({targetDirId, folderId, ownerId} : {targetDirId:string, folderId:string, ownerId:string}){
    let cursor: string | null = targetDirId;
    while(cursor){
        if(cursor === folderId){
            throw new AppError(400, "Cannot move folder into itself or its subfolders");
        }
        const parent: {parentId: string | null} | null = await prisma.folder.findUnique({
            where: {id: cursor, ownerId},
            select: {parentId: true}
        });
        if(!parent){cursor = null} else cursor = parent.parentId;
    }
}