import { Router } from "express";
import { userRoutes } from "../modules/users/user.route.js";
import { categoryRoutes } from "../modules/categories/category.route.js";
import { productRoutes } from "../modules/products/product.route.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

export default router;