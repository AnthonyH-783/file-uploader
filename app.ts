import express from "express";
import "dotenv/config";
import path from "node:path";
import router from "./routes/index.route";
import configuredSession from "./middleware/authentication/session";
import passport from "./middleware/authentication/passport";
import bindUser from "./middleware/authentication/bindUser";
import { errorLogger } from "./middleware/errorLogger";
import authRouter from "./routes/auth.route";
import fileRouter from "./routes/file.route";
import { Request, Response, NextFunction } from "express";

const app = express();

// Setting up view engine
const __dirname = import.meta.dirname; // directory path
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// Setting up user session
app.use(configuredSession);
app.use(passport.session());
app.use(bindUser);
app.use((req:Request, res: Response, next:NextFunction) => {
    if(res.locals.currentUser){
        console.log(res.locals.currentUser.id);

    }
    
    next();
})


// Routes
app.get("/", (req: Request, res: Response) => res.redirect("/main"));
app.use("/main", router);
app.use("/auth", authRouter);
app.use("/files", fileRouter);


// Error logger
app.use(errorLogger);

// Listening to port
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})