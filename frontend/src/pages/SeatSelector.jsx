import React, { useEffect, useState } from "react";
import "../styles/SeatSelector.css";

const SeatSelector = ({ slotType, bookedTables = [], onSelect }) => {
  // VIP TABLE LOGIC
  const TOTAL_TABLES = 10;
  const MAX_TABLES = 1; // usually 1 table per booking

  const [selectedTables, setSelectedTables] = useState([]);
  const [seatCount, setSeatCount] = useState(1);

  useEffect(() => {
    if (slotType === "vip") {
      onSelect({
        tables: selectedTables,
        seats: selectedTables.length * 6
      });
    } else {
      onSelect({
        tables: [],
        seats: seatCount
      });
    }
  }, [selectedTables, seatCount, slotType, onSelect]);

  // VIP TABLE TOGGLE
  const toggleTable = (tableNo) => {
    if (bookedTables.includes(tableNo)) return;

    if (selectedTables.includes(tableNo)) {
      setSelectedTables([]);
    } else {
      if (selectedTables.length >= MAX_TABLES) {
        alert("Only one VIP table allowed per booking");
        return;
      }
      setSelectedTables([tableNo]);
    }
  };

  // NON-VIP SEAT COUNT
  if (slotType !== "vip") {
    return (
      <div className="seat-container">
        <h3>Number of Seats</h3>
        <input
          type="number"
          min="1"
          max="30"
          value={seatCount}
          onChange={(e) => setSeatCount(Number(e.target.value))}
        />
      </div>
    );
  }

  // VIP TABLE UI
  return (
    <div className="seat-container">
      <h3>VIP Tables (6 seats per table)</h3>

      <div className="stadium">
        {Array.from({ length: TOTAL_TABLES }, (_, i) => {
          const tableNo = i + 1;
          const isBooked = bookedTables.includes(tableNo);
          const isSelected = selectedTables.includes(tableNo);

          return (
            <div
              key={tableNo}
              className={`seat table 
                ${isBooked ? "booked" : ""} 
                ${isSelected ? "selected" : ""}`}
              onClick={() => toggleTable(tableNo)}
            >
              Table {tableNo}
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
