import { categoryService } from "./category.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type CategoryQuery = {
  search?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

export const categoryController = {
  getCategories: catchAsync(async (req, res) => {
    const result = await categoryService.getCategories(
      req.validatedQuery as CategoryQuery
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Categories fetched successfully",
      data: result.categories,
      meta: result.meta,
    });
  }),

  getCategoryById: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    const category = await categoryService.getCategoryById(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Category fetched successfully",
      data: category,
    });
  }),

  createCategory: catchAsync(async (req, res) => {
    const category = await categoryService.createCategory(
      req.validatedBody as {
        name: string;
        description?: string;
        imageUrl?: string;
        isActive?: boolean;
      }
    );

    sendResponse({
      res,
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    });
  }),

  updateCategory: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    const category = await categoryService.updateCategory(
      params.id,
      req.validatedBody as {
        name?: string;
        description?: string;
        imageUrl?: string;
        isActive?: boolean;
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Category updated successfully",
      data: category,
    });
  }),

  deleteCategory: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    await categoryService.deleteCategory(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Category deleted successfully",
      data: null,
    });
  }),
};