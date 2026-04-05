import nodemailer from "nodemailer";
import dns from "node:dns";
import { promises as dnsPromises } from "node:dns";

const lookupIpv4 = (hostname, _options, callback) => {
  dns.lookup(hostname, { family: 4, all: false }, callback);
};

const resolveHostToIpv4 = async (host) => {
  const ipv4s = await dnsPromises.resolve4(host);
  if (!ipv4s?.length) {
    throw new Error(`No IPv4 address found for ${host}`);
  }
  return ipv4s[0];
};

const getPrimarySmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || (port === 465 ? "true" : "false")) === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const family = Number(process.env.SMTP_IP_FAMILY || 4);
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000);
  const greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT || 15000);
  const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT || 30000);

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    family,
    lookup: lookupIpv4,
    connectionTimeout,
    greetingTimeout,
    socketTimeout
  };
};

const createTransporter = (config) => nodemailer.createTransport(config);

const buildResolvedTransportConfig = async (config) => {
  try {
    const ipv4Host = await resolveHostToIpv4(config.host);
    return {
      ...config,
      host: ipv4Host,
      tls: {
        ...(config.tls || {}),
        servername: config.host
      }
    };
  } catch {
    return config;
  }
};

const sendMailWithDiagnostics = async (mailOptions) => {
  const primaryBaseConfig = getPrimarySmtpConfig();
  const primaryConfig = await buildResolvedTransportConfig(primaryBaseConfig);
  const primarySummary = `${primaryConfig.host}:${primaryConfig.port}, secure=${primaryConfig.secure}, family=${primaryConfig.family}`;

  try {
    await createTransporter(primaryConfig).sendMail(mailOptions);
    return;
  } catch (primaryErr) {
    const canTrySslFallback = primaryBaseConfig.host === "smtp.gmail.com" && primaryConfig.port !== 465;

    if (!canTrySslFallback) {
      throw new Error(`SMTP send failed (${primarySummary}): ${primaryErr.message}`);
    }

    const fallbackConfig = {
      ...primaryConfig,
      port: 465,
      secure: true
    };

    const fallbackSummary = `${fallbackConfig.host}:${fallbackConfig.port}, secure=${fallbackConfig.secure}, family=${fallbackConfig.family}`;

    try {
      await createTransporter(fallbackConfig).sendMail(mailOptions);
      return;
    } catch (fallbackErr) {
      throw new Error(
        `SMTP send failed (primary ${primarySummary}: ${primaryErr.message}; fallback ${fallbackSummary}: ${fallbackErr.message})`
      );
    }
  }
};

export const sendBookingAcceptedEmail = async (booking) => {
  const user = booking?.userId;
  if (!user?.email) {
    throw new Error("Booking user email not found.");
  }

  const service = booking?.serviceId;
  const dateText = booking?.date ? new Date(booking.date).toLocaleString("en-IN") : "Not specified";
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const upiRefText = booking?.upiRefId ? `<p><strong>UPI Ref ID:</strong> ${booking.upiRefId}</p>` : "";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 12px; color: #0b8f6d;">Booking Confirmed - Frameza</h2>
      <p>Hi ${user.name || "Customer"},</p>
      <p>Your booking has been accepted by our admin team.</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>
      ${upiRefText}
      <p><strong>Service:</strong> ${service?.title || "Photography Service"}</p>
      <p><strong>Date:</strong> ${dateText}</p>
      <p><strong>Location:</strong> ${booking.location || "Not provided"}</p>
      <p>You will receive a confirmation call shortly.</p>
      <p>Thank you for choosing Frameza.</p>
    </div>
  `;

  const mailOptions = {
    from,
    to: user.email,
    subject: "Your Frameza Booking Is Confirmed",
    html
  };

  await sendMailWithDiagnostics(mailOptions);
};

export const sendBookingRejectedEmail = async (booking) => {
  const user = booking?.userId;
  if (!user?.email) {
    throw new Error("Booking user email not found.");
  }

  const service = booking?.serviceId;
  const dateText = booking?.date ? new Date(booking.date).toLocaleString("en-IN") : "Not specified";
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const upiRefText = booking?.upiRefId ? `<p><strong>UPI Ref ID:</strong> ${booking.upiRefId}</p>` : "";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 12px; color: #b91c1c;">Booking Update - Frameza</h2>
      <p>Hi ${user.name || "Customer"},</p>
      <p>We are sorry, your booking request could not be accepted at this time.</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>
      ${upiRefText}
      <p><strong>Service:</strong> ${service?.title || "Photography Service"}</p>
      <p><strong>Date:</strong> ${dateText}</p>
      <p><strong>Location:</strong> ${booking.location || "Not provided"}</p>
      <p>Please contact us if you would like to reschedule or create a new booking.</p>
      <p>Thank you for choosing Frameza.</p>
    </div>
  `;

  const mailOptions = {
    from,
    to: user.email,
    subject: "Your Frameza Booking Request Update",
    html
  };

  await sendMailWithDiagnostics(mailOptions);
};

export const sendContactNotificationEmail = async (contact) => {
  const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!to) {
    throw new Error("Contact notification recipient is not configured.");
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const createdAtText = contact?.createdAt
    ? new Date(contact.createdAt).toLocaleString("en-IN")
    : new Date().toLocaleString("en-IN");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 12px; color: #0b8f6d;">New Contact Message - Frameza</h2>
      <p><strong>Name:</strong> ${contact?.name || "N/A"}</p>
      <p><strong>Email:</strong> ${contact?.email || "N/A"}</p>
      <p><strong>Received At:</strong> ${createdAtText}</p>
      <p><strong>Message:</strong></p>
      <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; white-space: pre-wrap;">
        ${contact?.message || "N/A"}
      </div>
    </div>
  `;

  await sendMailWithDiagnostics({
    from,
    to,
    replyTo: contact?.email || undefined,
    subject: "New contact message from website",
    html
  });
};

export const sendContactAcknowledgementEmail = async (contact) => {
  if (!contact?.email) {
    throw new Error("Contact email is required for acknowledgement.");
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 12px; color: #0b8f6d;">Thanks for contacting Frameza</h2>
      <p>Hi ${contact?.name || "there"},</p>
      <p>We have received your message and our team will get back to you soon.</p>
      <p><strong>Your message:</strong></p>
      <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; white-space: pre-wrap;">
        ${contact?.message || ""}
      </div>
      <p style="margin-top: 16px;">Thank you,<br/>Frameza Team</p>
    </div>
  `;

  await sendMailWithDiagnostics({
    from,
    to: contact.email,
    subject: "We received your message - Frameza",
    html
  });
};
