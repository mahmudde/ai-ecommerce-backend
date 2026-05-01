import { aiService } from "./ai.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const aiController = {
  chat: catchAsync(async (req, res) => {
    const body = req.validatedBody as {
      message: string;
    };

    const result = await aiService.chat(body.message, req.user?.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "AI response generated successfully",
      data: result,
    });
  }),

  getSearchSuggestions: catchAsync(async (req, res) => {
    const query = req.validatedQuery as {
      query: string;
    };

    const suggestions = await aiService.getSearchSuggestions(query.query);

    sendResponse({
      res,
      statusCode: 200,
      message: "AI search suggestions fetched successfully",
      data: suggestions,
    });
  }),

  getRecommendations: catchAsync(async (req, res) => {
    const products = await aiService.getRecommendations(req.user!.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "AI recommendations fetched successfully",
      data: products,
    });
  }),

  getTrendingProducts: catchAsync(async (_req, res) => {
    const products = await aiService.getTrendingProducts();

    sendResponse({
      res,
      statusCode: 200,
      message: "Trending products fetched successfully",
      data: products,
    });
  }),

  generateProductSuggestions: catchAsync(async (req, res) => {
    const result = await aiService.generateProductSuggestions(
      req.validatedBody as {
        rawIdea: string;
        category?: string;
        targetAudience?: string;
        qualityLevel?: "budget" | "mid-range" | "premium";
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "AI product suggestions generated successfully",
      data: result,
    });
  }),

  getAdminInsights: catchAsync(async (_req, res) => {
    const result = await aiService.getAdminInsights();

    sendResponse({
      res,
      statusCode: 200,
      message: "AI admin insights generated successfully",
      data: result,
    });
  }),
};