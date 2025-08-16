const nodemailer = require("nodemailer");

async function testMail() {
  // 1. Create a testing email account on Ethereal
  let testAccount = await nodemailer.createTestAccount();

  // 2. Create transporter with Ethereal SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  // 3. Send test email
  let info = await transporter.sendMail({
    from: '"Test" <test@example.com>',
    to: "someone@example.com", // change to your receiver email
    subject: "Test Email",
    text: "Hello world!"
  });

  console.log("✅ Message sent: %s", info.messageId);
  console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

testMail().catch(console.error);
