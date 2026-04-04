

import { Link } from "react-router-dom";
import Hero from "../assets/Hero.png";

const Home = () => {
  return (
    <div style={styles.page}>

      {/* HERO SECTION */}
      <section
        style={{
          ...styles.hero,
          backgroundImage: `url(${Hero})`
        }}
      >
        <div style={styles.overlay}></div>

        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Frameza Photography</h1>
          <p style={styles.heroSubtitle}>
            Stunning visual storytelling for weddings, fashion, events & commercial shoots
          </p>

          <div style={styles.buttonGroup}>
            <Link to="/gallery" style={styles.primaryBtn}>
              Explore Gallery
            </Link>
            <Link to="/services" style={styles.secondaryBtn}>
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Why Choose Frameza?</h2>

        <div style={styles.cardGrid}>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Professional Photographers</h3>
            <p style={styles.cardText}>
              Experienced professionals with years of expertise in multiple styles.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>High-End Equipment</h3>
            <p style={styles.cardText}>
              Latest cameras & gear to deliver stunning cinematic results.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Custom Packages</h3>
            <p style={styles.cardText}>
              Flexible pricing tailored to your needs and budget.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;

//////////////////////////////////////////////////////////
// 🎨 STYLES (ALL IN SAME FILE)
//////////////////////////////////////////////////////////

const styles = {
  page: {
    background: "#0f0f0f",
    color: "#fff",
    fontFamily: "sans-serif"
  },

  /* HERO */
  hero: {
    height: "clamp(50vh, 90vh, 90vh)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)"
  },

  heroContent: {
    position: "relative",
    textAlign: "center",
    zIndex: 2,
    maxWidth: "700px"
  },

  heroTitle: {
    fontSize: "clamp(1.8rem, 8vw, 3rem)",
    fontWeight: "700",
    marginBottom: "15px",
    lineHeight: "1.2"
  },

  heroSubtitle: {
    color: "#ccc",
    marginBottom: "25px",
    fontSize: "clamp(0.95rem, 3vw, 1.1rem)",
    lineHeight: "1.4"
  },

  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
    flexDirection: "column"
  },

  primaryBtn: {
    padding: "12px 24px",
    background: "linear-gradient(45deg, #ff4d4d, #ff7b00)",
    color: "#fff",
    borderRadius: "30px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
    textAlign: "center",
    minWidth: "160px"
  },

  secondaryBtn: {
    padding: "12px 24px",
    border: "1px solid #555",
    color: "#fff",
    borderRadius: "30px",
    textDecoration: "none",
    fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
    textAlign: "center",
    minWidth: "160px"
  },

  /* SECTION */
  section: {
    padding: "clamp(30px, 10vw, 60px) clamp(15px, 5vw, 20px)",
    textAlign: "center"
  },

  sectionTitle: {
    fontSize: "clamp(1.6rem, 6vw, 2.2rem)",
    marginBottom: "40px",
    fontWeight: "700"
  },

  /* CARDS */
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(250px, 100%, 300px), 1fr))",
    gap: "clamp(15px, 3vw, 20px)",
    maxWidth: "1100px",
    margin: "0 auto"
  },

  card: {
    background: "#1a1a1a",
    padding: "clamp(15px, 4vw, 25px)",
    borderRadius: "15px",
    transition: "0.3s",
    border: "1px solid #222",
    display: "flex",
    flexDirection: "column",
    height: "100%"
  },

  cardTitle: {
    marginBottom: "10px",
    fontSize: "clamp(1rem, 2.5vw, 1.3rem)"
  },

  cardText: {
    color: "#aaa",
    fontSize: "clamp(0.85rem, 2vw, 1rem)",
    lineHeight: "1.5"
  }
};