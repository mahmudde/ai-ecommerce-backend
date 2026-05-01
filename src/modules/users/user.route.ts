import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { getMe } from "./user.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);

export const userRoutes = router;