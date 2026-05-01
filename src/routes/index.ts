import { Router } from "express";
import { userRoutes } from "../modules/users/user.route.js";
import { categoryRoutes } from "../modules/categories/category.route.js";
import { productRoutes } from "../modules/products/product.route.js";
import { uploadRoutes } from "../modules/uploads/upload.route.js";
import { cartRoutes } from "../modules/cart/cart.route.js";
import { orderRoutes } from "../modules/order/order.route.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/uploads", uploadRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

export default router;