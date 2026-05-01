import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { supportController } from "./support.controller.js";
import {
  createSupportMessageSchema,
  resolveSupportMessageSchema,
  supportMessageParamsSchema,
  supportMessageQuerySchema,
} from "./support.validation.js";

const router = Router();

router.post(
  "/messages",
  validateRequest({
    body: createSupportMessageSchema,
  }),
  supportController.createMessage
);

router.get(
  "/messages",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    query: supportMessageQuerySchema,
  }),
  supportController.getMessages
);

router.get(
  "/messages/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: supportMessageParamsSchema,
  }),
  supportController.getMessageById
);

router.patch(
  "/messages/:id/resolve",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: supportMessageParamsSchema,
    body: resolveSupportMessageSchema,
  }),
  supportController.resolveMessage
);

router.delete(
  "/messages/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateRequest({
    params: supportMessageParamsSchema,
  }),
  supportController.deleteMessage
);

export const supportRoutes = router;