const nodemailer = require("nodemailer");

let cachedTransporter = null;

// Create transporter for Gmail (real) or Ethereal (test)
const createTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log(" Using Gmail for real email delivery");
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // must be 16-char App Password
      },
    });
  } else {
    console.log(" Using Ethereal for testing emails");
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return cachedTransporter;
};

//  Send link to receiver 
const sendDownloadLink = async ({ to, link, originalName, expiryHours }) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"File Transfer App" <${process.env.GMAIL_USER || "no-reply@test.com"}>`,
      to,
      subject: "📥 File Link",
      html: `
        <p>Hello,</p>
        <p>You have received a file: <strong>${originalName}</strong></p>
        <p>Open it here: <a href="${link}">${link}</a></p>
        <p>This link will expire in <b>${expiryHours} hours</b>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (!process.env.GMAIL_USER) {
      console.log(" Preview email (Ethereal): " + nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(" Failed to send link:", err.message);
    return { success: false, error: err.message };
  }
};

//  Send confirmation to sender
const sendFileToSender = async ({ to, link, originalName, expiryHours }) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"File Transfer App" <${process.env.GMAIL_USER || "no-reply@test.com"}>`,
      to,
      subject: " File Upload Confirmation",
      html: `
        <p>Hello,</p>
        <p>Your file <strong>${originalName}</strong> was uploaded successfully.</p>
        <p>Open it here: <a href="${link}">${link}</a></p>
        <p>This link will expire in <b>${expiryHours} hours</b>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (!process.env.GMAIL_USER) {
      console.log(" Preview email (Ethereal): " + nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(" Failed to send file to sender:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendDownloadLink, sendFileToSender };
