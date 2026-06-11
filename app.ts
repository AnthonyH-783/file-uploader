import express from "express";
import path from "node:path";
import router from "./routes/index.route";
const app = express();

// Setting up view engine
const __dirname = import.meta.dirname; // directory path
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use(router);

// Listening to port
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})