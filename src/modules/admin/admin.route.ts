import express, { Router } from "express";
import { AdminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = express.Router();

router.get("/admin/stats", auth(UserRole.ADMIN), AdminController.getStats);
router.get(
  "/admin/bookings",
  auth(UserRole.ADMIN),
  AdminController.getAllBookings,
);
router.get("/admin/users", auth(UserRole.ADMIN), AdminController.getAllUsers);

router.patch(
  "/admin/users/:id/status",
  auth(UserRole.ADMIN),
  AdminController.updateUserStatus,
);

export const AdminRoutes: Router = router; 
