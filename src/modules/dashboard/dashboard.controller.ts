import { dashboardService } from "./dashboard.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const dashboardController = {
  getUserOverview: catchAsync(async (req, res) => {
    const result = await dashboardService.getUserOverview(req.user!.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "User dashboard overview fetched successfully",
      data: result,
    });
  }),

  getManagerOverview: catchAsync(async (req, res) => {
    const result = await dashboardService.getManagerOverview(req.user!.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Manager dashboard overview fetched successfully",
      data: result,
    });
  }),

  getAdminOverview: catchAsync(async (_req, res) => {
    const result = await dashboardService.getAdminOverview();

    sendResponse({
      res,
      statusCode: 200,
      message: "Admin dashboard overview fetched successfully",
      data: result,
    });
  }),

  getAdminSalesChart: catchAsync(async (_req, res) => {
    const result = await dashboardService.getAdminSalesChart();

    sendResponse({
      res,
      statusCode: 200,
      message: "Admin sales chart fetched successfully",
      data: result,
    });
  }),

  getAdminTopProducts: catchAsync(async (_req, res) => {
    const result = await dashboardService.getAdminTopProducts();

    sendResponse({
      res,
      statusCode: 200,
      message: "Admin top products fetched successfully",
      data: result,
    });
  }),

  getAdminRecentOrders: catchAsync(async (_req, res) => {
    const result = await dashboardService.getAdminRecentOrders();

    sendResponse({
      res,
      statusCode: 200,
      message: "Admin recent orders fetched successfully",
      data: result,
    });
  }),

  getAdminUsersTable: catchAsync(async (req, res) => {
    const result = await dashboardService.getAdminUsersTable(
      req.validatedQuery as {
        search?: string;
        role?: "USER" | "MANAGER" | "ADMIN";
        status?: "ACTIVE" | "BLOCKED";
        page: number;
        limit: number;
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Admin users table fetched successfully",
      data: result.users,
      meta: result.meta,
    });
  }),
};