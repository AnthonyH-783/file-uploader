import express from "express";
import { requireAuth } from "../middleware/authentication/requireAuth";
import { getIndex } from "../controllers/index.controller";
const router = express.Router();



router.get("/", requireAuth, getIndex);


export default router;