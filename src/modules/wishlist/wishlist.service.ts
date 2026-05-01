import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

type WishlistQuery = {
  page: number;
  limit: number;
};

export const wishlistService = {
  getMyWishlist: async (userId: string, query: WishlistQuery) => {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
    };

    const [items, total] = await Promise.all([
      prisma.wishlistItem.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          product: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              images: {
                take: 1,
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          },
        },
      }),
      prisma.wishlistItem.count({
        where,
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  addToWishlist: async (userId: string, productId: string) => {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product || product.status !== "ACTIVE") {
      throw new AppError(404, "Product not found");
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      throw new AppError(409, "Product is already in your wishlist");
    }

    return prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              take: 1,
            },
          },
        },
      },
    });
  },

  removeFromWishlist: async (userId: string, productId: string) => {
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!existingItem) {
      throw new AppError(404, "Wishlist item not found");
    }

    await prisma.wishlistItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return null;
  },
};