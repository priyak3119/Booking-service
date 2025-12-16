import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Payment.css";

import visa from "../assets/cards/visa.png";
import mastercard from "../assets/cards/mastercard.png";
import amex from "../assets/cards/debit.png";
// import mada from "../assets/cards/mada.png";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    if (!state) navigate("/");
  }, [state, navigate]);

  if (!state) return null;

  const {
    event,
    slotType,
    seats = [],
    firstName,
    lastName,
    email
  } = state;

  const totalAmount =
    slotType === "vip" ? seats.length * 200 : seats.length * 100;

  const handlePayment = async () => {
    try {
      const payload = {
        event_id: event.id,
        slot_type: slotType,
        seats,
        amount: totalAmount,
        email,
        payment_method: "card"
      };

      const res = await fetch("http://127.0.0.1:8000/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === "SUCCESS") {
        alert("Payment Successful 🎉");
        navigate("/success", { state: data });
      } else {
        alert("Payment Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Payment Error");
    }
  };




  return (
    <div className="payment-page">
      <div className="payment-container">

        {/* LEFT */}
        <div className="payment-summary">
          <h2>Order Summary</h2>

          <div className="summary-item">
            <strong>Event</strong>
            <span>{event.title.en}</span>
          </div>

          <div className="summary-item">
            <strong>Location</strong>
            <span>{event.location.en}</span>
          </div>

          <div className="summary-item">
            <strong>Date</strong>
            <span>{new Date(event.dates[0]).toLocaleDateString()}</span>
          </div>

          <div className="summary-item">
            <strong>Slot Type</strong>
            <span>{slotType.toUpperCase()}</span>
          </div>

          <div className="summary-item">
            <strong>Seats</strong>
            <span>{seats.join(", ")}</span>
          </div>

          <hr />

          <div className="summary-total">
            <strong>Total</strong>
            <strong>AED {totalAmount}</strong>
          </div>
        </div>

        {/* RIGHT */}
        <div className="payment-form">
          <h2>Payment Method</h2>

          <div className="card-logos">
            <img src={visa} alt="Visa" />
            <img src={mastercard} alt="Mastercard" />
            <img src={amex} alt="Amex" />
          </div>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="payment"
                checked
                onChange={() => setPaymentMethod("card")}
              />
              Credit / Debit Card
            </label>
          </div>

          <div className="card-inputs">
            <input
              type="text"
              name="cardnumber"
              placeholder="Card Number"
              autoComplete="cc-number"
              required
            />
            <input
              type="text"
              name="cardname"
              placeholder="Cardholder Name"
              autoComplete="cc-name"
              required
            />
            

            {/* <input type="text" placeholder="Card Number" /> */}
            {/* <input type="text" placeholder="Cardholder Name" /> */}

            <div className="card-row">
              <input
              type="text"
              name="expiry"
              placeholder="MM / YY"
              autoComplete="cc-exp"
              required
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              autoComplete="cc-csc"
              required
            />
              {/* <input type="text" placeholder="MM / YY" />
              <input type="text" placeholder="CVV" /> */}
            </div>
          </div>

          <button className="pay-btn" onClick={handlePayment}>
            Pay AED {totalAmount}
          </button>

          <p className="secure-text">
            🔒 Secured by Magnati Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
