import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAdminEmail(subject: string, text: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP credentials not found. Skipping email.");
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "25mx336@psgtech.ac.in",
      subject,
      text,
    });
    console.log("Email sent to admin");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
