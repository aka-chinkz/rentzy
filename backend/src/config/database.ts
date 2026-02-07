import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Missing DATABASE_URL environment variable!");
  console.error("Please create a .env file in the backend folder with:");
  console.error("  DATABASE_URL=postgresql://user:password@host/database?sslmode=require");
  console.error("");
  console.error("Get this from: https://neon.tech -> Your Project -> Connection Details");
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.query("SELECT NOW()")
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

export default pool;
