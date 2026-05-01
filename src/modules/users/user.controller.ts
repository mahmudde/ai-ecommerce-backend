import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const getMe = catchAsync(async (req, res) => {
  sendResponse({
    res,
    statusCode: 200,
    message: "Current user fetched successfully",
    data: {
      user: req.user,
      session: req.authSession,
    },
  });
});