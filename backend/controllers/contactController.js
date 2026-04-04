import Contact from "../models/Contact.js";
import {
  sendContactAcknowledgementEmail,
  sendContactNotificationEmail
} from "../services/emailService.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ msg: "Name, email, and message are required." });
    }

    const contact = await Contact.create({ name, email, message });

    try {
      await Promise.all([
        sendContactNotificationEmail(contact),
        sendContactAcknowledgementEmail(contact)
      ]);
    } catch (mailErr) {
      // Do not block API success if SMTP config is missing or email sending fails.
      console.error("Contact email dispatch failed:", mailErr.message);
    }

    res.status(201).json({ msg: "Message sent successfully", contact });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};