import OpenAI from "openai";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { aiTools } from "./ai.tools.js";

const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  : null;

const isOpenAIQuotaError = (error: unknown) => {
  if (typeof error !== "object" || error === null) return false;

  const maybeError = error as {
    status?: number;
    code?: string;
    message?: string;
  };

  return (
    maybeError.status === 429 ||
    maybeError.code === "insufficient_quota" ||
    maybeError.message?.toLowerCase().includes("quota")
  );
};

const generateFallbackProductSuggestion = (payload: {
  rawIdea: string;
  category?: string;
  targetAudience?: string;
  qualityLevel?: "budget" | "mid-range" | "premium";
}) => {
  return {
    suggestedName: "Smart " + payload.rawIdea.slice(0, 40),
    shortDescription:
      "A practical product designed for modern customers who value quality and everyday usability.",
    description:
      "This product is designed to provide a reliable and user-friendly experience. It focuses on useful features, durable quality, and strong value for customers.",
    suggestedPrice:
      payload.qualityLevel === "premium"
        ? 149.99
        : payload.qualityLevel === "budget"
          ? 19.99
          : 49.99,
    tags: ["smart", "popular", "new-arrival"],
    specifications: [
      {
        name: "Quality Level",
        value: payload.qualityLevel ?? "mid-range",
      },
      {
        name: "Target Audience",
        value: payload.targetAudience ?? "General customers",
      },
    ],
    note: "AI suggestions were unavailable, so fallback data was generated.",
  };
};

const extractBudget = (message: string) => {
  const match = message.match(/(?:under|below|less than|within|budget)\s*\$?(\d+)/i);
  return match ? Number(match[1]) : undefined;
};

const detectCategory = (message: string) => {
  const lower = message.toLowerCase();

  if (lower.includes("phone") || lower.includes("charger") || lower.includes("laptop") || lower.includes("headphone") || lower.includes("mouse")) {
    return "Electronics";
  }

  if (lower.includes("shirt") || lower.includes("bag") || lower.includes("fashion") || lower.includes("shoe")) {
    return "Fashion";
  }

  if (lower.includes("kitchen") || lower.includes("home") || lower.includes("dinner") || lower.includes("furniture")) {
    return "Home";
  }

  return undefined;
};

const buildProductAnswer = async (message: string, userId?: string) => {
  const lower = message.toLowerCase();
  const budget = extractBudget(message);
  const categoryName = detectCategory(message);

  let products;

  if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("for me")) {
    products = userId
      ? await aiTools.getPersonalizedRecommendations(userId, 5)
      : await aiTools.getTrendingProducts(5);
  } else if (lower.includes("top") || lower.includes("best") || lower.includes("trending") || lower.includes("popular")) {
    products = await aiTools.getTrendingProducts(5);
  } else {
    products = await aiTools.searchProducts({
      search: message,
      maxPrice: budget,
      categoryName,
      limit: 5,
    });
  }

  if (!products.length) {
    return {
      intent: "product_search",
      answer:
        "I could not find an exact product match. Try searching with a category, brand, or budget like 'headphones under $100'.",
      products: [],
    };
  }

  return {
    intent: "product_search",
    answer:
      "I found some products that match your request. I recommend checking the highest-rated and top-selling options first.",
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price,
      discountPrice: product.discountPrice,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      soldCount: product.soldCount,
      stock: product.stock,
      category: product.category,
      image: product.images[0]?.url ?? null,
      shortDescription: product.shortDescription,
    })),
  };
};

const buildSupportAnswer = async (message: string) => {
  const lower = message.toLowerCase();

  if (lower.includes("track") || lower.includes("order status")) {
    return {
      intent: "support",
      answer:
        "You can track your order from your dashboard under My Orders. Open an order to see its current status such as Pending, Processing, Shipped, or Delivered.",
      products: [],
    };
  }

  if (lower.includes("return") || lower.includes("refund")) {
    return {
      intent: "support",
      answer:
        "For returns or refunds, go to your order details page and contact support with your order number. Refunds are usually reviewed after checking payment and delivery status.",
      products: [],
    };
  }

  if (lower.includes("payment") || lower.includes("stripe") || lower.includes("card")) {
    return {
      intent: "support",
      answer:
        "Payments are processed securely through Stripe Checkout. If payment succeeds, your order will be marked as paid automatically after confirmation.",
      products: [],
    };
  }

  return {
    intent: "support",
    answer:
      "I can help with product search, order tracking, payment, refunds, and account support. Please tell me what you need help with.",
    products: [],
  };
};

export const aiService = {
  chat: async (message: string, userId?: string) => {
    await prisma.activityLog.create({
      data: {
        userId,
        type: "AI_CHAT",
        metadata: {
          message,
        },
      },
    });

    const lower = message.toLowerCase();

    const isSupport =
      lower.includes("track") ||
      lower.includes("refund") ||
      lower.includes("return") ||
      lower.includes("payment") ||
      lower.includes("order") ||
      lower.includes("support") ||
      lower.includes("cancel");

    if (isSupport) {
      return buildSupportAnswer(message);
    }

    return buildProductAnswer(message, userId);
  },

  getSearchSuggestions: async (query: string) => {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE" as const,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
          {
            brand: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
          {
            tags: {
              has: query,
            },
          },
        ],
      },
      take: 8,
      select: {
        name: true,
        brand: true,
        tags: true,
      },
    });

    const suggestions = new Set<string>();

    products.forEach((product) => {
      suggestions.add(product.name);
      suggestions.add(product.brand);
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return [...suggestions].slice(0, 8);
  },

  getRecommendations: async (userId: string) => {
    const products = await aiTools.getPersonalizedRecommendations(userId, 8);

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price,
      discountPrice: product.discountPrice,
      ratingAverage: product.ratingAverage,
      soldCount: product.soldCount,
      image: product.images[0]?.url ?? null,
      category: product.category,
    }));
  },

  getTrendingProducts: async () => {
    return aiTools.getTrendingProducts(8);
  },

  generateProductSuggestions: async (payload: {
    rawIdea: string;
    category?: string;
    targetAudience?: string;
    qualityLevel?: "budget" | "mid-range" | "premium";
  }) => {
    if (!openai) {
      return generateFallbackProductSuggestion(payload);
    }

    const prompt = `
You are an expert e-commerce product manager.

Generate professional product creation suggestions.

Product idea: ${payload.rawIdea}
Category: ${payload.category ?? "Not specified"}
Target audience: ${payload.targetAudience ?? "General customers"}
Quality level: ${payload.qualityLevel ?? "mid-range"}

Return ONLY valid JSON with this shape:
{
  "suggestedName": "string",
  "shortDescription": "string max 180 chars",
  "description": "string",
  "suggestedPrice": number,
  "tags": ["string"],
  "specifications": [{"name":"string","value":"string"}],
  "seoKeywords": ["string"]
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        return generateFallbackProductSuggestion(payload);
      }

      return JSON.parse(content);
    } catch (error) {
      return generateFallbackProductSuggestion(payload);
    }
  },


  getAdminInsights: async () => {
    const data = await aiTools.getAdminInsightData();

    const fallback = {
      summary:
        "AI insights are running in fallback mode because the AI provider is unavailable or quota-limited.",
      insights: [
        `Total revenue is $${data.revenue}.`,
        `There are ${data.pendingOrders} pending orders.`,
        `There are ${data.lowStockProducts.length} low-stock products.`,
        `There are ${data.totalUsers} registered users.`,
      ],
      risks: [
        data.lowStockProducts.length > 0
          ? "Some products are low in stock and may need restocking soon."
          : "No immediate low-stock risk detected.",
        data.pendingOrders > 0
          ? "Pending orders should be reviewed to avoid fulfillment delays."
          : "No pending order backlog detected.",
      ],
      recommendedActions: [
        "Review top-selling products and keep enough stock available.",
        "Check pending orders regularly.",
        "Promote high-rated products on the homepage.",
      ],
      data,
    };

    if (!openai) {
      return fallback;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `
Analyze this e-commerce dashboard data and return concise admin insights.

Data:
${JSON.stringify(data, null, 2)}

Return ONLY valid JSON:
{
  "summary": "string",
  "insights": ["string"],
  "risks": ["string"],
  "recommendedActions": ["string"]
}
`,
          },
        ],
        temperature: 0.4,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        return fallback;
      }

      return JSON.parse(content);
    } catch {
      return fallback;
    }
  },
};