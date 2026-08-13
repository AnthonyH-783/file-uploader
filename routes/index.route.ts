import express from "express";
import { requireAuth } from "../middleware/authentication/requireAuth";
import { getIndex } from "../controllers/index.controller";
const router = express.Router();

router.all("/", requireAuth, (req, res) => res.redirect("/main/upload"));


router.get("/:tab", requireAuth, getIndex);

export default router;