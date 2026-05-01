import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

const getOrCreateCart = async (userId: string) => {
  const existingCart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId,
    },
  });
};

const getCartWithItems = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: {
                  createdAt: "asc",
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return {
      id: null,
      userId,
      items: [],
      summary: {
        totalItems: 0,
        subtotal: 0,
        shippingFee: 0,
        tax: 0,
        total: 0,
      },
    };
  }

  const activeItems = cart.items.filter(
    (item) => item.product.status === "ACTIVE"
  );

  const subtotal = activeItems.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + Number(price) * item.quantity;
  }, 0);

  const totalItems = activeItems.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  const shippingFee = subtotal > 0 && subtotal < 100 ? 8 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + shippingFee + tax;

  return {
    ...cart,
    items: activeItems,
    summary: {
      totalItems,
      subtotal: Number(subtotal.toFixed(2)),
      shippingFee: Number(shippingFee.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    },
  };
};

export const cartService = {
  getMyCart: async (userId: string) => {
    return getCartWithItems(userId);
  },

  addItemToCart: async (
    userId: string,
    payload: {
      productId: string;
      quantity: number;
    }
  ) => {
    const product = await prisma.product.findUnique({
      where: {
        id: payload.productId,
      },
    });

    if (!product || product.status !== "ACTIVE") {
      throw new AppError(404, "Product not found");
    }

    if (product.stock <= 0) {
      throw new AppError(400, "Product is out of stock");
    }

    if (payload.quantity > product.stock) {
      throw new AppError(
        400,
        `Only ${product.stock} item(s) available in stock`
      );
    }

    const cart = await getOrCreateCart(userId);

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + payload.quantity;

      if (newQuantity > product.stock) {
        throw new AppError(
          400,
          `Only ${product.stock} item(s) available in stock`
        );
      }

      await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: payload.quantity,
        },
      });
    }

    return getCartWithItems(userId);
  },

  updateCartItem: async (
    userId: string,
    itemId: string,
    payload: {
      quantity: number;
    }
  ) => {
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new AppError(404, "Cart not found");
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new AppError(404, "Cart item not found");
    }

    if (cartItem.product.status !== "ACTIVE") {
      throw new AppError(400, "Product is no longer available");
    }

    if (payload.quantity > cartItem.product.stock) {
      throw new AppError(
        400,
        `Only ${cartItem.product.stock} item(s) available in stock`
      );
    }

    await prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity: payload.quantity,
      },
    });

    return getCartWithItems(userId);
  },

  removeCartItem: async (userId: string, itemId: string) => {
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new AppError(404, "Cart not found");
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new AppError(404, "Cart item not found");
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    return getCartWithItems(userId);
  },

  clearCart: async (userId: string) => {
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      return getCartWithItems(userId);
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return getCartWithItems(userId);
  },
};