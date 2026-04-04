import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import Home from "../pages/Home";
import Gallery from "../pages/Gallery";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import BookingForm from "../pages/BookingForm";
import Payment from "../pages/Payment";
import Success from "../pages/Success";
import UserBookings from "../pages/UserBookings";
import ChangePassword from "../pages/ChangePassword";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AppRoutes = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/booking" element={<BookingForm />} />
                <Route path="/my-bookings" element={<UserBookings />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/success" element={<Success />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRoutes;