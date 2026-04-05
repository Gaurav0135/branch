import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const testSMTP = async () => {
  console.log("\n=== FRAMEZA SMTP TEST ===\n");

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || (port === 465 ? "true" : "false")) === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM || user;

  console.log("Configuration detected:");
  console.log(`  SMTP_HOST: ${host}`);
  console.log(`  SMTP_PORT: ${port}`);
  console.log(`  SMTP_SECURE: ${secure}`);
  console.log(`  SMTP_USER: ${user}`);
  console.log(`  MAIL_FROM: ${mailFrom}`);
  console.log(`  SMTP_PASS: ${pass ? "***" + pass.substring(Math.max(0, pass.length - 4)) : "NOT SET"}`);

  if (!host || !user || !pass) {
    console.error("\n❌ SMTP not configured. Missing required env vars:");
    if (!host) console.error("   - SMTP_HOST");
    if (!user) console.error("   - SMTP_USER");
    if (!pass) console.error("   - SMTP_PASS");
    process.exit(1);
  }

  console.log("\nAttempting SMTP connection...\n");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    logger: true,
    debug: true
  });

  try {
    const testEmail = "test@frameza.local";
    console.log("Verifying transporter...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: mailFrom,
      to: user,
      subject: "Frameza SMTP Test - Success",
      html: `<p>This is a test email from Frameza SMTP configuration.</p><p>If you received this, SMTP is working correctly.</p>`
    });

    console.log("✅ Test email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ SMTP test failed:");
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    process.exit(1);
  }
};

testSMTP();
