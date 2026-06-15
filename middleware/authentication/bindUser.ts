import { Request, Response, NextFunction } from "express"

const bindUser = (req: Request, res: Response, next: NextFunction) => {
    if(req.isAuthenticated()){
        res.locals.currentUser = req.user;
    }
    next();
}
export default bindUser;