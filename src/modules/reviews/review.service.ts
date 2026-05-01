import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

type CreateReviewPayload = {
  rating: number;
  comment: string;
};

type UpdateReviewPayload = Partial<CreateReviewPayload>;

type ReviewQuery = {
  rating?: number;
  page: number;
  limit: number;
};

const recalculateProductRating = async (
  productId: string,
  tx: Prisma.TransactionClient = prisma
) => {
  const result = await tx.review.aggregate({
    where: {
      productId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  await tx.product.update({
    where: {
      id: productId,
    },
    data: {
      ratingAverage: Number((result._avg.rating ?? 0).toFixed(1)),
      ratingCount: result._count.rating,
    },
  });
};

export const reviewService = {
  createReview: async (
    userId: string,
    productId: string,
    payload: CreateReviewPayload
  ) => {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product || product.status !== "ACTIVE") {
      throw new AppError(404, "Product not found");
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      throw new AppError(409, "You already reviewed this product");
    }

    const review = await prisma.$transaction(async (tx) => {
      const createdReview = await tx.review.create({
        data: {
          userId,
          productId,
          rating: payload.rating,
          comment: payload.comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      await recalculateProductRating(productId, tx);

      return createdReview;
    });

    return review;
  },

  getProductReviews: async (productId: string, query: ReviewQuery) => {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const { rating, page, limit } = query;

    const where: Prisma.ReviewWhereInput = {
      productId,
      ...(rating ? { rating } : {}),
    };

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  updateReview: async (
    reviewId: string,
    userId: string,
    role: string,
    payload: UpdateReviewPayload
  ) => {
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      throw new AppError(404, "Review not found");
    }

    if (role !== "ADMIN" && existingReview.userId !== userId) {
      throw new AppError(403, "You can only update your own review");
    }

    const updatedReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: {
          id: reviewId,
        },
        data: {
          ...(payload.rating !== undefined ? { rating: payload.rating } : {}),
          ...(payload.comment !== undefined ? { comment: payload.comment } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      await recalculateProductRating(existingReview.productId, tx);

      return review;
    });

    return updatedReview;
  },

  deleteReview: async (reviewId: string, userId: string, role: string) => {
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      throw new AppError(404, "Review not found");
    }

    if (role !== "ADMIN" && existingReview.userId !== userId) {
      throw new AppError(403, "You can only delete your own review");
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: {
          id: reviewId,
        },
      });

      await recalculateProductRating(existingReview.productId, tx);
    });

    return null;
  },
};