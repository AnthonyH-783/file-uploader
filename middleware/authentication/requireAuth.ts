import {Request, Response, NextFunction} from "express";

export const requireAuth = (req:Request, res:Response, next:NextFunction) => {
    if(!req.isAuthenticated()){
        return res.redirect("/auth/login");
    }
    console.log(res.locals.currentUser);
    next();
}