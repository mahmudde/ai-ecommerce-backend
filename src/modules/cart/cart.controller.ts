import { cartService } from "./cart.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const cartController = {
  getMyCart: catchAsync(async (req, res) => {
    const cart = await cartService.getMyCart(req.user!.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Cart fetched successfully",
      data: cart,
    });
  }),

  addItemToCart: catchAsync(async (req, res) => {
    const cart = await cartService.addItemToCart(
      req.user!.id,
      req.validatedBody as {
        productId: string;
        quantity: number;
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Item added to cart successfully",
      data: cart,
    });
  }),

  updateCartItem: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    const cart = await cartService.updateCartItem(
      req.user!.id,
      params.id,
      req.validatedBody as {
        quantity: number;
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Cart item updated successfully",
      data: cart,
    });
  }),

  removeCartItem: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    const cart = await cartService.removeCartItem(req.user!.id, params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Cart item removed successfully",
      data: cart,
    });
  }),

  clearCart: catchAsync(async (req, res) => {
    const cart = await cartService.clearCart(req.user!.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Cart cleared successfully",
      data: cart,
    });
  }),
};