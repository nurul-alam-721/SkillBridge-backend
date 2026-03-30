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

const app: Application = express();

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://skill-bridge-client-green.vercel.app",
        "http://localhost:3000",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

app.use(cookieParser());
app.use(express.json());

app.set("trust proxy", true);

app.all("/api/auth/*path", toNodeHandler(auth));

app.use("/api/users", userRoutes);
app.use("/api/me", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api", AvailabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/", AdminRoutes);

app.get("/", (req, res) => {
  res.send("Hello from SkillBridge!");
});

app.use(notFound);
app.use(errorHandler);

export default app;
