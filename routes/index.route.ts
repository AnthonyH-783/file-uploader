import express from "express";
const router = express.Router();

router.get("/", (req, res) => res.render("index", {
    title: "Upload form",
    categories: ["uncategorized"]
}));

export default router;