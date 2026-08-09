import passport from "passport";
import LocalStrategy from "passport-local";
import { verifyDone } from "../../types/types";
import prisma from "../../db/prisma";
import bcrypt from "bcrypt";

const customFields = {
    usernameField: "email",
    passwordField: "password"
}
const verifyCallback = async (email:string, password:string , done: verifyDone) => {

    try{
        const user = await prisma.user.findUnique({
            where: {email: `${email}`}
        });
        if(!user){
            return done(null, false, {message: "Wrong email or password"});
        }
        const passwordHash = user.passwordHash;
        const match = await bcrypt.compare(password, passwordHash);
        if(!match){
            return done(null, false, {message: "Wrong email or password"});
        }
        return done(null, user);
        

    }
    catch(err){
        return done(err);
    }

}

const strategy = new LocalStrategy.Strategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user: Express.User, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async(id: string, done:verifyDone) => {
    try{
        if(typeof id === "number"){return done(null, false)};

        const user = await prisma.user.findUnique({
            where: {id: String(id)}
        });
        return done(null, user as Express.User);

    }
    catch(err){
        return done(err);

    }

});

export default passport;