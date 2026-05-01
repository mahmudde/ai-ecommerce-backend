import { supportService } from "./support.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type SupportMessageQuery = {
  search?: string;
  isResolved?: boolean;
  page: number;
  limit: number;
};

export const supportController = {
  createMessage: catchAsync(async (req, res) => {
    const message = await supportService.createMessage(
      req.validatedBody as {
        name: string;
        email: string;
        subject: string;
        message: string;
      }
    );

    sendResponse({
      res,
      statusCode: 201,
      message: "Support message sent successfully",
      data: message,
    });
  }),

  getMessages: catchAsync(async (req, res) => {
    const result = await supportService.getMessages(
      req.validatedQuery as SupportMessageQuery
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Support messages fetched successfully",
      data: result.messages,
      meta: result.meta,
    });
  }),

  getMessageById: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      id: string;
    };

    const message = await supportService.getMessageById(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Support message fetched successfully",
      data: message,
    });
  }),

  resolveMessage: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      id: string;
    };

    const message = await supportService.resolveMessage(
      params.id,
      req.validatedBody as {
        isResolved: boolean;
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: message.isResolved
        ? "Support message marked as resolved"
        : "Support message marked as unresolved",
      data: message,
    });
  }),

  deleteMessage: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      id: string;
    };

    await supportService.deleteMessage(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Support message deleted successfully",
      data: null,
    });
  }),
};