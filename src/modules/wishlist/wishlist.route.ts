import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { wishlistController } from "./wishlist.controller.js";
import {
  wishlistParamsSchema,
  wishlistQuerySchema,
} from "./wishlist.validation.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  validateRequest({
    query: wishlistQuerySchema,
  }),
  wishlistController.getMyWishlist
);

router.post(
  "/:productId",
  validateRequest({
    params: wishlistParamsSchema,
  }),
  wishlistController.addToWishlist
);

router.delete(
  "/:productId",
  validateRequest({
    params: wishlistParamsSchema,
  }),
  wishlistController.removeFromWishlist
);

export const wishlistRoutes = router;