import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';  // Firebase Authentication
import { ref, get } from 'firebase/database';  // Firebase Database functions to fetch data
import bcrypt from 'bcryptjs';  // Import bcrypt for password comparison
import { database } from '../firebase';  // Import your Firebase Realtime Database

// Function to validate Doctor ID (should start with 'D' followed by 5 digits)
const isValidDoctorID = (doctorID) => {
  const doctorIDPattern = /^D\d{5}$/; // Doctor ID must start with 'D' and be followed by exactly 5 digits
  return doctorIDPattern.test(doctorID);
};

// Function to sanitize inputs (removing unwanted characters)
const sanitizeInput = (input) => {
  return input.replace(/[^a-zA-Z0-9]/g, ''); // Removes any non-alphanumeric characters
};

const LoginPage = () => {
  const [doctorID, setDoctorID] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const auth = getAuth();  // Initialize Firebase Authentication

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    // Validate Doctor ID
    if (!isValidDoctorID(doctorID)) {
      setError('Invalid Doctor ID.');
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedDoctorID = sanitizeInput(doctorID);
    const sanitizedPassword = sanitizeInput(password);

    try {
      // Use the doctorID as email
      const email = `${sanitizedDoctorID}@yourdomain.com`;

      // Sign in using Firebase Authentication (Firebase Auth checks for the plain password)
      const authResult = await signInWithEmailAndPassword(auth, email, sanitizedPassword);

      // Get the UID of the authenticated user
      const uid = authResult.user.uid;

      // Fetch the stored hashed password from Firebase Realtime Database
      const userRef = ref(database, 'doctors/' + uid);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const hashedPassword = userData.password;

        // Compare the entered password with the hashed password using bcrypt
        const isPasswordCorrect = await bcrypt.compare(sanitizedPassword, hashedPassword);

        if (isPasswordCorrect) {
          // Redirect to the "patient info" page after successful login
          navigate('/main');
        } else {
          setError('Incorrect Doctor ID or Password.');
        }
      } else {
        setError('Doctor not found.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#f4f8ef]">
      <div className="p-6 bg-[#f6f8eb] rounded-md shadow-md w-96 border border-[#234f32]">
        <h1 className="text-2xl mb-6 text-center text-[#234f32]">EMMS</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
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
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="mt-4 text-center text-[#234f32]">
          Don't have an account?{' '}
          <Link to="/register" className="underline hover:text-[#1b3e27]">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
