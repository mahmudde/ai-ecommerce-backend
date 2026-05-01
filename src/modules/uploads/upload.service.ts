import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../config/cloudinary.js";
import { AppError } from "../../utils/AppError.js";

type UploadedImageResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

const uploadBufferToCloudinary = async (
  file: Express.Multer.File,
  folder = "shopai/products"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new AppError(500, error?.message || "Cloudinary upload failed")
          );
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const uploadService = {
  uploadProductImages: async (
    files: Express.Multer.File[]
  ): Promise<UploadedImageResult[]> => {
    if (!files || files.length === 0) {
      throw new AppError(400, "At least one image is required");
    }

    if (files.length > 6) {
      throw new AppError(400, "You can upload maximum 6 images at a time");
    }

    const uploadedImages = await Promise.all(
      files.map((file) => uploadBufferToCloudinary(file))
    );

    return uploadedImages.map((image) => ({
      url: image.secure_url,
      publicId: image.public_id,
      width: image.width,
      height: image.height,
      format: image.format,
      bytes: image.bytes,
    }));
  },

  deleteImage: async (publicId: string) => {
    if (!publicId) {
      throw new AppError(400, "Image publicId is required");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new AppError(500, "Failed to delete image from Cloudinary");
    }

    return result;
  },
};