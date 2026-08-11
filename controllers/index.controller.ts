import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";
export const getIndex = async (req: Request, res: Response, next: NextFunction) => {
    // Retrieving user and folder info
    const ownerId = res.locals.currentUser.id;
    const folders = await prisma.folder.findMany({
        where: {ownerId},
        select: {name: true}
    });
    const categories = folders.map((folder) => folder.name)
    res.render("index", {categories});
}