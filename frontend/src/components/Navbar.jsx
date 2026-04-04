import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoFrameza from "../assets/logo-frameza.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
          <img src={logoFrameza} alt="Frameza logo" className="navbar-logo-img" />
          <span>Frameza</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse-custom ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav main-nav text-uppercase fw-semibold">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMenu}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/gallery" onClick={closeMenu}>Gallery</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/services" onClick={closeMenu}>Services</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-bookings" onClick={closeMenu}>My Bookings</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact" onClick={closeMenu}>Contact</Link>
            </li>
          </ul>
          <ul className="navbar-nav align-items-center ms-auto nav-actions">
            {!user ? (
              <li className="nav-item">
                <Link className="btn btn-light btn-sm text-dark me-2" to="/login" onClick={closeMenu}>Login</Link>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <span className="navbar-text text-light me-2">Hi, {user.name}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm me-2" onClick={() => { logout(); closeMenu(); }}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;