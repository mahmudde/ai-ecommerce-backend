import { productService } from "./product.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type ProductQuery = {
  search?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  sort: string;
  page: number;
  limit: number;
};

export const productController = {
  getProducts: catchAsync(async (req, res) => {
    const result = await productService.getProducts(
      req.validatedQuery as ProductQuery,
      req.user?.role as string | undefined
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Products fetched successfully",
      data: result.products,
      meta: result.meta,
    });
  }),

  getProductBySlug: catchAsync(async (req, res) => {
    const params = req.validatedParams as { slug: string };
    const product = await productService.getProductBySlug(params.slug);

    sendResponse({
      res,
      statusCode: 200,
      message: "Product fetched successfully",
      data: product,
    });
  }),

  getRelatedProducts: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };
    const products = await productService.getRelatedProducts(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Related products fetched successfully",
      data: products,
    });
  }),

  getTrendingProducts: catchAsync(async (_req, res) => {
    const products = await productService.getTrendingProducts();

    sendResponse({
      res,
      statusCode: 200,
      message: "Trending products fetched successfully",
      data: products,
    });
  }),

  createProduct: catchAsync(async (req, res) => {
    const product = await productService.createProduct(
      req.validatedBody as Parameters<typeof productService.createProduct>[0],
      req.user!.id
    );

    sendResponse({
      res,
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    });
  }),

  updateProduct: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    const product = await productService.updateProduct(
      params.id,
      req.validatedBody as Parameters<typeof productService.updateProduct>[1],
      req.user!.id,
      req.user!.role as string
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Product updated successfully",
      data: product,
    });
  }),

  deleteProduct: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    await productService.deleteProduct(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Product deleted or archived successfully",
      data: null,
    });
  }),
};