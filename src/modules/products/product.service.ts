
import { Prisma, ProductStatus } from "../../../prisma/generated/prisma/client/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";

type ProductQuery = {
  search?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  sort: string;
  page: number;
  limit: number;
};

type ProductPayload = {
  name: string;
  shortDescription: string;
  description: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: string;
  tags: string[];
  images: {
    url: string;
    publicId: string;
    altText?: string;
  }[];
  specifications?: {
    name: string;
    value: string;
  }[];
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
};

const createUniqueSlug = async (name: string, existingId?: string) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (!existingProduct || existingProduct.id === existingId) {
      return slug;
    }

    slug = `${baseSlug}-${count}`;
    count++;
  }
};

const getProductOrderBy = (sort: string): Prisma.ProductOrderByWithRelationInput => {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "price-low":
      return { price: "asc" };
    case "price-high":
      return { price: "desc" };
    case "rating":
      return { ratingAverage: "desc" };
    case "top-selling":
      return { soldCount: "desc" };
    case "most-viewed":
      return { viewCount: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};

export const productService = {
  getProducts: async (query: ProductQuery, viewerRole?: string) => {
    const {
      search,
      categoryId,
      brand,
      minPrice,
      maxPrice,
      minRating,
      status,
      sort,
      page,
      limit,
    } = query;

    const where: Prisma.ProductWhereInput = {
      ...(viewerRole === "ADMIN" || viewerRole === "MANAGER"
        ? status
          ? { status: status as any }
          : {}
        : { status: "ACTIVE" as const }),
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
                shortDescription: {
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
              {
                brand: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                tags: {
                  has: search.toLowerCase(),
                },
              },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(brand
        ? {
            brand: {
              contains: brand,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(minRating ? { ratingAverage: { gte: minRating } } : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: new Prisma.Decimal(minPrice) } : {}),
              ...(maxPrice ? { lte: new Prisma.Decimal(maxPrice) } : {}),
            },
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: getProductOrderBy(sort),
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            take: 1,
            orderBy: {
              createdAt: "asc",
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getProductBySlug: async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        specifications: true,
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product || product.status !== "ACTIVE") {
      throw new AppError(404, "Product not found");
    }

    // Increment view count asynchronously
    prisma.product
      .update({
        where: { id: product.id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
      .catch((err) => console.error("Failed to increment view count:", err));

    return product;
  },

  getRelatedProducts: async (id: string) => {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        brand: true,
        tags: true,
      },
    });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    return prisma.product.findMany({
      where: {
        id: {
          not: product.id,
        },
        status: "ACTIVE",
        OR: [
          { categoryId: product.categoryId },
          { brand: product.brand },
          {
            tags: {
              hasSome: product.tags,
            },
          },
        ],
      },
      take: 8,
      orderBy: [{ ratingAverage: "desc" }, { soldCount: "desc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          take: 1,
        },
      },
    });
  },

  getTrendingProducts: async () => {
    return prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: [{ soldCount: "desc" }, { viewCount: "desc" }, { ratingAverage: "desc" }],
      take: 12,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          take: 1,
        },
      },
    });
  },

  createProduct: async (payload: ProductPayload, createdById: string) => {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    const slug = await createUniqueSlug(payload.name);

    return prisma.product.create({
      data: {
        name: payload.name,
        slug,
        shortDescription: payload.shortDescription,
        description: payload.description,
        brand: payload.brand,
        price: new Prisma.Decimal(payload.price),
        discountPrice: payload.discountPrice
          ? new Prisma.Decimal(payload.discountPrice)
          : null,
        stock: payload.stock,
        categoryId: payload.categoryId,
        tags: payload.tags,
        status: (payload.status as ProductStatus) ?? ("ACTIVE" as const),
        createdById,
        images: {
          create: payload.images,
        },
        specifications: {
          create: payload.specifications ?? [],
        },
      },
      include: {
        category: true,
        images: true,
        specifications: true,
      },
    });
  },

  updateProduct: async (id: string, payload: Partial<ProductPayload>, userId: string, role: string) => {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        specifications: true,
      },
    });

    if (!existingProduct) {
      throw new AppError(404, "Product not found");
    }

    if (role === "MANAGER" && existingProduct.createdById !== userId) {
      throw new AppError(403, "Managers can only update their own products");
    }

    if (payload.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: payload.categoryId,
        },
      });

      if (!category) {
        throw new AppError(404, "Category not found");
      }
    }

    const slug = payload.name
      ? await createUniqueSlug(payload.name, id)
      : existingProduct.slug;

    return prisma.product.update({
      where: { id },
      data: {
        ...(payload.name ? { name: payload.name, slug } : {}),
        ...(payload.shortDescription ? { shortDescription: payload.shortDescription } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.brand ? { brand: payload.brand } : {}),
        ...(payload.price !== undefined
          ? { price: new Prisma.Decimal(payload.price) }
          : {}),
        ...(payload.discountPrice !== undefined
          ? {
              discountPrice: payload.discountPrice
                ? new Prisma.Decimal(payload.discountPrice)
                : null,
            }
          : {}),
        ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
        ...(payload.categoryId ? { categoryId: payload.categoryId } : {}),
        ...(payload.tags ? { tags: payload.tags } : {}),
        ...(payload.status ? { status: payload.status as ProductStatus } : {}),
        ...(payload.images
          ? {
              images: {
                deleteMany: {},
                create: payload.images,
              },
            }
          : {}),
        ...(payload.specifications
          ? {
              specifications: {
                deleteMany: {},
                create: payload.specifications,
              },
            }
          : {}),
      },
      include: {
        category: true,
        images: true,
        specifications: true,
      },
    });
  },

  deleteProduct: async (id: string) => {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          take: 1,
        },
      },
    });

    if (!existingProduct) {
      throw new AppError(404, "Product not found");
    }

    if (existingProduct.orderItems.length > 0) {
      return prisma.product.update({
        where: { id },
        data: {
          status: "ARCHIVED" as const,
        },
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return null;
  },
};