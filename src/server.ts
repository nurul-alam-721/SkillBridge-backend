import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";
import cron from "node-cron";
import { autoCompleteBookings } from "./modules/bookings/booking.service";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    cron.schedule("*/30 * * * *", async () => {
      try {
        const updated = await autoCompleteBookings();
        if (updated.length > 0) {
          console.log(`[cron] Auto-completed ${updated.length} booking(s)`);
        }
      } catch (err) {
        console.error("[cron] autoCompleteBookings failed:", err);
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("An error occurred:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();