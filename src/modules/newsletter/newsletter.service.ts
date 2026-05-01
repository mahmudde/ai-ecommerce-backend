import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

type NewsletterQuery = {
  search?: string;
  page: number;
  limit: number;
};

export const newsletterService = {
  subscribe: async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingSubscriber) {
      throw new AppError(409, "This email is already subscribed");
    }

    return prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
      },
    });
  },

  getSubscribers: async (query: NewsletterQuery) => {
    const { search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NewsletterSubscriberWhereInput = {
      ...(search
        ? {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {}),
    };

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({
        where,
      }),
    ]);

    return {
      subscribers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  deleteSubscriber: async (id: string) => {
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: {
        id,
      },
    });

    if (!existingSubscriber) {
      throw new AppError(404, "Newsletter subscriber not found");
    }

    await prisma.newsletterSubscriber.delete({
      where: {
        id,
      },
    });

    return null;
  },
};