import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { reviewController } from "./review.controller.js";
import {
  createReviewSchema,
  productReviewParamsSchema,
  reviewParamsSchema,
  reviewQuerySchema,
  updateReviewSchema,
} from "./review.validation.js";

const router = Router();

router.post(
  "/:productId",
  requireAuth,
  validateRequest({
    params: productReviewParamsSchema,
    body: createReviewSchema,
  }),
  reviewController.createReview
);

router.get(
  "/product/:productId",
  validateRequest({
    params: productReviewParamsSchema,
    query: reviewQuerySchema,
  }),
  reviewController.getProductReviews
);

router.patch(
  "/:id",
  requireAuth,
  validateRequest({
    params: reviewParamsSchema,
    body: updateReviewSchema,
  }),
  reviewController.updateReview
);

router.delete(
  "/:id",
  requireAuth,
  validateRequest({
    params: reviewParamsSchema,
  }),
  reviewController.deleteReview
);

export const reviewRoutes = router;