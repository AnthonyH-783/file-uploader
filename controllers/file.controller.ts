import upload from "../middleware/configMulter";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError";
import { uploadFile } from "../db/supabase";
import prisma from "../db/prisma";

const handleUpload = upload.array("uploaded_file");

export const saveFile = (req:Request, res:Response , next:NextFunction) => {
    // Invoking middleware
    handleUpload(req, res, (err:unknown) => {
        if(err instanceof multer.MulterError){
            const {message} = err;
            return next(new AppError(400, message, true));
        }
        if(err){
            return next(err);
        }
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

        const data = await Promise.all(
            files.map(async (file) => {
                const url = await uploadFile(file, category);
                return { title: file.filename, link: url };
            })
        );

        await prisma.upload.createMany({
            data: data.map(({ title, link }) => ({
                title,
                link,
                userId: res.locals.currentUser.id,
            })),
        });

        res.redirect("/main");
    } catch (err) {
        next(err);
    }
};
