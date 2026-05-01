import { auth } from "../src/lib/auth.js";
import { prisma } from "../src/lib/prisma.js";

type DemoUser = {
  name: string;
  email: string;
  password: string;
  role: "USER" | "MANAGER" | "ADMIN";
};

const demoUsers: DemoUser[] = [
  {
    name: "Mahmud Demo User",
    email: "user.demo@shopai.com",
    password: "User@123456",
    role: "USER",
  },
  {
    name: "ShopAI Demo Manager",
    email: "manager.demo@shopai.com",
    password: "Manager@123456",
    role: "MANAGER",
  },
  {
    name: "ShopAI Demo Admin",
    email: "admin.demo@shopai.com",
    password: "Admin@123456",
    role: "ADMIN",
  },
];

const seedDemoUser = async (demoUser: DemoUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: demoUser.email,
    },
  });

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: {
        name: demoUser.name,
        email: demoUser.email,
        password: demoUser.password,
      },
    });

    console.log(`Created auth user: ${demoUser.email}`);
  } else {
    console.log(`User already exists: ${demoUser.email}`);
  }

  const updatedUser = await prisma.user.update({
    where: {
      email: demoUser.email,
    },
    data: {
      role: demoUser.role,
      status: "ACTIVE",
      emailVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
    },
  });

  console.log(`Seeded ${updatedUser.role}: ${updatedUser.email}`);
};

const seedCategories = async () => {
  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      description:
        "Smart devices, accessories, and modern electronics for everyday life.",
      imageUrl:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661",
    },
    {
      name: "Fashion",
      slug: "fashion",
      description:
        "Modern clothing, footwear, and accessories for men and women.",
      imageUrl:
        "https://images.unsplash.com/photo-1445205170230-053b83016050",
    },
    {
      name: "Home & Living",
      slug: "home-living",
      description:
        "Furniture, decor, kitchen essentials, and home improvement products.",
      imageUrl:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    },
    {
      name: "Beauty & Care",
      slug: "beauty-care",
      description:
        "Skincare, grooming, wellness, and personal care essentials.",
      imageUrl:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    },
    {
      name: "Sports & Fitness",
      slug: "sports-fitness",
      description:
        "Fitness gear, sports accessories, and active lifestyle products.",
      imageUrl:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: category,
      create: category,
    });

    console.log(`Seeded category: ${category.name}`);
  }
};

const seedProducts = async () => {
  const admin = await prisma.user.findUnique({
    where: {
      email: "admin.demo@shopai.com",
    },
  });

  const electronics = await prisma.category.findUnique({
    where: {
      slug: "electronics",
    },
  });

  const fashion = await prisma.category.findUnique({
    where: {
      slug: "fashion",
    },
  });

  const home = await prisma.category.findUnique({
    where: {
      slug: "home-living",
    },
  });

  if (!admin || !electronics || !fashion || !home) {
    throw new Error("Required admin or categories not found for product seeding");
  }

  const products = [
    {
      name: "AeroSound Pro Wireless Headphones",
      slug: "aerosound-pro-wireless-headphones",
      shortDescription:
        "Noise-reducing wireless headphones with rich bass and 40-hour battery life.",
      description:
        "AeroSound Pro is designed for music lovers, students, remote workers, and travelers who need clear audio, strong battery life, and comfortable all-day wear.",
      brand: "AeroSound",
      price: "89.99",
      discountPrice: "74.99",
      stock: 42,
      soldCount: 180,
      viewCount: 940,
      ratingAverage: 4.7,
      ratingCount: 86,
      tags: ["headphones", "wireless", "audio", "top-selling"],
      categoryId: electronics.id,
      createdById: admin.id,
      specifications: [
        { name: "Battery Life", value: "Up to 40 hours" },
        { name: "Connectivity", value: "Bluetooth 5.3" },
        { name: "Charging", value: "USB-C fast charging" },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
          publicId: "seed/aerosound-pro",
          altText: "AeroSound Pro wireless headphones",
        },
      ],
    },
    {
      name: "VoltEdge RGB Wireless Gaming Mouse",
      slug: "voltedge-rgb-wireless-gaming-mouse",
      shortDescription:
        "Low-latency wireless gaming mouse with RGB lighting and ergonomic grip.",
      description:
        "VoltEdge RGB Wireless Gaming Mouse gives gamers responsive movement, customizable lighting, and a lightweight ergonomic build for long gaming sessions.",
      brand: "VoltEdge",
      price: "39.99",
      discountPrice: "34.99",
      stock: 65,
      soldCount: 230,
      viewCount: 1300,
      ratingAverage: 4.6,
      ratingCount: 112,
      tags: ["gaming", "mouse", "wireless", "rgb", "top-selling"],
      categoryId: electronics.id,
      createdById: admin.id,
      specifications: [
        { name: "DPI", value: "Up to 12000 DPI" },
        { name: "Connectivity", value: "2.4GHz Wireless" },
        { name: "Battery Life", value: "Up to 70 hours" },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1527814050087-3793815479db",
          publicId: "seed/voltedge-rgb-mouse",
          altText: "RGB wireless gaming mouse",
        },
      ],
    },
    {
      name: "UrbanFlex Everyday Backpack",
      slug: "urbanflex-everyday-backpack",
      shortDescription:
        "Water-resistant backpack with laptop storage and travel-friendly compartments.",
      description:
        "UrbanFlex Everyday Backpack is built for students, professionals, and travelers who need organized storage, durable fabric, and a clean modern design.",
      brand: "UrbanFlex",
      price: "54.99",
      discountPrice: "44.99",
      stock: 38,
      soldCount: 95,
      viewCount: 620,
      ratingAverage: 4.5,
      ratingCount: 54,
      tags: ["backpack", "travel", "fashion", "laptop"],
      categoryId: fashion.id,
      createdById: admin.id,
      specifications: [
        { name: "Material", value: "Water-resistant polyester" },
        { name: "Laptop Fit", value: "Up to 15.6 inches" },
        { name: "Compartments", value: "8 organized pockets" },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
          publicId: "seed/urbanflex-backpack",
          altText: "UrbanFlex everyday backpack",
        },
      ],
    },
    {
      name: "PureNest Ceramic Dinner Set",
      slug: "purenest-ceramic-dinner-set",
      shortDescription:
        "Minimal ceramic dinnerware set for elegant everyday dining.",
      description:
        "PureNest Ceramic Dinner Set brings a clean, durable, and modern look to your dining table with plates and bowls suitable for daily meals and special gatherings.",
      brand: "PureNest",
      price: "69.99",
      discountPrice: "59.99",
      stock: 24,
      soldCount: 76,
      viewCount: 410,
      ratingAverage: 4.4,
      ratingCount: 39,
      tags: ["dinnerware", "home", "ceramic", "kitchen"],
      categoryId: home.id,
      createdById: admin.id,
      specifications: [
        { name: "Material", value: "Glazed ceramic" },
        { name: "Pieces", value: "16-piece set" },
        { name: "Care", value: "Dishwasher safe" },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0",
          publicId: "seed/purenest-dinner-set",
          altText: "Ceramic dinner set",
        },
      ],
    },
  ];

  for (const product of products) {
    const { images, specifications, ...productData } = product;

    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        ...productData,
        images: {
          deleteMany: {},
          create: images,
        },
        specifications: {
          deleteMany: {},
          create: specifications,
        },
      },
      create: {
        ...productData,
        images: {
          create: images,
        },
        specifications: {
          create: specifications,
        },
      },
    });

    console.log(`Seeded product: ${product.name}`);
  }
};

const main = async () => {
  console.log("Starting database seed...");

  for (const demoUser of demoUsers) {
    await seedDemoUser(demoUser);
  }

  await seedCategories();
  await seedProducts();

  console.log("Database seed completed successfully.");
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  