import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { categoryController } from "./category.controller.js";
import {
  categoryParamsSchema,
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";

const router = Router();

router.get(
  "/",
  validateRequest({
    query: categoryQuerySchema,
  }),
  categoryController.getCategories
);

router.get(
  "/:id",
  validateRequest({
    params: categoryParamsSchema,
  }),
  categoryController.getCategoryById
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    body: createCategorySchema,
  }),
  categoryController.createCategory
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: categoryParamsSchema,
    body: updateCategorySchema,
  }),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: categoryParamsSchema,
  }),
  categoryController.deleteCategory
);

export const categoryRoutes = router;