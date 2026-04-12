import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = express.Router();

router.get("/", CategoryController.getAllCategories);

router.get("/:id", CategoryController.getCategoryById);

router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

router.put(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory
);

router.delete("/:id", auth(UserRole.ADMIN), CategoryController.deleteCategory);

export const categoryRoutes: Router = router;
