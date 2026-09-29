"use strict";

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER && process.env.SMTP_USER !== "your-smtp-user"
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    : undefined,
});

const sendEmail = async ({ to, subject, html }) => {
  // Log OTP Code to terminal console for local development & testing
  const otpMatch = String(html || "").match(/<h1[^>]*>(\d{6})<\/h1>/i);
  if (otpMatch) {
    console.log(`\n======================================================`);
    console.log(`[OTP VERIFIKASI LOG] Email: ${to} | Kode OTP: ${otpMatch[1]}`);
    console.log(`======================================================\n`);
  }

  const isExampleHost = !process.env.SMTP_HOST || process.env.SMTP_HOST.includes("example.com") || process.env.SMTP_USER === "your-smtp-user";

  if (isExampleHost) {
    console.log(`[MAILER INFO] SMTP Server belum dikonfigurasi aktif (${process.env.SMTP_HOST}). Kode OTP dicetak di terminal di atas.`);
    return { messageId: "dev-simulated-ok" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[MAILER SUCCESS] Email berhasil dikirim ke ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.warn(`[MAILER WARNING] Gagal mengirim email via SMTP ke ${to} (${error.message}). Kode OTP dicetak di terminal di atas.`);
    return { messageId: "dev-error-fallback", error: error.message };
  }
};

module.exports = sendEmail;
