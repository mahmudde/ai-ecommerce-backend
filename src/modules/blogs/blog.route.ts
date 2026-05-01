import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { blogController } from "./blog.controller.js";
import {
  blogParamsSchema,
  blogQuerySchema,
  blogSlugParamsSchema,
  createBlogSchema,
  updateBlogSchema,
} from "./blog.validation.js";

const router = Router();

router.get(
  "/",
  optionalAuth,
  validateRequest({
    query: blogQuerySchema,
  }),
  blogController.getBlogs
);

router.get(
  "/:slug",
  optionalAuth,
  validateRequest({
    params: blogSlugParamsSchema,
  }),
  blogController.getBlogBySlug
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    body: createBlogSchema,
  }),
  blogController.createBlog
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: blogParamsSchema,
    body: updateBlogSchema,
  }),
  blogController.updateBlog
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: blogParamsSchema,
  }),
  blogController.deleteBlog
);

export const blogRoutes = router;