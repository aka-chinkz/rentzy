import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_FROM } = process.env;

async function main() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Missing SMTP config in backend/.env");
    console.error("Add SMTP_HOST, SMTP_USER, and SMTP_PASS (see .env comments)");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587", 10),
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  console.log("Verifying SMTP connection...");
  await transporter.verify();
  console.log("SMTP OK. Sending test email...");

  const to = process.argv[2] || SMTP_USER;
  await transporter.sendMail({
    from: SMTP_FROM || `Rentzy <${SMTP_USER}>`,
    to,
    subject: "Rentzy — SMTP test",
    text: "If you received this, password reset emails will work.",
    html: "<p>If you received this, <strong>password reset emails will work</strong>.</p>",
  });

  console.log(`Test email sent to ${to}`);
}

main().catch((err) => {
  console.error("Email test failed:", err.message);
  process.exit(1);
});
