
import prisma from "./prisma";
import {Request, Response, NextFunction } from "express";

export async function seedIfNeeded(userId:string){
    // Conditional update upon firt login
    const claimed = await prisma.user.updateMany({
        where: {id: userId,  seededAt: null},
        data: {seededAt: new Date()}
    });
    if(claimed.count === 0){
        return false;
    }
    await prisma.folder.create({
        data: {ownerId: userId, name: "Root Folder"}
    });
    return true;
}