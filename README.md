# AI-Powered E-Commerce Marketplace Backend 🚀

A production-ready backend for an AI-powered e-commerce marketplace built with TypeScript, Express, Prisma, PostgreSQL, Better Auth, Stripe, Cloudinary, and an AI agent.

## ✨ Features

- **🤖 AI Agent Integration**: Intelligent search, product recommendations, and automated customer support powered by OpenAI.
- **🛡️ Secure Authentication**: Multi-strategy authentication using Better Auth (Social login, Email/Password).
- **💳 Payment Processing**: Seamless Stripe integration with support for checkouts and real-time webhook handling.
- **📦 Comprehensive Store Management**:
  - Advanced Product & Category management.
  - Multi-step Order workflow.
  - Real-time Inventory tracking.
- **🛒 Customer Experience**:
  - Robust Cart and Wishlist systems.
  - Interactive Product Reviews and ratings.
- **📊 Admin Dashboard**: High-level insights, analytics, and store management tools.
- **☁️ Media Uploads**: Secure image processing and storage via Cloudinary and Multer.
- **📰 Marketing & Engagement**: Newsletter subscriptions and Blog management.
- **💬 Support System**: Integrated customer support modules.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **AI**: [OpenAI API](https://openai.com/api/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm / pnpm / yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-ecommerce-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and populate it based on the configuration in `src/config/env.ts`:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:3000
   SERVER_URL=http://localhost:5000
   DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
   BETTER_AUTH_SECRET="your-20-character-secret"
   BETTER_AUTH_URL=http://localhost:5000
   
   # Optional Integrations
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   OPENAI_API_KEY=sk-...
   ```

4. **Database Initialization:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

5. **Run the application:**
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with hot-reload using `tsx`. |
| `npm run build` | Compiles TypeScript into the `dist` directory. |
| `npm run start` | Runs the production build from the `dist` directory. |
| `npm run prisma:generate` | Generates the Prisma client. |
| `npm run prisma:migrate` | Runs Prisma migrations in development mode. |
| `npm run prisma:deploy` | Applies migrations in production. |
| `npm run seed` | Seeds the database with initial data. |

---

## 🛣️ API Endpoints

All API routes are prefixed with `/api`.

- **Auth**: `/api/auth/*`
- **AI**: `/api/ai`
- **Users**: `/api/users`
- **Products**: `/api/products`
- **Categories**: `/api/categories`
- **Orders**: `/api/orders`
- **Payments**: `/api/payments`
- **Cart**: `/api/cart`
- **Wishlist**: `/api/wishlist`
- **Reviews**: `/api/reviews`
- **Dashboard**: `/api/dashboard`
- **Blogs**: `/api/blogs`
- **Newsletter**: `/api/newsletter`
- **Support**: `/api/support`
- **Uploads**: `/api/uploads`

---

## 📁 Project Structure

```text
src/
├── config/         # Environment variables & app config
├── lib/            # Shared libraries (Prisma, Auth, etc.)
├── middlewares/    # Custom Express middlewares
├── modules/        # Domain-driven modules (Features)
│   ├── ai-agent/
│   ├── products/
│   ├── users/
│   └── ...
├── routes/         # Central API routing
├── utils/          # Helper functions & classes
├── app.ts          # Express application setup
└── server.ts       # Entry point
```

---

## 🔒 Security

- **Helmet**: Secures Express apps by setting various HTTP headers.
- **CORS**: Cross-Origin Resource Sharing enabled with strict origin checks.
- **Rate Limiting**: Protection against brute-force and DoS attacks.
- **Validation**: Schema-based input validation using Zod.

---

## 📄 License

This project is [ISC](LICENSE) licensed.
