import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Upload, Trash2, Plus, ChevronLeft, CreditCard } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/v2';

export function BookingPage() {
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [riderCount, setRiderCount] = useState(1);
  const [riders, setRiders] = useState([]);
  const [newRider, setNewRider] = useState({ name: '', emirates_id: '' });
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
 
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    email: '',
    emirates_id: '',
  });
  const VIP_TABLES = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    table_number: i + 1,
    capacity: 6,
  }));

  const [emiratesIdFile, setEmiratesIdFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paymentData, setPaymentData] = useState({
    card_number: '',
    card_holder: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
  });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch(`${API_URL}/tables`);
        if (!res.ok) throw new Error('Failed to fetch tables');
        const data = await res.json();
        setTables(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchEventData = async () => {
      try {
        setLoading(true);

        if (!eventId) throw new Error('Event ID missing in URL');

        const res = await fetch(`${API_URL}/events/web?event=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const eventData = await res.json();
        setEvent(eventData);

        const packagesRes = await fetch(`${API_URL}/packages/`);
        if (!packagesRes.ok) throw new Error('Failed to fetch packages');
        const packagesData = await packagesRes.json();
        setPackages(packagesData || []);
      } catch (err) {
        setError(err.message || 'Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
    fetchEventData();
  }, []);

  const fetchEventData = async () => {
    try {
      setLoading(true);

      if (!eventId) throw new Error('Event ID missing in URL');

      // Fetch event info
      const eventResponse = await fetch(`${API_URL}/events/web?event=${eventId}`);
      if (!eventResponse.ok) throw new Error('Failed to fetch event');
      const eventData = await eventResponse.json();
      setEvent(eventData);

      // Fetch packages separately
      const packagesResponse = await fetch(`${API_URL}/packages/`);
      if (!packagesResponse.ok) throw new Error('Failed to fetch packages');
      const packagesData = await packagesResponse.json();
      setPackages(packagesData || []);

      // Fetch tables if needed
      setTables(eventData.tables || []);
    } catch (err) {
      setError(err.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setStep(2);
    setError('');
    setSelectedTable(null);
    setRiderCount(1);
    setRiders([]);

    if (pkg.type === 'RIDER') {
      setRiders([{ name: '', emirates_id: '', file: null }]);
    }
  };

  const handleEmiratesIdUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid file (PDF, JPG, PNG, JPEG)');
        return;
      }
      if (file.size > 5242880) {
        setError('File size must be less than 5MB');
        return;
      }
      setEmiratesIdFile(file);
      setError('');
    }
  };

  const handleRiderFileUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError(`Rider ${index + 1}: Please upload a valid file (PDF, JPG, PNG, JPEG)`);
        return;
      }
      if (file.size > 5242880) {
        setError(`Rider ${index + 1}: File size must be less than 5MB`);
        return;
      }
      const updatedRiders = [...riders];
      updatedRiders[index].file = file;
      setRiders(updatedRiders);
      setError('');
    }
  };

  const proceedToNextSection = () => {
    if (!formData.full_name || !formData.contact_number || !formData.email || !formData.emirates_id) {
      setError('Please fill all personal details');
      return;
    }
    if (!emiratesIdFile) {
      setError('Please upload Emirates ID proof');
      return;
    }
    setStep(4);
    setError('');
  };

  const handleRiderCountChange = (count) => {
    const safeCount = Math.max(1, Math.min(30, count));
    setRiderCount(safeCount);

    setRiders(
      Array.from({ length: safeCount }, () => ({
        name: '',
        emirates_id: '',
        file: null
      }))
    );
  };

  const handleRiderChange = (index, field, value) => {
    const updatedRiders = [...riders];
    updatedRiders[index][field] = value;
    setRiders(updatedRiders);
  };

  const validateRiders = () => {
    for (let i = 0; i < riders.length; i++) {
      if (!riders[i].name || !riders[i].emirates_id) {
        setError(`Rider ${i + 1}: Please fill all details`);
        return false;
      }
      if (!riders[i].file) {
        setError(`Rider ${i + 1}: Please upload ID proof`);
        return false;
      }
    }
    return true;
  };

  const proceedToPayment = () => {
    if (!selectedPackage) return;

    if (selectedPackage.type === 'VIP') {
      if (!selectedTable) {
        setError('Please select a VIP table');
        return;
      }
      setStep(3);
      setError('');
      return;
    } 
    if (selectedPackage.type === 'RIDER') {
      if (!validateRiders()) return;

      setStep(4);
      setError('');
    }
  };


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      if (!paymentData.card_number || !paymentData.card_holder || !paymentData.expiry_month || !paymentData.expiry_year || !paymentData.cvv) {
        throw new Error('Please fill all payment details');
      }

      let emirates_id_file = emiratesIdFile.name;
      let riderFiles = [];

      const bookingPayload = {
        event_id: event.id,
        package_id: selectedPackage.id,
        full_name: formData.full_name,
        contact_number: formData.contact_number,
        email: formData.email,
        emirates_id: formData.emirates_id,
      };

      if (selectedPackage.type === 'VIP') {
        bookingPayload.table_id = selectedTable;
      } else if (selectedPackage.type === 'RIDER') {
        bookingPayload.riders = riders.map(r => ({
          rider_name: r.name,
          rider_emirates_id: r.emirates_id,
        }));
      }

      const bookingResponse = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const bookingResult = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(bookingResult.detail || 'Booking creation failed');
      }

      const createdBookingId = bookingResult.id;
      setBookingId(createdBookingId);

      const paymentPayload = {
        booking_id: createdBookingId,
        amount: parseFloat(selectedPackage.price),
        card_number: paymentData.card_number,
        card_holder: paymentData.card_holder,
        expiry_month: parseInt(paymentData.expiry_month),
        expiry_year: parseInt(paymentData.expiry_year),
        cvv: paymentData.cvv,
      };

      const paymentResponse = await fetch(`${API_URL}/payment/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentResult.detail || 'Payment processing failed');
      }

      setStep(5);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitLoading(false);
    }
  };

  const startPayment = async () => {
    const res = await fetch(`${API_URL}/payment/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: bookingId,
        amount: totalAmount
      })
    });
    const data = await res.json();
    window.location.href = data.checkoutUrl;
  };

  const totalAmount = selectedPackage
  ? selectedPackage.type === 'VIP'
    ? selectedPackage.price
    : selectedPackage.price * riderCount
  : 0;

  const handleBackToBooking = () => {
    setStep(1);
    setSelectedPackage(null);
    setSelectedTable(null);
    setRiderCount(1);
    setRiders([]);
    setFormData({
      full_name: '',
      contact_number: '',
      email: '',
      emirates_id: '',
    });
    setEmiratesIdFile(null);
    setPaymentData({
      card_number: '',
      card_holder: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
    });
    setBookingId(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">{error || 'Event not found'}</p>
        </div>
      </div>
    );
  }
  if ((step === 2 || step === 3 || step === 4) && !selectedPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Please select a package first.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-12 h-1 ${
                      step > s ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-600 text-center">
            {step === 1 && 'Event Details & Package Selection'}
            {step === 2 && 'Package-Based Booking'}
            {step === 3 && 'Personal Details & File Upload'}
            {step === 4 && 'Payment'}
            {step === 5 && 'Success'}
          </div>
        </div>
        {step === 1 && (
          <form className="space-y-6">
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-2xl font-bold text-white">Event Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{event.title?.en}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-slate-600">Venue</p>
                      <p className="font-medium text-slate-900">{event.location?.en}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-slate-600">Date & Time</p>
                      <p className="font-medium text-slate-900">
                   
                        {new Date(event.dates[0]).toLocaleDateString()} at{' '}
                        {new Date(event.dates[0]).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-emerald-700">
                <h2 className="text-2xl font-bold text-white">Select Your Package</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handlePackageSelect(pkg)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
                        selectedPackage?.id === pkg.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{pkg.name}</h4>
                          <p className="text-sm text-slate-600">{pkg.description}</p>
                        </div>
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPackage?.id === pkg.id
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedPackage?.id === pkg.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-blue-600">AED {pkg.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </form>
        )}

        {step === 2 && (
          <form className="space-y-6">
            {selectedPackage?.type === 'VIP' ? (
              <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-600 to-orange-700">
                  <h2 className="text-2xl font-bold text-white">Select VIP Table</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-600 mb-4">
                    1 Table = {selectedTable?.capacity || 6} Seats | Price: AED {selectedPackage.price}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => setSelectedTable(table)}
                        className={`p-4 rounded-lg border-2 font-bold transition-all ${
                          selectedTable?.id === table.id
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-slate-300 hover:border-blue-400'
                        }`}
                        disabled={!table.is_available}
                      >
                        Table {table.table_number}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-600 to-orange-700">
                  <h2 className="text-2xl font-bold text-white">Enter Number of Riders</h2>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      How many riders? (Max {selectedPackage.max_capacity})
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max={selectedPackage.max_capacity}
                        value={riderCount}
                        onChange={(e) =>
                          handleRiderCountChange(Math.min(selectedPackage.max_capacity, parseInt(e.target.value) || 1))
                        }
                        className="w-24 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-slate-600">riders</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {riders.map((rider, index) => (
                      <div key={index} className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                        <h4 className="font-bold text-slate-900 mb-3">Rider {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                            <input
                              type="text"
                              value={rider.name}
                              onChange={(e) => handleRiderChange(index, 'name', e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Rider name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Emirates ID *</label>
                            <input
                              type="text"
                              value={rider.emirates_id}
                              onChange={(e) => handleRiderChange(index, 'emirates_id', e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Emirates ID"
                            />
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-600 mb-2">Upload ID proof (PDF, JPG, PNG, JPEG)</p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleRiderFileUpload(index, e)}
                            className="hidden"
                            id={`rider-file-${index}`}
                          />
                          <label
                            htmlFor={`rider-file-${index}`}
                            className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded cursor-pointer hover:bg-blue-700"
                          >
                            Choose File
                          </label>
                          {rider.file && (
                            <p className="mt-2 text-xs text-green-600 font-medium">{rider.file.name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 font-bold flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={startPayment}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold"
              >
                Proceed to Payment
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="space-y-6">
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-purple-700">
                <h2 className="text-2xl font-bold text-white">Personal Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your contact number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Emirates ID *</label>
                    <input
                      type="text"
                      name="emirates_id"
                      value={formData.emirates_id}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your Emirates ID"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-600 to-orange-700">
                <h2 className="text-2xl font-bold text-white">Upload ID Proof</h2>
              </div>
              <div className="p-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">Upload your Emirates ID proof (PDF, JPG, PNG, JPEG)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleEmiratesIdUpload}
                    className="hidden"
                    id="emirates-id-upload"
                  />
                  <label
                    htmlFor="emirates-id-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Choose File
                  </label>
                  {emiratesIdFile && (
                    <p className="mt-2 text-sm text-green-600 font-medium">{emiratesIdFile.name}</p>
                  )}
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setStep(1); setSelectedPackage(null); }}
                className="flex-1 bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 font-bold flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={proceedToNextSection}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold"
              >
                Continue
              </button>
            </div>
          </form>
        )} 

        {step === 4 && (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-600 to-green-700">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-6 h-6" />
                  <h2 className="text-2xl font-bold text-white">Payment Details</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="text-3xl font-bold text-blue-600">AED {totalAmount}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Card Number *</label>
                    <input
                      type="text"
                      name="card_number"
                      value={paymentData.card_number}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength="19"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Card Holder Name *</label>
                    <input
                      type="text"
                      name="card_holder"
                      value={paymentData.card_holder}
                      onChange={handlePaymentChange}
                      placeholder="Enter name on card"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Month *</label>
                      <input
                        type="number"
                        name="expiry_month"
                        value={paymentData.expiry_month}
                        onChange={handlePaymentChange}
                        placeholder="MM"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                      <input
                        type="number"
                        name="expiry_year"
                        value={paymentData.expiry_year}
                        onChange={handlePaymentChange}
                        placeholder="YYYY"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPackage.type === 'VIP') {
                      setStep(3);
                    } else {
                      setStep(2);
                    }
                  }}
                  disabled={submitLoading}
                  className="flex-1 bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 disabled:bg-gray-400 font-bold flex items-center justify-center space-x-2"
                >
              {/* <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 disabled:bg-gray-400 font-bold flex items-center justify-center space-x-2"
              > */}
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 font-bold"
              >
                {submitLoading ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </form>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
              <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
            </div>
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                <p className="text-slate-600 mb-4">Your booking has been confirmed and payment processed.</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Booking ID</p>
                <p className="text-xl font-bold text-slate-900 break-all">{bookingId}</p>
              </div>

              <button
                onClick={handleBackToBooking}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
              >
                Return to Booking Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
