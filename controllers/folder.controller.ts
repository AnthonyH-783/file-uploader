import { Request, Response, NextFunction } from "express"
import { randomUUID } from "node:crypto";
import prisma from "../db/prisma";
import { AppError } from "../errors/AppError";
import {File, Folder, Prisma } from "../generated/prisma/client";
import { error } from "node:console";
import { deleteFilesFromStorage } from "../db/supabase";
import { URLSearchParams } from "node:url";
import { format } from "date-fns";

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
        const folderId = req.params.folderId ?? null;
        // Destructuring query params with default 
        const {sort = "name", dir = "asc"} = req.query;
        const page   = Math.max(1, Number(req.query.page) || 1);
        const limit  = Math.min(20, Math.max(1, Number(req.query.limit) || 20));
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
    
        const [folders, files] = await Promise.all([
            prisma.folder.findMany({
                where: {ownerId, parentId: folderId as string},
                orderBy,
                take: limit as number, 
                skip: ((page as number) - 1) * (limit as number)
            }),
            prisma.file.findMany({
                where: {ownerId, folderId: folderId as string},
                orderBy,
                take: limit as number,
                skip: ((page as number) - 1) * (limit as number)
            })
        ]);
        const formatedDates = formatLastUpdated([...folders, ...files]);

        res.render("index", {
            selected: "folders", folder, folders, files, page,
            formatedDates, error: req.query.error ?? null
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
        if((!folderId || typeof folderId !== "string") ||
           (!targetDirId || typeof targetDirId !== "string")){
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

export const deleteFolder = async(req:Request, res:Response, next: NextFunction) => {
    try{
        // Extracting and validating request info
        const {folderId} = req.params;
        const ownerId = res.locals.currentUser.id;
        if(typeof folderId !== "string") throw new AppError(400, "Folder to be deleted could not be identified");

        // Checking folder exists
        const folder = await prisma.folder.findUnique({
            where: {id: folderId, ownerId},
        });
        if(!folder) throw new AppError(404, "Folder to be deleted could not be found");

        // Collecting storage keys of all files under folder
        const storageKeys = await collectStorageKeys(folderId, ownerId);
        
        // Deleting database entries first
        await prisma.folder.delete({
            where: {id: folderId, ownerId} // folder delete cascades to all files
        });
        // Deleting files from storage
        try{
            await deleteFilesFromStorage(storageKeys);
        }
        catch(err){
            console.error("Storage cleanup failed after folder delete:", {folderId, err});
        }
        const queryString = new URLSearchParams({msg: `${folder.name} deleted`});
        res.redirect(`/folders/${folder.parentId ?? ''}?${queryString}`);

    }
    catch(err){
        next(err);
    }

}

async function collectStorageKeys(rootFolderId:string, ownerId:string){
    // Initializing key storage and level counter
    const keys: string[] = [];
    let level = [rootFolderId];

    while(level.length > 0){
        const [files, children] = await Promise.all([
            prisma.file.findMany({
                where: {folderId: {in: level}, ownerId},
                select: {storageKey: true}
            }),
            prisma.folder.findMany({
                where: {parentId: {in: level}, ownerId},
                select: {id: true}
            })
        ]);
        // Pushing the storage keys of the files at the current level
        keys.push(...files.map((file) => file.storageKey));
        // Extracting next set of folder ids (next level)
        level = children.map((child) => child.id);
    }
    return keys;
}
async function collectDescendantIds(rootFolderId:string, ownerId:string){
    // Initializing id and level arrays
    const idList: string[] = [];
    let level = [rootFolderId];

    while(level.length > 0){
        const children = await prisma.folder.findMany({
            where: {parentId : {in:level}},
            select: {id: true}
        });
        const childrenIds = children.map((child) => child.id);
        idList.push(...childrenIds);
        level = childrenIds;
    }
    return idList;
}

function formatLastUpdated(objs: { id: string; updatedAt: Date }[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const obj of objs) {
    formatted[obj.id] = format(obj.updatedAt, "MMM d, y");
  }
  return formatted;
}

export const getFolderEditForm = async(req:Request, res:Response) => {
    // Extracting user and folder ids
    const {folderId} = req.params;
    const userId = res.locals.currentUser.id;
    if(typeof folderId !== 'string' || typeof userId !== 'string') throw new AppError(401, "Folder could not be idnetified");
    // Extracting folder name and current category

    const folder = await prisma.folder.findUniqueOrThrow({
        where: {ownerId: userId, id: folderId},
        select: {name: true, parent:
                             {select: {id: true, name: true}}
            }
    });
    const currentCategory = folder.parent ?? null;
    // Choosing valid categories to move to
    const descendants = await collectDescendantIds(folderId, userId);
    const categories = await prisma.folder.findMany({
        where: {ownerId: userId, id: {notIn: [folderId, ...descendants]}},
        select: {name: true, id: true}
    });
    
    res.render("pages/edit-form", {
        docId: folderId,
        docType: "folder",
        docName: folder.name,
        categories,
        currentCategory
    })
}