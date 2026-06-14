import passport from "passport";
import LocalStrategy from "passport-local";
import { verifyDone } from "../../types/types";
import { PrismaClient } from "../../generated/prisma/client";

const verifyCallback = async (email:string, password:string , done: verifyDone) => {

    try{

    }
    catch(err){
        return done(err);
    }

}

const strategy = new LocalStrategy.Strategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user: Express.User, done: verifyDone) => {
    return done(user.id);
});

passport.deserializeUser(async(id: number, done:verifyDone) => {
    try{

    }
    catch(err){

    }

});

export default passport;