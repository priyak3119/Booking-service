import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingPage } from './components/BookingPage';
import { PaymentSuccessPage } from './components/PaymentSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
