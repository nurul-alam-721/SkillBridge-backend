import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  server_url: process.env.SERVER_URL,
  frontend_url: process.env.FRONTEND_URL,
  better_auth_url: process.env.BETTER_AUTH_URL,
  better_auth_secret: process.env.BETTER_AUTH_SECRET,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,

  admin_email: process.env.ADMIN_EMAIL,
  admin_name: process.env.ADMIN_NAME,
  admin_password: process.env.ADMIN_PASSWORD,
};
