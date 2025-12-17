import React, { useEffect, useState } from "react";
import "../styles/SeatSelector.css";

const SeatSelector = ({ slotType, bookedSeats = [], onSelect }) => {

  // VIP STATE (seat numbers)
  const [selectedSeats, setSelectedSeats] = useState([]);

  // NON-VIP STATE (seat count)
  const [seatCount, setSeatCount] = useState(1);

  // Notify parent
  useEffect(() => {
    if (slotType === "vip") {
      onSelect(selectedSeats);
    } else {
      onSelect(seatCount);
    }
  }, [selectedSeats, seatCount, slotType, onSelect]);

  /* ---------------- VIP LOGIC ---------------- */

  const TOTAL_SEATS = 10;
  const MAX_SELECT = 6;

  const toggleSeat = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return;

    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNo));
    } else {
      if (selectedSeats.length >= MAX_SELECT) {
        alert(`Maximum ${MAX_SELECT} VIP seats allowed`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  /* ---------------- UI ---------------- */

  // 🔹 VIP SEAT GRID
  if (slotType === "vip") {
    return (
      <div className="seat-container">
        <h3>VIP Seating</h3>

        <div className="stadium">
          {Array.from({ length: TOTAL_SEATS }, (_, i) => {
            const seatNo = i + 1;
            const isBooked = bookedSeats.includes(seatNo);
            const isSelected = selectedSeats.includes(seatNo);

            return (
              <div
                key={seatNo}
                className={`seat 
                  ${isBooked ? "booked" : ""} 
                  ${isSelected ? "selected" : ""}`}
                onClick={() => toggleSeat(seatNo)}
              >
                {seatNo}
              </div>
            );
          })}
        </div>

        <p className="legend">
          <span className="box available"></span> Available
          <span className="box selected"></span> Selected
          <span className="box booked"></span> Booked
        </p>
      </div>
    );
  }

  // 🔹 NON-VIP QUANTITY INPUT
  return (
    <div className="seat-container">
      <h3>Number of Seats</h3>

      <input
        type="number"
        min="1"
        max="30"
        value={seatCount}
        onChange={(e) => setSeatCount(Number(e.target.value))}
        className="seat-count-input"
      />

      <p className="seat-info">
        Enter how many seats you want to book
      </p>
    </div>
  );
};

export default SeatSelector;
