import {Request, Response, NextFunction} from "express";

export const requireAuth = (req:Request, res:Response, next:NextFunction) => {
    if(req.isUnauthenticated()){
        return res.redirect("/auth/login");
    }
    next();
}