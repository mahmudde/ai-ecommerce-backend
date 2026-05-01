import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";

type GetCategoriesQuery = {
  search?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

type CreateCategoryPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
};

type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

const createUniqueSlug = async (name: string, existingId?: string) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (!existingCategory || existingCategory.id === existingId) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }
};

export const categoryService = {
  getCategories: async (query: GetCategoriesQuery) => {
    const { search, isActive, page, limit } = query;

    const where = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    };

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getCategoryById: async (id: string) => {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    return category;
  },

  createCategory: async (payload: CreateCategoryPayload) => {
    const existingCategory = await prisma.category.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (existingCategory) {
      throw new AppError(409, "Category name already exists");
    }

    const slug = await createUniqueSlug(payload.name);

    return prisma.category.create({
      data: {
        name: payload.name,
        slug,
        description: payload.description,
        imageUrl: payload.imageUrl,
        isActive: payload.isActive ?? true,
      },
    });
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload) => {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError(404, "Category not found");
    }

    if (payload.name && payload.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: {
          name: payload.name,
        },
      });

      if (duplicateCategory) {
        throw new AppError(409, "Category name already exists");
      }
    }

    const slug = payload.name
      ? await createUniqueSlug(payload.name, id)
      : existingCategory.slug;

    return prisma.category.update({
      where: { id },
      data: {
        ...payload,
        slug,
      },
    });
  },

  deleteCategory: async (id: string) => {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      throw new AppError(404, "Category not found");
    }

    if (existingCategory._count.products > 0) {
      throw new AppError(
        400,
        "Cannot delete category because it has products. Deactivate it instead."
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return null;
  },
};