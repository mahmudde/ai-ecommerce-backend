import { Prisma } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";

type CreateBlogPayload = {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  isPublished?: boolean;
};

type UpdateBlogPayload = Partial<CreateBlogPayload>;

type BlogQuery = {
  search?: string;
  isPublished?: boolean;
  page: number;
  limit: number;
};

const createUniqueSlug = async (title: string, existingId?: string) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existingBlog = await prisma.blog.findUnique({
      where: {
        slug,
      },
    });

    if (!existingBlog || existingBlog.id === existingId) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }
};

export const blogService = {
  getBlogs: async (query: BlogQuery, viewerRole?: string) => {
    const { search, isPublished, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogWhereInput = {
      ...(viewerRole === "ADMIN"
        ? typeof isPublished === "boolean"
          ? { isPublished }
          : {}
        : { isPublished: true }),

      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                excerpt: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                content: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.blog.count({
        where,
      }),
    ]);

    return {
      blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getBlogBySlug: async (slug: string, viewerRole?: string) => {
    const blog = await prisma.blog.findUnique({
      where: {
        slug,
      },
    });

    if (!blog) {
      throw new AppError(404, "Blog not found");
    }

    if (!blog.isPublished && viewerRole !== "ADMIN") {
      throw new AppError(404, "Blog not found");
    }

    return blog;
  },

  createBlog: async (payload: CreateBlogPayload) => {
    const slug = await createUniqueSlug(payload.title);

    return prisma.blog.create({
      data: {
        title: payload.title,
        slug,
        excerpt: payload.excerpt,
        content: payload.content,
        coverImage: payload.coverImage,
        isPublished: payload.isPublished ?? false,
      },
    });
  },

  updateBlog: async (id: string, payload: UpdateBlogPayload) => {
    const existingBlog = await prisma.blog.findUnique({
      where: {
        id,
      },
    });

    if (!existingBlog) {
      throw new AppError(404, "Blog not found");
    }

    const slug = payload.title
      ? await createUniqueSlug(payload.title, id)
      : existingBlog.slug;

    return prisma.blog.update({
      where: {
        id,
      },
      data: {
        ...payload,
        slug,
      },
    });
  },

  deleteBlog: async (id: string) => {
    const existingBlog = await prisma.blog.findUnique({
      where: {
        id,
      },
    });

    if (!existingBlog) {
      throw new AppError(404, "Blog not found");
    }

    await prisma.blog.delete({
      where: {
        id,
      },
    });

    return null;
  },
};