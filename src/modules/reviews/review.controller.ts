import { reviewService } from "./review.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type ReviewQuery = {
  rating?: number;
  page: number;
  limit: number;
};

export const reviewController = {
  createReview: catchAsync(async (req, res) => {
    const params = req.validatedParams as { productId: string };

    const review = await reviewService.createReview(
      req.user!.id,
      params.productId,
      req.validatedBody as {
        rating: number;
        comment: string;
      }
    );

    sendResponse({
      res,
      statusCode: 201,
      message: "Review created successfully",
      data: review,
    });
  }),

  getProductReviews: catchAsync(async (req, res) => {
    const params = req.validatedParams as { productId: string };

    const result = await reviewService.getProductReviews(
      params.productId,
      req.validatedQuery as ReviewQuery
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Product reviews fetched successfully",
      data: result.reviews,
      meta: result.meta,
    });
  }),

  updateReview: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    const review = await reviewService.updateReview(
      params.id,
      req.user!.id,
      req.user!.role as string,
      req.validatedBody as {
        rating?: number;
        comment?: string;
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Review updated successfully",
      data: review,
    });
  }),

  deleteReview: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    await reviewService.deleteReview(
      params.id,
      req.user!.id,
      req.user!.role as string
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Review deleted successfully",
      data: null,
    });
  }),
};