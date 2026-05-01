import Stripe from "stripe";
import { Prisma, OrderStatus, PaymentStatus } from "../../../prisma/generated/prisma/client/client.js";
import { stripe } from "../../config/stripe.js";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export const paymentService = {
  createCheckoutSession: async (orderId: string, userId: string) => {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true,
        items: true,
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.userId !== userId) {
      throw new AppError(403, "You can only pay for your own order");
    }

    if (order.paymentStatus === "PAID") {
      throw new AppError(400, "This order is already paid");
    }

    if (order.status === "CANCELLED") {
      throw new AppError(400, "Cancelled orders cannot be paid");
    }

    if (!order.items.length) {
      throw new AppError(400, "Order has no items");
    }

    const lineItems: any[] =
      order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      }));

    if (Number(order.shippingFee) > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping Fee",
          },
          unit_amount: Math.round(Number(order.shippingFee) * 100),
        },
        quantity: 1,
      });
    }

    if (Number(order.tax) > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(Number(order.tax) * 100),
        },
        quantity: 1,
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: order.user.email,
      line_items: lineItems,
      success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${env.STRIPE_CANCEL_URL}?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
    });

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        stripeCheckoutSession: checkoutSession.id,
      },
    });

    await prisma.payment.upsert({
      where: {
        orderId: order.id,
      },
      update: {
        provider: "stripe",
        providerPaymentId: checkoutSession.payment_intent?.toString() ?? null,
        amount: order.total,
        currency: "usd",
        status: "UNPAID" as const,
      },
      create: {
        orderId: order.id,
        provider: "stripe",
        providerPaymentId: checkoutSession.payment_intent?.toString() ?? null,
        amount: order.total,
        currency: "usd",
        status: "UNPAID" as const,
      },
    });

    return {
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    };
  },

  handleStripeWebhook: async (rawBody: Buffer, signature: string | string[] | undefined) => {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new AppError(500, "STRIPE_WEBHOOK_SECRET is missing");
    }

    if (!signature || Array.isArray(signature)) {
      throw new AppError(400, "Missing Stripe signature");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid webhook signature";
      throw new AppError(400, `Webhook signature verification failed: ${message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;

      if (!orderId) {
        throw new AppError(400, "Order id is missing from Stripe metadata");
      }

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: {
            id: orderId,
          },
        });

        if (!order) {
          throw new AppError(404, "Order not found");
        }

        if (order.paymentStatus === "PAID") {
          return;
        }

        await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            paymentStatus: "PAID" as const,
            status: "PROCESSING" as const,
            stripeCheckoutSession: session.id,
          },
        });

        await tx.payment.upsert({
          where: {
            orderId,
          },
          update: {
            provider: "stripe",
            providerPaymentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? session.id,
            amount: new Prisma.Decimal(Number(session.amount_total ?? 0) / 100),
            currency: session.currency ?? "usd",
            status: "PAID" as const,
          },
          create: {
            orderId,
            provider: "stripe",
            providerPaymentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? session.id,
            amount: new Prisma.Decimal(Number(session.amount_total ?? 0) / 100),
            currency: session.currency ?? "usd",
            status: "PAID" as const,
          },
        });
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await prisma.payment.updateMany({
          where: {
            orderId,
            status: "UNPAID",
          },
          data: {
            status: "FAILED" as const,
          },
        });
      }
    }

    return {
      received: true,
      eventType: event.type,
    };
  },
};