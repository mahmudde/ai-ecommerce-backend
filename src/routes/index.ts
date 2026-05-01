import { Router } from "express";
import { userRoutes } from "../modules/users/user.route.js";
import { categoryRoutes } from "../modules/categories/category.route.js";
import { productRoutes } from "../modules/products/product.route.js";
import { uploadRoutes } from "../modules/uploads/upload.route.js";
import { cartRoutes } from "../modules/cart/cart.route.js";
import { orderRoutes } from "../modules/order/order.route.js";
import { paymentRoutes } from "../modules/payments/payment.route.js";
import { reviewRoutes } from "../modules/reviews/review.route.js";
import { dashboardRoutes } from "../modules/dashboard/dashboard.route.js";
import { aiRoutes } from "../modules/ai-agent/ai.route.js";
import { wishlistRoutes } from "../modules/wishlist/wishlist.route.js";
import { supportRoutes } from "../modules/support/support.route.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/uploads", uploadRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ai", aiRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/support", supportRoutes);

export default router;