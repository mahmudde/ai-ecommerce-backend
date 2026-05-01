import { Router } from "express";
import { requireAuth } from "../../middlewares/session.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { dashboardController } from "./dashboard.controller.js";
import { adminUsersTableQuerySchema } from "./dashboard.validation.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/user/overview",
  requireRole("USER"),
  dashboardController.getUserOverview
);

router.get(
  "/manager/overview",
  requireRole("MANAGER"),
  dashboardController.getManagerOverview
);

router.get(
  "/admin/overview",
  requireRole("ADMIN"),
  dashboardController.getAdminOverview
);

router.get(
  "/admin/sales-chart",
  requireRole("ADMIN"),
  dashboardController.getAdminSalesChart
);

router.get(
  "/admin/top-products",
  requireRole("ADMIN"),
  dashboardController.getAdminTopProducts
);

router.get(
  "/admin/recent-orders",
  requireRole("ADMIN"),
  dashboardController.getAdminRecentOrders
);

router.get(
  "/admin/users-table",
  requireRole("ADMIN"),
  validateRequest({
    query: adminUsersTableQuerySchema,
  }),
  dashboardController.getAdminUsersTable
);

export const dashboardRoutes = router;