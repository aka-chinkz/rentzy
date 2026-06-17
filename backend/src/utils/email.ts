import nodemailer from "nodemailer";

const smtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
);

const isProduction = process.env.NODE_ENV === "production";

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export function isEmailConfigured(): boolean {
  return smtpConfigured;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ delivered: boolean }> {
  const from = process.env.SMTP_FROM || "Rentzy <noreply@rentzy.local>";

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
      <h2 style="color: #18181b;">Reset your Rentzy password</h2>
      <p>We received a request to reset the password for your account.</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Reset Password
        </a>
      </p>
      <p style="color: #71717a; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      <p style="color: #71717a; font-size: 12px; word-break: break-all;">${resetUrl}</p>
    </div>
  `;

  const text = `Reset your Rentzy password\n\nOpen this link to choose a new password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

  if (!transporter) {
    if (!isProduction) {
      console.log("\n========================================");
      console.log(`[password-reset] SMTP not configured`);
      console.log(`Reset link for ${to}:`);
      console.log(resetUrl);
      console.log("========================================\n");
      return { delivered: false };
    }
    throw new Error("Email service is not configured");
  }

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your Rentzy password",
    text,
    html,
  });

  return { delivered: true };
}
