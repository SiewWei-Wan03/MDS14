import React, { useState } from 'react';
import { registerDoctor } from '../services/authService';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import PatientInfoPage from './PatientInfoPage';

// Function to validate Doctor ID (should start with 'D' followed by 5 digits)
const isValidDoctorID = (doctorID) => {
  const doctorIDPattern = /^D\d{5}$/; // Doctor ID must start with 'D' and be followed by exactly 5 digits
  return doctorIDPattern.test(doctorID);
};

// Function to sanitize inputs (removing unwanted characters)
const sanitizeInput = (input) => {
  return input.replace(/[^a-zA-Z0-9]/g, ''); // Removes any non-alphanumeric characters
};

const RegisterPage = () => {
  const [doctorID, setDoctorID] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize the navigate function

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    // Validate Doctor ID
    if (!isValidDoctorID(doctorID)) {
      setError('Doctor ID must start with D and followed by exactly 5 digits.');
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedDoctorID = sanitizeInput(doctorID);
    const sanitizedPassword = sanitizeInput(password);

    try {
      const result = await registerDoctor(sanitizedDoctorID, sanitizedPassword);
      if (!result.success) {
        setError(result.message); // Display the user-friendly error message
      } else {
        // Redirect to the "patient info" page after successful registration
        navigate('/main');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#f4f8ef]">
      <div className="p-6 bg-[#f6f8eb] rounded-md shadow-md w-96 border border-[#234f32]">
        <h2 className="text-2xl mb-6 text-center text-[#234f32]">EMMS</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>} {/* Display the friendly error message */}
        <input 
          type="text" 
          value={doctorID} 
          onChange={(e) => setDoctorID(e.target.value)} 
          placeholder="Doctor ID (e.g. D012345)" 
          className="border border-[#234f32] rounded px-4 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-[#234f32]"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          className="border border-[#234f32] rounded px-4 py-2 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-[#234f32]"
        />
        <button 
          className={`bg-[#234f32] text-white px-4 py-2 rounded w-full hover:bg-[#1b3e27] transition ${loading ? 'cursor-wait' : ''}`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-4 text-center text-[#234f32]">
          Already have an account?{' '}
          <Link to="/login" className="underline hover:text-[#1b3e27]">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
