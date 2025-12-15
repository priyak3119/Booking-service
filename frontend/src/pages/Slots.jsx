import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const eventId = params.get("event");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/slots/${eventId}`)
      .then((res) => setSlots(res.data));
  }, [eventId]);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Select a Slot</h2>

      {slots.map((slot) => (
        <button
          key={slot.id}
          onClick={() => navigate("/payment")}
          style={{ display: "block", margin: "10px 0" }}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
};

export default Slots;
