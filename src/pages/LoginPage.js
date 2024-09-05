import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';  // Firebase Authentication

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
  const [lockoutTime, setLockoutTime] = useState(null); // Store lockout time
  const [countdown, setCountdown] = useState(0); // Countdown state
  const [lockoutDuration, setLockoutDuration] = useState(60); // Initial lockout duration in seconds (1 min)

  const navigate = useNavigate();
  const auth = getAuth();  // Initialize Firebase Authentication

  // Check if user is currently locked out
  useEffect(() => {
    const storedLockoutTime = localStorage.getItem('lockoutTime');
    if (storedLockoutTime && new Date(storedLockoutTime) > new Date()) {
      const lockoutDate = new Date(storedLockoutTime);
      setLockoutTime(lockoutDate);

      // Calculate remaining time in seconds and start the countdown
      const remainingTime = Math.ceil((lockoutDate - new Date()) / 1000);
      setCountdown(remainingTime);

      // Update countdown every second
      const intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(intervalId);
            localStorage.removeItem('lockoutTime'); // Remove lockout time once countdown finishes
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(intervalId); // Clear interval on unmount
    }
  }, []);

  // Handle login logic
  const handleLogin = async () => {
    // Check if user is locked out
    const storedLockoutTime = localStorage.getItem('lockoutTime');
    if (storedLockoutTime && new Date(storedLockoutTime) > new Date()) {
      const remainingTime = Math.ceil((new Date(storedLockoutTime) - new Date()) / 1000 / 60); // Minutes remaining
      setError(`Too many login attempts. Try again in ${Math.floor(countdown / 60)} minutes and ${countdown % 60} seconds.`);
      return;
    }

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

      // Simulate login request (replace this with actual authentication logic)
      const authResult = await signInWithEmailAndPassword(auth, email, sanitizedPassword);

      // If login is successful, reset the failed attempts and lockout time
      localStorage.removeItem('failedAttempts');
      localStorage.removeItem('lockoutTime');
      setLockoutDuration(60); // Reset lockout duration to 1 minute

      // Redirect to the "patient info" page after successful login
      navigate('/main');
      
    } catch (error) {
      console.error('Login failed:', error);

      // Increment failed attempts
      let failedAttempts = parseInt(localStorage.getItem('failedAttempts')) || 0;
      failedAttempts += 1;

      if (failedAttempts >= 5) {
        // Lock the user out for the current lockout duration
        const lockoutUntil = new Date(new Date().getTime() + lockoutDuration * 1000).toISOString();
        localStorage.setItem('lockoutTime', lockoutUntil);

        // Start countdown with the current lockout duration
        setCountdown(lockoutDuration);
        
        // Double the lockout duration for subsequent failures
        setLockoutDuration(lockoutDuration * 2);

        // Update countdown every second
        const intervalId = setInterval(() => {
          setCountdown((prev) => {
            if (prev > 1) {
              return prev - 1;
            } else {
              clearInterval(intervalId);
              localStorage.removeItem('lockoutTime');
              return 0;
            }
          });
        }, 1000);
      } else {
        localStorage.setItem('failedAttempts', failedAttempts);
        setError(`Incorrect password. You have ${5 - failedAttempts} attempts remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#f4f8ef]">
      <div className="p-6 bg-[#f6f8eb] rounded-md shadow-md w-96 border border-[#234f32]">
        <h1 className="text-2xl mb-6 text-center text-[#234f32]">EMMS</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {countdown > 0 && <p className="text-red-500 mb-4 text-center">
          Too many login attempts. Try again in {Math.floor(countdown / 60)} minutes and {countdown % 60} seconds.
        </p>}
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
          disabled={loading || countdown > 0}
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
