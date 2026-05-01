import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { uploadController } from "./upload.controller.js";

const router = Router();

router.post(
  "/product-images",
  requireAuth,
  requireRole("ADMIN", "MANAGER"),
  upload.array("images", 6),
  uploadController.uploadProductImages
);

router.delete(
  "/product-image",
  requireAuth,
  requireRole("ADMIN", "MANAGER"),
  uploadController.deleteProductImage
);

export const uploadRoutes = router;