import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventRegister from "./pages/EventRegister";
import Slots from "./pages/Slots";
import Payment from "./pages/payment";
// import SeatSelector from "./pages/SeatSelector";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/booking" element={<EventRegister />} />
        <Route path="/slots" element={<Slots />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
