import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { aiController } from "./ai.controller.js";
import {
  aiChatSchema,
  productSuggestionSchema,
  searchSuggestionQuerySchema,
} from "./ai.validation.js";

const router = Router();

router.post(
  "/chat",
  optionalAuth,
  validateRequest({
    body: aiChatSchema,
  }),
  aiController.chat
);

router.get(
  "/search-suggestions",
  validateRequest({
    query: searchSuggestionQuerySchema,
  }),
  aiController.getSearchSuggestions
);

router.get(
  "/recommendations",
  requireAuth,
  aiController.getRecommendations
);

router.get("/trending-products", aiController.getTrendingProducts);

router.post(
  "/product-suggestions",
  requireAuth,
  requireRole("ADMIN", "MANAGER"),
  validateRequest({
    body: productSuggestionSchema,
  }),
  aiController.generateProductSuggestions
);

router.get(
  "/admin-insights",
  requireAuth,
  requireRole("ADMIN"),
  aiController.getAdminInsights
);

export const aiRoutes = router;