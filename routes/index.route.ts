import express from "express";
import { requireAuth } from "../middleware/authentication/requireAuth";
const router = express.Router();

router.get("/", (req, res) => res.render("index", {
    title: "Upload form",
    categories: ["uncategorized"]
}));



router.get("/main", requireAuth, (req, res) => res.render("index"));

export default router;