import { Router } from "express";
import { requireAuth, optionalAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { productController } from "./product.controller.js";
import {
  createProductSchema,
  productParamsSchema,
  productQuerySchema,
  productSlugParamsSchema,
  updateProductSchema,
} from "./product.validation.js";

const router = Router();

router.get(
  "/",
  optionalAuth,
  validateRequest({
    query: productQuerySchema,
  }),
  productController.getProducts
);

router.get("/trending", productController.getTrendingProducts);

router.get(
  "/:id/related",
  validateRequest({
    params: productParamsSchema,
  }),
  productController.getRelatedProducts
);

router.get(
  "/:slug",
  validateRequest({
    params: productSlugParamsSchema,
  }),
  productController.getProductBySlug
);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "MANAGER"),
  validateRequest({
    body: createProductSchema,
  }),
  productController.createProduct
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "MANAGER"),
  validateRequest({
    params: productParamsSchema,
    body: updateProductSchema,
  }),
  productController.updateProduct
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: productParamsSchema,
  }),
  productController.deleteProduct
);

export const productRoutes = router;