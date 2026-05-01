import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { paymentController } from "./payment.controller.js";
import { createCheckoutSessionSchema } from "./payment.validation.js";

const router = Router();

router.post(
  "/create-checkout-session",
  requireAuth,
  validateRequest({
    body: createCheckoutSessionSchema,
  }),
  paymentController.createCheckoutSession
);

export const paymentRoutes = router;