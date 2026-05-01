import { paymentService } from "./payment.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const paymentController = {
  createCheckoutSession: catchAsync(async (req, res) => {
    const body = req.validatedBody as {
      orderId: string;
    };

    const session = await paymentService.createCheckoutSession(
      body.orderId,
      req.user!.id
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Stripe checkout session created successfully",
      data: session,
    });
  }),

  stripeWebhook: catchAsync(async (req, res) => {
    const signature = req.headers["stripe-signature"];

    const result = await paymentService.handleStripeWebhook(
      req.body as Buffer,
      signature
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Stripe webhook processed successfully",
      data: result,
    });
  }),
};