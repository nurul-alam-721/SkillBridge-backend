import "dotenv/config";
import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFound } from "./middlewares/notFound";
import { tutorRoutes } from "./modules/tutorProfiles/tutor.route";
import { userRoutes } from "./modules/users/user.route";
import errorHandler from "./helpers/globalErrorHandler";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/categories/category.route";
import { AvailabilityRoutes } from "./modules/availabilitySlot/availability.route";
import { bookingRoutes } from "./modules/bookings/booking.route";
import { reviewRoutes } from "./modules/reviews/review.route";
import { AdminRoutes } from "./modules/admin/admin.route";
import { paymentRoutes } from "./modules/payments/payment.route";

const app: Application = express();

const allowedOrigins = [
  process.env.FRONTEND_URL!,
  "https://skill-bridge-client-green.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());

app.set("trust proxy", true);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.all("/api/auth/*path", toNodeHandler(auth));

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/me", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/tutor/availability", AvailabilityRoutes);
app.use("/api/availability-slots", AvailabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", AdminRoutes);

app.get("/", (req, res) => {
  res.send("Hello from SkillBridge!");
});

app.use(notFound);
app.use(errorHandler);

export default app;