import { userService } from "./user.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type UsersQuery = {
  search?: string;
  role?: "USER" | "MANAGER" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
  page: number;
  limit: number;
};

export const getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user!.id);

  sendResponse({
    res,
    statusCode: 200,
    message: "Current user fetched successfully",
    data: user,
  });
});

export const updateMyProfile = catchAsync(async (req, res) => {
  const user = await userService.updateMyProfile(
    req.user!.id,
    req.validatedBody as {
      name?: string;
      phone?: string;
      image?: string;
      street?: string;
      city?: string;
      country?: string;
      postalCode?: string;
    }
  );

  sendResponse({
    res,
    statusCode: 200,
    message: "Profile updated successfully",
    data: user,
  });
});

export const getUsers = catchAsync(async (req, res) => {
  const result = await userService.getUsers(req.validatedQuery as UsersQuery);

  sendResponse({
    res,
    statusCode: 200,
    message: "Users fetched successfully",
    data: result.users,
    meta: result.meta,
  });
});

export const getUserById = catchAsync(async (req, res) => {
  const params = req.validatedParams as {
    id: string;
  };

  const user = await userService.getUserById(params.id);

  sendResponse({
    res,
    statusCode: 200,
    message: "User fetched successfully",
    data: user,
  });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const params = req.validatedParams as {
    id: string;
  };

  const body = req.validatedBody as {
    role: "USER" | "MANAGER" | "ADMIN";
  };

  const user = await userService.updateUserRole(
    params.id,
    body.role,
    req.user!.id
  );

  sendResponse({
    res,
    statusCode: 200,
    message: "User role updated successfully",
    data: user,
  });
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const params = req.validatedParams as {
    id: string;
  };

  const body = req.validatedBody as {
    status: "ACTIVE" | "BLOCKED";
  };

  const user = await userService.updateUserStatus(
    params.id,
    body.status,
    req.user!.id
  );

  sendResponse({
    res,
    statusCode: 200,
    message: "User status updated successfully",
    data: user,
  });
});