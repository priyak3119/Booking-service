// src/pages/Success.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/Success.css";

const Success = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate("/"); // Redirect if accessed directly
    }
  }, [state, navigate]);

  if (!state) return null;

  const { eventTitle, totalAmount, seats, slotType, firstName } = state;

  return (
    <div className="success-page">
      <div className="success-card">
        <h2>Payment Successful 🎉</h2>
        <p>Thank you, <strong>{firstName}</strong>, for your booking.</p>
        <p><strong>Event:</strong> {eventTitle}</p>
        <p><strong>Seats:</strong> {seats.join(", ")}</p>
        <p><strong>Slot Type:</strong> {slotType}</p>
        <p><strong>Total Paid:</strong> AED {totalAmount}</p>
      </div>
    </div>
  );
};

export default Success;
