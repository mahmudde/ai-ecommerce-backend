import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { cartController } from "./cart.controller.js";
import {
  addCartItemSchema,
  cartItemParamsSchema,
  updateCartItemSchema,
} from "./cart.validation.js";

const router = Router();

router.use(requireAuth);

router.get("/", cartController.getMyCart);

router.post(
  "/items",
  validateRequest({
    body: addCartItemSchema,
  }),
  cartController.addItemToCart
);

router.patch(
  "/items/:id",
  validateRequest({
    params: cartItemParamsSchema,
    body: updateCartItemSchema,
  }),
  cartController.updateCartItem
);

router.delete(
  "/items/:id",
  validateRequest({
    params: cartItemParamsSchema,
  }),
  cartController.removeCartItem
);

router.delete("/", cartController.clearCart);

export const cartRoutes = router;