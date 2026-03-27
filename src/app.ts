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

const allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
  "http://localhost:4000",
  "https://skill-bridge-client-green.vercel.app",
];

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
  })
);

app.use(cookieParser());
app.use(express.json());

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