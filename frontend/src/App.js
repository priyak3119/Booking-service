import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Slots from "./pages/Slots";
import Payment from "./pages/payment";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/booking" element={<Register />} />
        <Route path="/slots" element={<Slots />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
