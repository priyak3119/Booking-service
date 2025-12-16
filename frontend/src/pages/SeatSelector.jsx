import React, { useEffect, useState } from "react";
import "../styles/SeatSelector.css";

const SeatSelector = ({ slotType, bookedSeats = [], onSelect }) => {
  const TOTAL_SEATS = slotType === "vip" ? 12 : 30;
  const MAX_SELECT = slotType === "vip" ? 6 : 2;

  const [selected, setSelected] = useState([]);

  useEffect(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  const toggleSeat = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return;

    if (selected.includes(seatNo)) {
      setSelected(selected.filter(s => s !== seatNo));
    } else {
      if (selected.length >= MAX_SELECT) {
        alert(`Maximum ${MAX_SELECT} seats allowed for ${slotType.toUpperCase()}`);
        return;
      }
      setSelected([...selected, seatNo]);
    }
  };

  return (
    <div className="seat-container">
      <h3>{slotType.toUpperCase()} Seating</h3>

      <div className="stadium">
        {Array.from({ length: TOTAL_SEATS }, (_, i) => {
          const seatNo = i + 1;
          const isBooked = bookedSeats.includes(seatNo);
          const isSelected = selected.includes(seatNo);

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
};

export default SeatSelector;
