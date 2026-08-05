import {Request, Response, NextFunction} from "express";
import { AppError } from "../errors/AppError";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";

export const errorLogger = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if(err instanceof PrismaClientKnownRequestError){
        if(err.code == "P2025"){
            return res.status(404).json({error: "Ressource not found"});
        }
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    if (err instanceof Error) {
        res.status(500).json({ message: 'Internal server error' });
        return;
    }

    res.status(500).json({ message: 'Unknown error' });
};