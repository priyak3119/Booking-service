import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000/api/v2';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying payment...');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await fetch(`${API_URL}/payment/verify/${transactionId}`);
        const result = await res.json();

        if (result.status === 'SUCCESS') {
          setStatus('Payment successful! Booking confirmed.');
        } else {
          setStatus('Payment failed or pending. Please check again.');
        }
      } catch (err) {
        setStatus('Error verifying payment.');
      }
    };

    if (transactionId) verifyPayment();
  }, [transactionId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{status}</h2>
        {transactionId && <p>Transaction ID: {transactionId}</p>}
      </div>
    </div>
  );
}
