import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";
export const getIndex = async (req: Request, res: Response, next: NextFunction) => {
    // Retrieving user and folder info
    const ownerId = res.locals.currentUser.id;
    const tab = req.baseUrl.slice(1);
    const folders = await prisma.folder.findMany({
        where: {ownerId},
        
    });
    const categories = folders.map((folder) => folder.name)
    res.render("index", {selected: tab, categories, folders});
}