import { wishlistService } from "./wishlist.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type WishlistQuery = {
  page: number;
  limit: number;
};

export const wishlistController = {
  getMyWishlist: catchAsync(async (req, res) => {
    const result = await wishlistService.getMyWishlist(
      req.user!.id,
      req.validatedQuery as WishlistQuery
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Wishlist fetched successfully",
      data: result.items,
      meta: result.meta,
    });
  }),

  addToWishlist: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      productId: string;
    };

    const item = await wishlistService.addToWishlist(
      req.user!.id,
      params.productId
    );

    sendResponse({
      res,
      statusCode: 201,
      message: "Product added to wishlist successfully",
      data: item,
    });
  }),

  removeFromWishlist: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      productId: string;
    };

    await wishlistService.removeFromWishlist(req.user!.id, params.productId);

    sendResponse({
      res,
      statusCode: 200,
      message: "Product removed from wishlist successfully",
      data: null,
    });
  }),
};