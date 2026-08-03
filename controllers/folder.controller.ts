import { Request, Response, NextFunction } from "express"
import { randomUUID } from "node:crypto";
import prisma from "../db/prisma";
import { AppError } from "../errors/AppError";
import { Prisma } from "../generated/prisma/client";

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
            return res.redirect(`folders/create?error=${encodeURIComponent(`
                Folder ${req.body.name} already exists `)}`);
        }
        next(err);
    }
}