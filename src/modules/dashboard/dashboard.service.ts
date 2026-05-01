import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";

const getDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const dashboardService = {
  getUserOverview: async (userId: string) => {
    const [ordersCount, reviewsCount, wishlistCount, cart, paidOrders] =
      await Promise.all([
        prisma.order.count({
          where: {
            userId,
          },
        }),
        prisma.review.count({
          where: {
            userId,
          },
        }),
        prisma.wishlistItem.count({
          where: {
            userId,
          },
        }),
        prisma.cart.findUnique({
          where: {
            userId,
          },
          include: {
            items: true,
          },
        }),
        prisma.order.findMany({
          where: {
            userId,
            paymentStatus: "PAID",
          },
          select: {
            total: true,
          },
        }),
      ]);

    const totalSpent = paidOrders.reduce((sum, order) => {
      return sum + Number(order.total);
    }, 0);

    return {
      overviewCards: {
        totalOrders: ordersCount,
        totalReviews: reviewsCount,
        wishlistItems: wishlistCount,
        cartItems: cart?.items.length ?? 0,
        totalSpent: Number(totalSpent.toFixed(2)),
      },
    };
  },

  getManagerOverview: async (managerId: string) => {
    const managerProducts = await prisma.product.findMany({
      where: {
        createdById: managerId,
      },
      select: {
        id: true,
        price: true,
        stock: true,
        soldCount: true,
        viewCount: true,
        ratingAverage: true,
      },
    });

    const productIds = managerProducts.map((product) => product.id);

    const [ordersCount, reviewsCount, lowStockCount, recentOrders] =
      await Promise.all([
        prisma.order.count({
          where: {
            items: {
              some: {
                productId: {
                  in: productIds,
                },
              },
            },
          },
        }),
        prisma.review.count({
          where: {
            productId: {
              in: productIds,
            },
          },
        }),
        prisma.product.count({
          where: {
            createdById: managerId,
            stock: {
              lte: 10,
            },
          },
        }),
        prisma.order.findMany({
          where: {
            items: {
              some: {
                productId: {
                  in: productIds,
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              where: {
                productId: {
                  in: productIds,
                },
              },
            },
          },
        }),
      ]);

    const totalStock = managerProducts.reduce((sum, product) => {
      return sum + product.stock;
    }, 0);

    const totalSold = managerProducts.reduce((sum, product) => {
      return sum + product.soldCount;
    }, 0);

    const totalViews = managerProducts.reduce((sum, product) => {
      return sum + product.viewCount;
    }, 0);

    return {
      overviewCards: {
        totalProducts: managerProducts.length,
        totalOrders: ordersCount,
        totalReviews: reviewsCount,
        lowStockProducts: lowStockCount,
        totalStock,
        totalSold,
        totalViews,
      },
      recentOrders,
    };
  },

  getAdminOverview: async () => {
    const [
      usersCount,
      managersCount,
      productsCount,
      categoriesCount,
      ordersCount,
      paidOrdersCount,
      pendingOrdersCount,
      reviewsCount,
      lowStockProductsCount,
      paidOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: "MANAGER",
        },
      }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({
        where: {
          paymentStatus: "PAID",
        },
      }),
      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.review.count(),
      prisma.product.count({
        where: {
          stock: {
            lte: 10,
          },
        },
      }),
      prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
        },
        select: {
          total: true,
        },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, order) => {
      return sum + Number(order.total);
    }, 0);

    return {
      overviewCards: {
        totalUsers: usersCount,
        totalManagers: managersCount,
        totalProducts: productsCount,
        totalCategories: categoriesCount,
        totalOrders: ordersCount,
        paidOrders: paidOrdersCount,
        pendingOrders: pendingOrdersCount,
        totalReviews: reviewsCount,
        lowStockProducts: lowStockProductsCount,
        totalRevenue: Number(totalRevenue.toFixed(2)),
      },
    };
  },

  getAdminSalesChart: async () => {
    const fromDate = getDateDaysAgo(30);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: fromDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const salesMap = new Map<string, { date: string; revenue: number; orders: number }>();

    for (let i = 29; i >= 0; i--) {
      const date = getDateDaysAgo(i);
      const key = date.toISOString().slice(0, 10);

      salesMap.set(key, {
        date: key,
        revenue: 0,
        orders: 0,
      });
    }

    orders.forEach((order) => {
      const key = order.createdAt.toISOString().slice(0, 10);
      const existing = salesMap.get(key);

      if (existing) {
        existing.revenue += Number(order.total);
        existing.orders += 1;
      }
    });

    return Array.from(salesMap.values()).map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2)),
    }));
  },

  getAdminTopProducts: async () => {
    return prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: [
        {
          soldCount: "desc",
        },
        {
          ratingAverage: "desc",
        },
      ],
      take: 10,
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

  getAdminRecentOrders: async () => {
    return prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          take: 3,
        },
      },
    });
  },

  getAdminUsersTable: async (query: {
    search?: string;
    role?: "USER" | "MANAGER" | "ADMIN";
    status?: "ACTIVE" | "BLOCKED";
    page: number;
    limit: number;
  }) => {
    const { search, role, status, page, limit } = query;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};