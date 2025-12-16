import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SeatSelector from "./SeatSelector";
import "../styles/EventRegister.css";


const EventRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("event");

  const [event, setEvent] = useState(null);
  const [slotType, setSlotType] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // FORM DATA
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    nationality: "",
    email: ""
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/v2/events/web")
      .then(res => {
        const found = res.data.find(e => e.id === Number(eventId));
        setEvent(found);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!slotType || selectedSeats.length === 0) {
      alert("Please select slot type and seats");
      return;
    }

    // 👉 send to backend later
    const payload = {
      event,
      ...form,
      slotType,
      seats: selectedSeats
    };

    console.log("Registration payload:", payload);

    navigate("/payment", { state: payload });
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!event) return <p className="error">Event not found</p>;

  return (
    <div className="event-page">
      {/* Event Info */}
      <div className="event-header">
        <h1>{event.title?.en}</h1>
        <div className="meta">
          <span>{event.category?.en}</span>
          <span>{event.location?.en}</span>
          <span>
            {new Date(event.dates[0]).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <div className="form-card">
        <h2>Event Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              placeholder="First Name"
              required
              onChange={e => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              placeholder="Middle Name (Optional)"
              onChange={e => setForm({ ...form, middleName: e.target.value })}
            />
            <input
              placeholder="Last Name"
              required
              onChange={e => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="form-row">
            <input
              placeholder="Phone Number"
              required
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Nationality"
              required
              onChange={e => setForm({ ...form, nationality: e.target.value })}
            />
          </div>

          <div className="form-row">
            <input
              type="email"
              placeholder="Email"
              required
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <select
              required
              value={slotType}
              onChange={e => {
                setSlotType(e.target.value);
                setSelectedSeats([]);
              }}
            >
              <option value="">Select Slot Type</option>
              <option value="normal">Normal</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          {slotType && (
            <SeatSelector
              slotType={slotType}
              bookedSeats={[2, 5]} // TODO: fetch from backend
              onSelect={setSelectedSeats}
            />
          )}

          <p className="selected-info">
            Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
          </p>


          <button type="submit">
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRegister;

