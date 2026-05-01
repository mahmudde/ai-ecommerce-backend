import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { newsletterController } from "./newsletter.controller.js";
import {
  newsletterSubscriberParamsSchema,
  newsletterSubscriberQuerySchema,
  subscribeNewsletterSchema,
} from "./newsletter.validation.js";

const router = Router();

router.post(
  "/subscribe",
  validateRequest({
    body: subscribeNewsletterSchema,
  }),
  newsletterController.subscribe
);

router.get(
  "/subscribers",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    query: newsletterSubscriberQuerySchema,
  }),
  newsletterController.getSubscribers
);

router.delete(
  "/subscribers/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: newsletterSubscriberParamsSchema,
  }),
  newsletterController.deleteSubscriber
);

export const newsletterRoutes = router;