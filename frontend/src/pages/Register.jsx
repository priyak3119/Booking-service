import React from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";

const Register = () => {
  const { register, handleSubmit } = useForm();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const eventId = params.get("event");

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:8000/booking/register", {
        ...data,
        event_id: eventId,
      });

      navigate(`/slots?event=${eventId}`);
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">
          Event Registration Form
        </h1>

        {/* About Event Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">About This Event</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 border-b">
              <div className="bg-slate-50 px-4 py-2 font-medium">Event Name</div>
              <div className="col-span-2 px-4 py-2">Test</div>
            </div>
            <div className="grid grid-cols-3 border-b">
              <div className="bg-slate-50 px-4 py-2 font-medium">Date</div>
              <div className="col-span-2 px-4 py-2">October 15, 2028</div>
            </div>
            <div className="grid grid-cols-3 border-b">
              <div className="bg-slate-50 px-4 py-2 font-medium">Time</div>
              <div className="col-span-2 px-4 py-2">2:00 PM – 4:00 PM</div>
            </div>
            
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-xl font-semibold mb-4">Participant Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              {...register("name")}
              placeholder="Full Name"
              required
              className="border rounded-lg p-3"
            />
            <input
              type="date"
              {...register("dob")}
              className="border rounded-lg p-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              {...register("phone")}
              placeholder="Phone Number"
              required
              className="border rounded-lg p-3"
            />
            <input
              {...register("email")}
              placeholder="Email"
              required
              className="border rounded-lg p-3"
            />
          </div>

          {/* Gender */}
          <div className="mb-4">
            <p className="font-medium mb-2">Gender</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" value="Male" {...register("gender")} /> Male
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="Female" {...register("gender")} /> Female
              </label>
            </div>
          </div>

          {/* Source */}
          {/* <div className="mb-6">
            <p className="font-medium mb-2">Where did you hear about this event?</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {["Facebook", "Youtube", "Instagram", "Twitter"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="radio" value={item} {...register("source")} /> {item}
                </label>
              ))}
              <input
                {...register("source_other")}
                placeholder="Other"
                className="border rounded-lg p-2"
              />
            </div>
          </div> */}

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;