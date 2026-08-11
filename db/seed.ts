import { randomUUID } from "node:crypto";
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
    await prisma.$transaction([ // using transaction for potentially multiple steps
        prisma.folder.create({
            data: {name: "uncategorized", ownerId: userId}
        })
    ]);

    return true;
}