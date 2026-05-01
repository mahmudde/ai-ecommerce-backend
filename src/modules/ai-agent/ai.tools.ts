import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";

export const aiTools = {
  searchProducts: async (query: {
    search?: string;
    maxPrice?: number;
    minRating?: number;
    categoryName?: string;
    limit?: number;
  }) => {
    const limit = query.limit ?? 5;

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE" as const,
      ...(query.search
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: "insensitive" as const,
                },
              },
              {
                shortDescription: {
                  contains: query.search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: "insensitive" as const,
                },
              },
              {
                brand: {
                  contains: query.search,
                  mode: "insensitive" as const,
                },
              },
              {
                tags: {
                  has: query.search,
                },
              },
            ],
          }
        : {}),
      ...(query.maxPrice
        ? {
            price: {
              lte: new Prisma.Decimal(query.maxPrice),
            },
          }
        : {}),
      ...(query.minRating
        ? {
            ratingAverage: {
              gte: query.minRating,
            },
          }
        : {}),
      ...(query.categoryName
        ? {
            category: {
              name: {
                contains: query.categoryName,
                mode: "insensitive" as const,
              },
            },
          }
        : {}),
    };

    return prisma.product.findMany({
      where,
      orderBy: [
        {
          soldCount: "desc",
        },
        {
          ratingAverage: "desc",
        },
        {
          viewCount: "desc",
        },
      ],
      take: limit,
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
    });
  },

  getTrendingProducts: async (limit = 8) => {
    return prisma.product.findMany({
      where: {
        status: "ACTIVE" as const,
      },
      orderBy: [
        {
          soldCount: "desc",
        },
        {
          viewCount: "desc",
        },
        {
          ratingAverage: "desc",
        },
      ],
      take: limit,
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
    });
  },

  getPersonalizedRecommendations: async (userId: string, limit = 8) => {
    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      include: {
        product: {
          select: {
            categoryId: true,
            brand: true,
            tags: true,
          },
        },
      },
    });

    const categoryIds = new Set<string>();
    const brands = new Set<string>();
    const tags = new Set<string>();

    activities.forEach((activity) => {
      if (activity.product?.categoryId) {
        categoryIds.add(activity.product.categoryId);
      }

      if (activity.product?.brand) {
        brands.add(activity.product.brand);
      }

      activity.product?.tags.forEach((tag) => tags.add(tag));
    });

    if (!categoryIds.size && !brands.size && !tags.size) {
      return aiTools.getTrendingProducts(limit);
    }

    return prisma.product.findMany({
      where: {
        status: "ACTIVE" as const,
        OR: [
          ...(categoryIds.size
            ? [
                {
                  categoryId: {
                    in: [...categoryIds],
                  },
                },
              ]
            : []),
          ...(brands.size
            ? [
                {
                  brand: {
                    in: [...brands],
                  },
                },
              ]
            : []),
          ...(tags.size
            ? [
                {
                  tags: {
                    hasSome: [...tags],
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: [
        {
          ratingAverage: "desc",
        },
        {
          soldCount: "desc",
        },
      ],
      take: limit,
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
    });
  },

  getAdminInsightData: async () => {
    const [topProducts, lowStockProducts, pendingOrders, totalUsers, paidOrders] =
      await Promise.all([
        prisma.product.findMany({
          where: {
            status: "ACTIVE" as const,
          },
          orderBy: {
            soldCount: "desc",
          },
          take: 5,
          select: {
            name: true,
            stock: true,
            soldCount: true,
            ratingAverage: true,
          },
        }),
        prisma.product.findMany({
          where: {
            stock: {
              lte: 10,
            },
            status: "ACTIVE" as const,
          },
          orderBy: {
            stock: "asc",
          },
          take: 10,
          select: {
            name: true,
            stock: true,
            soldCount: true,
          },
        }),
        prisma.order.count({
          where: {
            status: "PENDING" as const,
          },
        }),
        prisma.user.count(),
        prisma.order.findMany({
          where: {
            paymentStatus: "PAID" as const,
          },
          select: {
            total: true,
          },
        }),
      ]);

    const revenue = paidOrders.reduce((sum, order) => {
      return sum + Number(order.total);
    }, 0);

    return {
      topProducts,
      lowStockProducts,
      pendingOrders,
      totalUsers,
      revenue: Number(revenue.toFixed(2)),
    };
  },
};