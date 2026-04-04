
import { useState } from 'react';
import API from '../api/axios';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ type: 'pending', message: 'Sending message...' });

      const response = await API.post('/contact', form);

      setStatus({ type: 'success', message: response.data?.msg || 'Message sent successfully.' });
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.msg || 'Failed to send message.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Heading */}
        <div style={styles.header}>
          <h1 style={styles.title}>Contact Us</h1>
          <p style={styles.subtitle}>We’d love to hear from you</p>
        </div>

        <div style={styles.card}>

          {/* LEFT INFO */}
          <div style={styles.left}>
            <h3 style={styles.leftTitle}>Get in Touch</h3>
            <p style={styles.leftText}>
              Send us a message and we'll respond as soon as possible.
            </p>

            <div style={styles.infoBlock}>
              <strong style={styles.infoHeading}>
                <span style={{ ...styles.infoIcon, ...styles.addressIcon }}>A</span>
                <span>Address</span>
              </strong>
              <p>Omaxe City 1<br />Indore, MP 452016</p>
            </div>

            <div style={styles.infoBlock}>
              <strong style={styles.infoHeading}>
                <span style={{ ...styles.infoIcon, ...styles.phoneIcon }}>P</span>
                <span>Phone</span>
              </strong>
              <p>9691184503</p>
            </div>

            <div style={styles.infoBlock}>
              <strong style={styles.infoHeading}>
                <span style={{ ...styles.infoIcon, ...styles.emailIcon }}>E</span>
                <span>Email</span>
              </strong>
              <p>
                <a href="mailto:support.frameza@gmail.com" style={styles.emailLink}>
                  support.frameza@gmail.com
                </a>
              </p>
            </div>

            {/* 🔥 YOUR SOCIAL LINKS */}
            <div style={styles.socialWrapper}>
              <h4 style={{ marginBottom: "10px" }}>Connect With Me</h4>

              <div style={styles.socialLinks}>

                <a
                  href="https://www.linkedin.com/in/gaurav-patel-9a34212bb"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.socialBtn}
                >
                  <span style={{ ...styles.socialLogo, ...styles.linkedinLogo }}>in</span>
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://github.com/Gaurav0135"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.socialBtn}
                >
                  <span style={{ ...styles.socialLogo, ...styles.githubLogo }}>GH</span>
                  <span>GitHub</span>
                </a>

                <a
                  href="mailto:support.frameza@gmail.com"
                  style={styles.socialBtn}
                >
                  <span style={{ ...styles.socialLogo, ...styles.gmailLogo }}>M</span>
                  <span>Email</span>
                </a>

              </div>
            </div>

          </div>

          {/* RIGHT FORM */}
          <div style={styles.right}>
            <form onSubmit={handleSubmit}>

              <input
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                style={styles.input}
              />

              <input
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                style={styles.input}
              />

              <textarea
                id="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                style={styles.textarea}
              ></textarea>

              {status.message && (
                <div style={{
                  ...styles.alert,
                  ...(status.type === "success"
                    ? styles.success
                    : status.type === "error"
                    ? styles.error
                    : styles.pending)
                }}>
                  {status.message}
                </div>
              )}

              <button style={styles.button} disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;

//////////////////////////////////////////////////////////
//  STYLES
//////////////////////////////////////////////////////////

const styles = {
  page: {
    background: "linear-gradient(135deg, #0f0f0f, #1c1c1c)",
    minHeight: "100vh",
    color: "#fff",
    padding: "20px"
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto"
  },

  header: {
    textAlign: "center",
    marginBottom: "30px"
  },

  title: {
    fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
    fontWeight: "700",
    marginBottom: "10px"
  },

  subtitle: {
    color: "#aaa",
    fontSize: "clamp(0.9rem, 3vw, 1rem)"
  },

  card: {
    display: "flex",
    flexWrap: "wrap",
    background: "#1a1a1a",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  },

  left: {
    flex: "1",
    minWidth: "300px",
    padding: "clamp(15px, 4vw, 30px)",
    borderRight: "none",
    borderBottom: "1px solid #222"
  },

  right: {
    flex: "1",
    minWidth: "300px",
    padding: "clamp(15px, 4vw, 30px)"
  },

  leftTitle: {
    marginBottom: "10px"
  },

  leftText: {
    color: "#aaa",
    marginBottom: "20px"
  },

  infoBlock: {
    marginBottom: "15px",
    color: "#ccc"
  },

  infoHeading: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#f1f6ff"
  },

  infoIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: "800"
  },

  addressIcon: {
    background: "#ff4f9a"
  },

  phoneIcon: {
    background: "#8a5cff"
  },

  emailIcon: {
    background: "#00b7ff"
  },

  emailLink: {
    color: "#d8ecff",
    textDecoration: "none",
    borderBottom: "1px dashed rgba(0, 183, 255, 0.55)"
  },

  /* 🔥 SOCIAL */
  socialWrapper: {
    marginTop: "25px"
  },

  socialLinks: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  socialBtn: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #101826, #0d1117)",
    border: "1px solid #2b3a52",
    color: "#e8f1ff",
    textDecoration: "none"
    ,display: "inline-flex"
    ,alignItems: "center"
    ,gap: "10px"
    ,fontWeight: "600"
    ,boxShadow: "0 6px 18px rgba(0, 0, 0, 0.28)"
  },

  socialLogo: {
    width: "26px",
    height: "26px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: "800",
    letterSpacing: "0.2px"
  },

  linkedinLogo: {
    background: "#0a66c2"
  },

  githubLogo: {
    background: "#24292f"
  },

  gmailLogo: {
    background: "#d14836"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff"
  },

  textarea: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    height: "120px"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(45deg, #ff4d4d, #ff7b00)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer"
  },

  alert: {
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px",
    fontSize: "0.9rem"
  },

  success: {
    background: "#1e4620",
    color: "#8fff9a"
  },

  error: {
    background: "#4a1e1e",
    color: "#ff9a9a"
  },

  pending: {
    background: "#2a2a2a",
    color: "#ccc"
  }
};