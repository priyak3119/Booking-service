import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import SeatSelector from "../pages/SeatSelector";
import "./EventRegister.css";

const EventRegister = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotType, setSlotType] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    nationality: "",
    agree: false,
  });

  useEffect(() => {
    if (!eventId) return;

    axios
      .get(`http://127.0.0.1:8000/api/v2/events/web`)
      .then((res) => {
        const found = res.data.find((e) => e.id === Number(eventId));
        setEvent(found || null);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slotType || selectedSeats.length === 0) {
      alert("Please select slot type and seats");
      return;
    }

    // send registration to backend
    axios
      .post(`http://127.0.0.1:8000/api/v2/events/${eventId}/register`, {
        ...formData,
        slotType,
        selectedSeats,
      })
      .then((res) => {
        alert("Registration successful! Proceed to payment.");
        // redirect to payment page here if needed
      })
      .catch((err) => {
        console.error(err);
        alert("Error during registration");
      });
  };

  if (loading) return <p className="loading">Loading event…</p>;
  if (!event) return <p className="error">Event not found</p>;

  return (
    <div className="event-page">
      {/* Event Header */}
      <div className="event-header">
        <h1>{event.title?.en}</h1>
        <div className="meta">
          <span>{event.category?.en || "N/A"}</span>
          <span>{event.location?.en || "N/A"}</span>
          <span>
            {event.dates?.[0] ? new Date(event.dates[0]).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <div className="form-card">
        <h2>Event Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <select name="gender" value={formData.gender} onChange={handleInputChange} required>
              <option value="">Select Gender</option>
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>

          <div className="form-row">
            <input
              type="text"
              name="nationality"
              placeholder="Nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <select value={slotType} onChange={(e) => setSlotType(e.target.value)} required>
              <option value="">Select Slot Type</option>
              <option value="VIP">VIP</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          {slotType && (
            <>
              <SeatSelector
                eventId={event.id}
                slotType={slotType}
                onSelect={setSelectedSeats}
              />
              <p>Selected Seats: {selectedSeats.join(", ")}</p>
            </>
          )}

          <div className="checkbox">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleInputChange}
              required
            />
            <label>I agree to the terms & conditions</label>
          </div>

          <button type="submit">Register & Proceed to Payment</button>
        </form>
      </div>
    </div>
  );
};

export default EventRegister;
