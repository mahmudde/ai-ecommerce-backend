import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

type UpdateMyProfilePayload = {
  name?: string;
  phone?: string;
  image?: string;
  street?: string;
  city?: string;
  country?: string;
  postalCode?: string;
};

type UsersQuery = {
  search?: string;
  role?: "USER" | "MANAGER" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
  page: number;
  limit: number;
};

export const userService = {
  getMe: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true,
        phone: true,
        street: true,
        city: true,
        country: true,
        postalCode: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlistItems: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  },

  updateMyProfile: async (
    userId: string,
    payload: UpdateMyProfilePayload
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true,
        phone: true,
        street: true,
        city: true,
        country: true,
        postalCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  getUsers: async (query: UsersQuery) => {
    const { search, role, status, page, limit } = query;
    const skip = (page - 1) * limit;

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
          emailVerified: true,
          image: true,
          role: true,
          status: true,
          phone: true,
          city: true,
          country: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              wishlistItems: true,
            },
          },
        },
      }),
      prisma.user.count({
        where,
      }),
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

  getUserById: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true,
        phone: true,
        street: true,
        city: true,
        country: true,
        postalCode: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlistItems: true,
            products: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  },

  updateUserRole: async (
    id: string,
    role: "USER" | "MANAGER" | "ADMIN",
    currentAdminId: string
  ) => {
    if (id === currentAdminId && role !== "ADMIN") {
      throw new AppError(400, "You cannot remove your own admin role");
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  },

  updateUserStatus: async (
    id: string,
    status: "ACTIVE" | "BLOCKED",
    currentAdminId: string
  ) => {
    if (id === currentAdminId && status === "BLOCKED") {
      throw new AppError(400, "You cannot block your own account");
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return prisma.user.update({
      where: {
        id,
      },
      data: {
        status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  },
};