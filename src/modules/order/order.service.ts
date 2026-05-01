import { Prisma, OrderStatus, PaymentStatus } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

type CreateOrderPayload = {
  shippingName: string;
  shippingPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
};

type OrderQuery = {
  search?: string;
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  page: number;
  limit: number;
};

const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${timestamp}-${random}`;
};

const calculateCartSummary = (
  items: {
    quantity: number;
    product: {
      price: Prisma.Decimal;
      discountPrice: Prisma.Decimal | null;
    };
  }[]
) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + Number(price) * item.quantity;
  }, 0);

  const shippingFee = subtotal > 0 && subtotal < 100 ? 8 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + shippingFee + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shippingFee: Number(shippingFee.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

export const orderService = {
  createOrderFromCart: async (userId: string, payload: CreateOrderPayload) => {
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError(400, "Your cart is empty");
    }

    const activeItems = cart.items.filter(
      (item) => item.product.status === "ACTIVE"
    );

    if (activeItems.length === 0) {
      throw new AppError(400, "Your cart has no available products");
    }

    for (const item of activeItems) {
      if (item.product.stock <= 0) {
        throw new AppError(
          400,
          `${item.product.name} is currently out of stock`
        );
      }

      if (item.quantity > item.product.stock) {
        throw new AppError(
          400,
          `Only ${item.product.stock} item(s) available for ${item.product.name}`
        );
      }
    }

    const summary = calculateCartSummary(activeItems);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          subtotal: new Prisma.Decimal(summary.subtotal),
          shippingFee: new Prisma.Decimal(summary.shippingFee),
          tax: new Prisma.Decimal(summary.tax),
          total: new Prisma.Decimal(summary.total),
          paymentStatus: "UNPAID" as const,
          status: "PENDING" as const,
          shippingName: payload.shippingName,
          shippingPhone: payload.shippingPhone,
          shippingStreet: payload.shippingStreet,
          shippingCity: payload.shippingCity,
          shippingCountry: payload.shippingCountry,
          shippingPostalCode: payload.shippingPostalCode,
          items: {
            create: activeItems.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;

              return {
                productId: item.productId,
                name: item.product.name,
                imageUrl: item.product.images[0]?.url ?? null,
                price,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of activeItems) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
            soldCount: {
              increment: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return createdOrder;
    });

    return order;
  },

  getMyOrders: async (userId: string, query: OrderQuery) => {
    const { status, paymentStatus, page, limit } = query;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status ? { status: status as any } : {}),
      ...(paymentStatus ? { paymentStatus: paymentStatus as any } : {}),
    };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          items: {
            take: 3,
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getAllOrders: async (query: OrderQuery) => {
    const { search, status, paymentStatus, page, limit } = query;

    const where: Prisma.OrderWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(paymentStatus ? { paymentStatus: paymentStatus as any } : {}),
      ...(search
        ? {
            OR: [
              {
                orderNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                shippingName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                shippingPhone: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
              email: true,
            },
          },
          items: {
            take: 3,
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getOrderById: async (orderId: string, userId: string, role: string) => {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  take: 1,
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (role === "USER" && order.userId !== userId) {
      throw new AppError(403, "You can only view your own orders");
    }

    return order;
  },

  updateOrderStatus: async (
    orderId: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ) => {
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      throw new AppError(404, "Order not found");
    }

    if (existingOrder.status === "CANCELLED") {
      throw new AppError(400, "Cancelled orders cannot be updated");
    }

    if (existingOrder.status === "DELIVERED" && status !== "DELIVERED") {
      throw new AppError(400, "Delivered orders cannot be changed");
    }

    if (status === "CANCELLED" && existingOrder.paymentStatus === "PAID") {
      throw new AppError(
        400,
        "Paid orders cannot be cancelled manually. Use refund flow instead."
      );
    }

    return prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status as OrderStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });
  },
};