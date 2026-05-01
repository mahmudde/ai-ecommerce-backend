import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { orderController } from "./order.controller.js";
import {
  createOrderSchema,
  orderParamsSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
} from "./order.validation.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole("USER"),
  validateRequest({
    body: createOrderSchema,
  }),
  orderController.createOrder
);

router.get(
  "/my-orders",
  requireRole("USER"),
  validateRequest({
    query: orderQuerySchema,
  }),
  orderController.getMyOrders
);

router.get(
  "/",
  requireRole("ADMIN", "MANAGER"),
  validateRequest({
    query: orderQuerySchema,
  }),
  orderController.getAllOrders
);

router.get(
  "/:id",
  validateRequest({
    params: orderParamsSchema,
  }),
  orderController.getOrderById
);

router.patch(
  "/:id",
  requireRole("ADMIN", "MANAGER"),
  validateRequest({
    params: orderParamsSchema,
    body: updateOrderStatusSchema,
  }),
  orderController.updateOrderStatus
);

export const orderRoutes = router;