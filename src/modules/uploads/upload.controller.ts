import { uploadService } from "./upload.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../utils/AppError.js";

export const uploadController = {
  uploadProductImages: catchAsync(async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new AppError(400, "Please upload at least one image");
    }

    const images = await uploadService.uploadProductImages(files);

    sendResponse({
      res,
      statusCode: 201,
      message: "Product images uploaded successfully",
      data: images,
    });
  }),

  deleteProductImage: catchAsync(async (req, res) => {
    const { publicId } = req.body as { publicId?: string };

    if (!publicId) {
      throw new AppError(400, "publicId is required");
    }

    const result = await uploadService.deleteImage(publicId);

    sendResponse({
      res,
      statusCode: 200,
      message: "Product image deleted successfully",
      data: result,
    });
  }),
};