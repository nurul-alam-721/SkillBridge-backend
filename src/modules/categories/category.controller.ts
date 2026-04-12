import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await CategoryService.getAllCategories();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Categories fetched successfully",
    data: categories,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await CategoryService.getCategoryById(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Category fetched successfully",
    data: category,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const category = await CategoryService.createCategory(name, description);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const category = await CategoryService.updateCategory(id as string, name, description);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CategoryService.deleteCategory(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
});

export const CategoryController = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
