import {Request, Response, NextFunction} from "express";

export const copyResetFormData = (req:Request, res:Response, next:NextFunction) => {
    // Copying session data to locals
    res.locals.formData = req.session.formData ?? {};
    res.locals.formErrors = req.session.formErrors ?? [];
    // Clearing session data
    delete req.session.formData;
    delete req.session.formErrors;
    next();
}