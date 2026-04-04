import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  return transporter;
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

  await getTransporter().sendMail(mailOptions);
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

  await getTransporter().sendMail(mailOptions);
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

  await getTransporter().sendMail({
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

  await getTransporter().sendMail({
    from,
    to: contact.email,
    subject: "We received your message - Frameza",
    html
  });
};
