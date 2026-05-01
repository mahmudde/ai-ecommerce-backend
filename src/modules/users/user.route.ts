import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import {
  getMe,
  getUserById,
  getUsers,
  updateMyProfile,
  updateUserRole,
  updateUserStatus,
} from "./user.controller.js";
import {
  updateMyProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userParamsSchema,
  usersQuerySchema,
} from "./user.validation.js";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);

router.patch(
  "/me",
  validateRequest({
    body: updateMyProfileSchema,
  }),
  updateMyProfile
);

router.get(
  "/",
  requireRole("ADMIN"),
  validateRequest({
    query: usersQuerySchema,
  }),
  getUsers
);

router.get(
  "/:id",
  requireRole("ADMIN"),
  validateRequest({
    params: userParamsSchema,
  }),
  getUserById
);

router.patch(
  "/:id/role",
  requireRole("ADMIN"),
  validateRequest({
    params: userParamsSchema,
    body: updateUserRoleSchema,
  }),
  updateUserRole
);

router.patch(
  "/:id/status",
  requireRole("ADMIN"),
  validateRequest({
    params: userParamsSchema,
    body: updateUserStatusSchema,
  }),
  updateUserStatus
);

export const userRoutes = router;