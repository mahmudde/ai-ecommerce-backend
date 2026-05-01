import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

type CreateSupportMessagePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SupportMessageQuery = {
  search?: string;
  isResolved?: boolean;
  page: number;
  limit: number;
};

export const supportService = {
  createMessage: async (payload: CreateSupportMessagePayload) => {
    return prisma.supportMessage.create({
      data: payload,
    });
  },

  getMessages: async (query: SupportMessageQuery) => {
    const { search, isResolved, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SupportMessageWhereInput = {
      ...(typeof isResolved === "boolean" ? { isResolved } : {}),
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
              {
                subject: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                message: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [messages, total] = await Promise.all([
      prisma.supportMessage.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.supportMessage.count({ where }),
    ]);

    return {
      messages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getMessageById: async (id: string) => {
    const message = await prisma.supportMessage.findUnique({
      where: {
        id,
      },
    });

    if (!message) {
      throw new AppError(404, "Support message not found");
    }

    return message;
  },

  resolveMessage: async (
    id: string,
    payload: {
      isResolved: boolean;
    }
  ) => {
    const existingMessage = await prisma.supportMessage.findUnique({
      where: {
        id,
      },
    });

    if (!existingMessage) {
      throw new AppError(404, "Support message not found");
    }

    return prisma.supportMessage.update({
      where: {
        id,
      },
      data: {
        isResolved: payload.isResolved,
      },
    });
  },

  deleteMessage: async (id: string) => {
    const existingMessage = await prisma.supportMessage.findUnique({
      where: {
        id,
      },
    });

    if (!existingMessage) {
      throw new AppError(404, "Support message not found");
    }

    await prisma.supportMessage.delete({
      where: {
        id,
      },
    });

    return null;
  },
};