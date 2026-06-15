import {Request, Response, NextFunction} from "express";
import prisma from "../db/prisma";
import bcrypt from "bcrypt";
import passport from "passport";
import { AppError } from "../errors/AppError";

export const login = passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login",
    failureMessage: true
});

export const logout = (req:Request, res:Response, next:NextFunction) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        res.redirect("/login");
    });
}

export const signup = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const {firstName, lastName, email, password} = req.body;
        console.log("In signup controller");
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash
            }
        });
        return res.json(user);
        // Replace later with res.redirect("/main");
    }
    catch(err){
        console.error(err);
        const error = new AppError(500, "Error at signup controller");
        return next(error);

    }


}