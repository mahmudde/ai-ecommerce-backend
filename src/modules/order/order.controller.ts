import { orderService } from "./order.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type OrderQuery = {
  search?: string;
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  page: number;
  limit: number;
};

export const orderController = {
  createOrder: catchAsync(async (req, res) => {
    const order = await orderService.createOrderFromCart(
      req.user!.id,
      req.validatedBody as {
        shippingName: string;
        shippingPhone: string;
        shippingStreet: string;
        shippingCity: string;
        shippingCountry: string;
        shippingPostalCode: string;
      }
    );

    sendResponse({
      res,
      statusCode: 201,
      message: "Order created successfully",
      data: order,
    });
  }),

  getMyOrders: catchAsync(async (req, res) => {
    const result = await orderService.getMyOrders(
      req.user!.id,
      req.validatedQuery as OrderQuery
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "My orders fetched successfully",
      data: result.orders,
      meta: result.meta,
    });
  }),

  getAllOrders: catchAsync(async (req, res) => {
    const result = await orderService.getAllOrders(
      req.validatedQuery as OrderQuery
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Orders fetched successfully",
      data: result.orders,
      meta: result.meta,
    });
  }),

  getOrderById: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };

    const order = await orderService.getOrderById(
      params.id,
      req.user!.id,
      req.user!.role as string
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Order fetched successfully",
      data: order,
    });
  }),

  updateOrderStatus: catchAsync(async (req, res) => {
    const params = req.validatedParams as { id: string };
    const body = req.validatedBody as {
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    };

    const order = await orderService.updateOrderStatus(params.id, body.status);

    sendResponse({
      res,
      statusCode: 200,
      message: "Order status updated successfully",
      data: order,
    });
  }),
};