import { newsletterService } from "./newsletter.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type NewsletterQuery = {
  search?: string;
  page: number;
  limit: number;
};

export const newsletterController = {
  subscribe: catchAsync(async (req, res) => {
    const body = req.validatedBody as {
      email: string;
    };

    const subscriber = await newsletterService.subscribe(body.email);

    sendResponse({
      res,
      statusCode: 201,
      message: "Newsletter subscription successful",
      data: subscriber,
    });
  }),

  getSubscribers: catchAsync(async (req, res) => {
    const result = await newsletterService.getSubscribers(
      req.validatedQuery as NewsletterQuery
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Newsletter subscribers fetched successfully",
      data: result.subscribers,
      meta: result.meta,
    });
  }),

  deleteSubscriber: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      id: string;
    };

    await newsletterService.deleteSubscriber(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Newsletter subscriber deleted successfully",
      data: null,
    });
  }),
};