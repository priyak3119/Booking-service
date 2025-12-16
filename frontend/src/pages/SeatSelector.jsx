import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SeatSelector.css";

const SeatSelector = ({ eventId, slotType, onSelect }) => {
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    if (!slotType) return;

    axios
      .get(`http://127.0.0.1:8000/api/v2/events/${eventId}/seats?slot=${slotType}`)
      .then((res) => {
        // add `selected` property for frontend selection
        const mapped = res.data.map((s) => ({ ...s, selected: false }));
        setSeats(mapped);
      })
      .catch((err) => console.error(err));
  }, [eventId, slotType]);

  const handleSeatClick = (index) => {
    if (seats[index].booked) return; // cannot select booked seat
    const updated = [...seats];
    updated[index].selected = !updated[index].selected;
    setSeats(updated);
    const selectedSeats = updated.filter((s) => s.selected).map((s) => s.seat);
    onSelect(selectedSeats);
  };

  return (
    <div className="seat-map">
      {seats.map((s, index) => (
        <div
          key={s.seat}
          className={`seat ${s.booked ? "booked" : s.selected ? "selected" : "available"}`}
          onClick={() => handleSeatClick(index)}
        >
          {s.seat}
        </div>
      ))}
    </div>
  );
};

export default SeatSelector;
