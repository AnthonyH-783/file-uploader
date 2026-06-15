import {Request, Response, NextFunction} from "express";
import { AppError } from "../errors/AppError";

export const errorLogger = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
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