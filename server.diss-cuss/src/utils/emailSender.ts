import "dotenv/config";
import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD, // App password, not regular password
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  logger.info("Sending email to - " + to);
  const mailOptions = {
    from: `"Diss-cuss" <${process.env.MAILER_EMAIL}>`,
    to,
    subject,
    html,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        logger.error(err)
        reject(err);
      } else resolve(info);
    });
  });
}
