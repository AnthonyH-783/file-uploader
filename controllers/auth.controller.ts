import {Request, Response, NextFunction} from "express";
import prisma from "../db/prisma";
import bcrypt from "bcrypt";
import passport from "passport";
import { AppError } from "../errors/AppError";
import { seedIfNeeded } from "../db/seed";
import { validationResult, matchedData } from "express-validator";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";
/** 
export const login = passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login",
    failureMessage: true
});
*/
export const login = async(req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: unknown, user: Express.User) => {
        if(err) return next(err);
        if(!user){
            const errMsg = 'Wrong email or password';
            req.session.formErrors = [errMsg];
            return req.session.save(() => res.redirect("/auth/login"));
        }

        req.login(user, async(loginErr) => {
            if(loginErr) return next(loginErr);
            await seedIfNeeded(user.id);
            res.redirect("/main");
        })

    })(req, res, next);
}

export const logout = (req:Request, res:Response, next:NextFunction) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        res.redirect("/auth/login");
    });
}

export const signup = async (req:Request, res:Response, next:NextFunction) => {
    try{
        console.log("Entered signup handler");
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            // Saving re-direction data in session
            const {firstName, lastName, email} = req.body;
            req.session.formData = {firstName, lastName, email};
            req.session.formErrors = errors.array().map((error) => error.msg);
            return req.session.save(() => res.redirect("/auth/signup"));
        }
        console.log("Finsihed validation");
        const {firstName, lastName, email, password} = matchedData(req);
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash
            }
        });
        console.log("About to redirect");
        return res.redirect("/auth/login");
    }
    catch(err){
        if(err instanceof PrismaClientKnownRequestError && err.code === "P2002"){
            const {firstName, lastName, email} = req.body;
            req.session.formData = {firstName, lastName, email};
            req.session.formErrors = ['Email already in use'];
            return req.session.save(() => res.redirect("/auth/signup"));
        }
        return next(err);
    }

}

export const getLogin = (req: Request, res: Response, next: NextFunction) => {
    if(req.isAuthenticated()){
        return res.redirect("/main");
    }
    return res.render("pages/sign-in");
}

export const getSignup = (req:Request, res:Response, next:NextFunction) => {
    if(req.isAuthenticated()){
        return res.redirect("/main");
    }
    return res.render("pages/sign-up");
}