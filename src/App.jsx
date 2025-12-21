import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingPage } from './components/BookingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
