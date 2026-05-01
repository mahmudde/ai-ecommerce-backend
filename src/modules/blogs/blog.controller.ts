import { blogService } from "./blog.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

type BlogQuery = {
  search?: string;
  isPublished?: boolean;
  page: number;
  limit: number;
};

export const blogController = {
  getBlogs: catchAsync(async (req, res) => {
    const result = await blogService.getBlogs(
      req.validatedQuery as BlogQuery,
      req.user?.role as string | undefined
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Blogs fetched successfully",
      data: result.blogs,
      meta: result.meta,
    });
  }),

  getBlogBySlug: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      slug: string;
    };

    const blog = await blogService.getBlogBySlug(
      params.slug,
      req.user?.role as string | undefined
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Blog fetched successfully",
      data: blog,
    });
  }),

  createBlog: catchAsync(async (req, res) => {
    const blog = await blogService.createBlog(
      req.validatedBody as {
        title: string;
        excerpt: string;
        content: string;
        coverImage?: string;
        isPublished?: boolean;
      }
    );

    sendResponse({
      res,
      statusCode: 201,
      message: "Blog created successfully",
      data: blog,
    });
  }),

  updateBlog: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      id: string;
    };

    const blog = await blogService.updateBlog(
      params.id,
      req.validatedBody as {
        title?: string;
        excerpt?: string;
        content?: string;
        coverImage?: string;
        isPublished?: boolean;
      }
    );

    sendResponse({
      res,
      statusCode: 200,
      message: "Blog updated successfully",
      data: blog,
    });
  }),

  deleteBlog: catchAsync(async (req, res) => {
    const params = req.validatedParams as {
      id: string;
    };

    await blogService.deleteBlog(params.id);

    sendResponse({
      res,
      statusCode: 200,
      message: "Blog deleted successfully",
      data: null,
    });
  }),
};