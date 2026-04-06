import nodemailer from "nodemailer";
import dns from "node:dns";

const SMTP_IMPL_TAG = "smtp-v2";
const HTTP_FALLBACK_TAG = "brevo-http-v1";
const SMTP_RELAY_FALLBACK_TAG = "brevo-smtp-relay-v1";

const lookupIpv4 = (hostname, _options, callback) => {
  dns.lookup(hostname, { family: 4, all: false }, callback);
};

const getPrimarySmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || (port === 465 ? "true" : "false")) === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
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
    connectionTimeout,
    greetingTimeout,
    socketTimeout
  };
};

const createTransporter = (config) => nodemailer.createTransport(config);

const parseFromAddress = (fromValue) => {
  const fallbackEmail = process.env.SMTP_USER || "noreply@example.com";
  if (!fromValue) {
    return { email: fallbackEmail, name: "Frameza" };
  }

  const trimmed = String(fromValue).trim();
  const match = trimmed.match(/^(.*)<([^>]+)>$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, "");
    return {
      name: name || "Frameza",
      email: match[2].trim()
    };
  }

  return { email: trimmed, name: "Frameza" };
};

const normalizeRecipients = (to) => {
  if (Array.isArray(to)) {
    return to.map((entry) => ({ email: String(entry).trim() })).filter((entry) => !!entry.email);
  }

  return String(to || "")
    .split(",")
    .map((entry) => ({ email: entry.trim() }))
    .filter((entry) => !!entry.email);
};

const sendViaBrevoHttp = async (mailOptions, smtpErrors) => {
  const apiKey = String(process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error(`BREVO API key not configured. SMTP diagnostics: ${smtpErrors.join(" | ")}`);
  }

  if (typeof fetch !== "function") {
    throw new Error("Global fetch is unavailable in current Node runtime.");
  }

  const to = normalizeRecipients(mailOptions.to);
  if (!to.length) {
    throw new Error("No recipient email address provided.");
  }

  const sender = parseFromAddress(process.env.BREVO_SENDER || mailOptions.from);

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || sender.name,
      email: process.env.BREVO_SENDER_EMAIL || sender.email
    },
    to,
    subject: mailOptions.subject,
    htmlContent: mailOptions.html,
    textContent: mailOptions.text || undefined,
    replyTo: mailOptions.replyTo ? { email: String(mailOptions.replyTo) } : undefined
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Brevo HTTP ${response.status}: ${raw || "No response body"}`);
  }

  return raw;
};

const sendViaBrevoSmtpRelay = async (mailOptions, priorErrors) => {
  const relayKey = String(process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY || "").trim();
  if (!relayKey) {
    throw new Error(`BREVO SMTP relay key not configured. Diagnostics: ${priorErrors.join(" | ")}`);
  }

  const relayPort = Number(process.env.BREVO_SMTP_PORT || 587);
  const relaySecure = String(process.env.BREVO_SMTP_SECURE || (relayPort === 465 ? "true" : "false")) === "true";

  const transporter = createTransporter({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: relayPort,
    secure: relaySecure,
    auth: {
      user: process.env.BREVO_SMTP_USER || "apikey",
      pass: relayKey
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000)
  });

  await transporter.sendMail(mailOptions);
};

const buildSmtpAttempts = (primaryBaseConfig) => {
  const attempts = [
    {
      label: "primary-hostname-ipv4",
      config: {
        ...primaryBaseConfig,
        family: 4,
        lookup: lookupIpv4
      }
    },
    {
      label: "primary-hostname-default",
      config: {
        ...primaryBaseConfig
      }
    }
  ];

  const canTrySslFallback = primaryBaseConfig.host === "smtp.gmail.com" && primaryBaseConfig.port !== 465;
  if (canTrySslFallback) {
    attempts.push(
      {
        label: "fallback-465-ipv4",
        config: {
          ...primaryBaseConfig,
          port: 465,
          secure: true,
          family: 4,
          lookup: lookupIpv4
        }
      },
      {
        label: "fallback-465-default",
        config: {
          ...primaryBaseConfig,
          port: 465,
          secure: true
        }
      }
    );
  }

  return attempts;
};

const sendMailWithDiagnostics = async (mailOptions) => {
  const hasBrevoApiKey = Boolean(String(process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || "").trim());
  const primaryBaseConfig = getPrimarySmtpConfig();
  const attempts = buildSmtpAttempts(primaryBaseConfig);

  // In hosted environments where Gmail SMTP is blocked, prefer Brevo HTTP first for fast delivery.
  if (hasBrevoApiKey) {
    try {
      await sendViaBrevoHttp(mailOptions, ["brevo-first mode"]);
      return;
    } catch (httpErr) {
      const brevoErrors = [`[${HTTP_FALLBACK_TAG}] ${httpErr.message}`];

      if (String(httpErr.message || "").includes("Brevo HTTP 401")) {
        throw new Error(`${brevoErrors.join(" | ")} | Configure a valid BREVO_API_KEY (Transactional API key from Brevo SMTP & API settings).`);
      }

      try {
        await sendViaBrevoSmtpRelay(mailOptions, brevoErrors);
        return;
      } catch (relayErr) {
        brevoErrors.push(`[${SMTP_RELAY_FALLBACK_TAG}] ${relayErr.message}`);

        const smtpErrors = [];
        for (const attempt of attempts) {
          const summary = `${attempt.label} ${attempt.config.host}:${attempt.config.port}, secure=${attempt.config.secure}`;
          try {
            await createTransporter(attempt.config).sendMail(mailOptions);
            return;
          } catch (err) {
            smtpErrors.push(`${summary}: ${err.message}`);
          }
        }

        throw new Error(`[${SMTP_IMPL_TAG}] SMTP send failed after ${attempts.length} attempts. ${smtpErrors.join(" | ")} | ${brevoErrors.join(" | ")}`);
      }
    }
  }

  const errors = [];
  for (const attempt of attempts) {
    const summary = `${attempt.label} ${attempt.config.host}:${attempt.config.port}, secure=${attempt.config.secure}`;
    try {
      await createTransporter(attempt.config).sendMail(mailOptions);
      return;
    } catch (err) {
      errors.push(`${summary}: ${err.message}`);
    }
  }

  try {
    await sendViaBrevoHttp(mailOptions, errors);
    return;
  } catch (httpErr) {
    const fallbackErrors = [
      `[${SMTP_IMPL_TAG}] SMTP send failed after ${attempts.length} attempts. ${errors.join(" | ")}`,
      `[${HTTP_FALLBACK_TAG}] ${httpErr.message}`
    ];

    // Brevo rejected the API key; do not spend extra time on SMTP relay fallback.
    if (String(httpErr.message || "").includes("Brevo HTTP 401")) {
      throw new Error(
        `${fallbackErrors.join(" | ")} | Configure a valid BREVO_API_KEY (Transactional API key from Brevo SMTP & API settings).`
      );
    }

    try {
      await sendViaBrevoSmtpRelay(mailOptions, fallbackErrors);
      return;
    } catch (relayErr) {
      throw new Error(`${fallbackErrors.join(" | ")} | [${SMTP_RELAY_FALLBACK_TAG}] ${relayErr.message}`);
    }
  }
};

export const runSmtpDiagnostic = async () => {
  const primaryBaseConfig = getPrimarySmtpConfig();
  const attempts = buildSmtpAttempts(primaryBaseConfig);
  const diagnostics = [];

  for (const attempt of attempts) {
    const transporter = createTransporter(attempt.config);
    const summary = `${attempt.label} ${attempt.config.host}:${attempt.config.port}, secure=${attempt.config.secure}`;

    try {
      await transporter.verify();
      diagnostics.push({ attempt: attempt.label, summary, ok: true, error: "" });
      return { tag: SMTP_IMPL_TAG, ok: true, diagnostics };
    } catch (err) {
      diagnostics.push({ attempt: attempt.label, summary, ok: false, error: err.message });
    }
  }

  return {
    tag: SMTP_IMPL_TAG,
    ok: false,
    diagnostics,
    httpFallbackConfigured: Boolean(process.env.BREVO_API_KEY)
  };
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
