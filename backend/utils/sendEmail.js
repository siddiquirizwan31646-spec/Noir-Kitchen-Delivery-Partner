// utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // swap for any SMTP provider (SendGrid, Mailgun, SES, etc.)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail: use an App Password, not your real password
  },
});

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Your Delivery Partner login code",
    html: `
      <div style="font-family:sans-serif; padding:24px; color:#1a1a1a;">
        <h2 style="margin:0 0 8px;">Delivery Partner Login</h2>
        <p style="color:#666; margin:0 0 20px;">
          Use the code below to sign in. It expires in 5 minutes.
        </p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px;
                    background:#f4f3ec; padding:14px 20px; border-radius:10px;
                    display:inline-block;">
          ${otp}
        </div>
        <p style="color:#999; font-size:12px; margin-top:20px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = sendOtpEmail;