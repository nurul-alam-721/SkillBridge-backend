import express, { Router } from "express";
import { AdminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router: Router = express.Router();

router.get("/stats", auth(UserRole.ADMIN), AdminController.getStats);
router.get(
  "/bookings",
  auth(UserRole.ADMIN),
  AdminController.getAllBookings,
);
router.get("/users", auth(UserRole.ADMIN), AdminController.getAllUsers);

router.patch(
  "/users/:id/status",
  auth(UserRole.ADMIN),
  AdminController.updateUserStatus,
);

export const AdminRoutes: Router = router; 
