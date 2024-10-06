import React, { useState } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase'; // Adjust path as necessary
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate for redirection
import { FaUser, FaSignOutAlt } from 'react-icons/fa'; // Import icons
import useAutoLogout from '../services/useAutoLogout';

// Function to validate Patient ID (should start with 'PA' followed by 5 digits)
const isValidPatientID = (patientID) => {
  const patientIDPattern = /^PA\d{5}$/; // Patient ID must start with 'PA' and be followed by exactly 5 digits
  return patientIDPattern.test(patientID);
};

// Function to sanitize inputs (removing unwanted characters)
const sanitizeInput = (input) => {
  return input.replace(/[^a-zA-Z0-9]/g, ''); // Removes any non-alphanumeric characters
};

const AddPatientPage = () => {
  const [patientID, setPatientID] = useState('');
  const [patientName, setPatientName] = useState('');
  const [dob, setDOB] = useState('');
  const [age, setAge] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize navigate for redirection

  const countdown = useAutoLogout();

  // List of predefined medical conditions
  const medicalConditionsList = [
    "Allergy to local anesthetics", "Alzheimer's disease", "Anemia", /* ... other conditions ... */
    "Thyroid cancer", "Thyroid disease", "Tuberculosis", "Ulcerative colitis"
  ];

  // Handle adding a new condition
  const handleConditionChange = (e) => {
    const condition = e.target.value;
    if (condition && !selectedConditions.includes(condition)) {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  // Handle removing a condition
  const removeCondition = (conditionToRemove) => {
    setSelectedConditions(selectedConditions.filter((condition) => condition !== conditionToRemove));
  };

  // Function to check if Patient ID already exists in the database
  const checkIfPatientIDExists = async (id) => {
    const patientRef = ref(database, `patients/${id}`);
    const snapshot = await get(patientRef);
    return snapshot.exists(); // Returns true if the patient ID exists
  };

  const handleAddPatient = async () => {
    // Clear any previous error
    setError('');

    // Validate and sanitize Patient ID
    if (!isValidPatientID(patientID)) {
      setError('Patient ID must start with PA and be followed by exactly 5 digits.');
      return;
    }

    const sanitizedPatientID = sanitizeInput(patientID);
    const sanitizedPatientName = sanitizeInput(patientName);

    // Ensure all fields except age are filled
    if (!sanitizedPatientID.trim() || !sanitizedPatientName.trim() || !dob.trim() || !age.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    // Ensure age is at least 1
    if (age < 1) {
      setError('Age must be at least 1.');
      return;
    }

    // Check if the Patient ID already exists
    const idExists = await checkIfPatientIDExists(sanitizedPatientID);
    if (idExists) {
      setError('Patient ID already exists. Please choose a different ID.');
      return;
    }

    // If valid and does not exist, add new patient to Firebase
    const newPatientRef = ref(database, `patients/${sanitizedPatientID}`);

    try {
      await set(newPatientRef, {
        patientID: sanitizedPatientID,
        name: sanitizedPatientName,
        DOB: dob,
        age: age,
        conditions: selectedConditions, // Save selected conditions as an array
        prescriptions: ['dummy'] // Initialize prescriptions as an empty array
      });
      alert(`Patient ${sanitizedPatientName} has been added successfully!`);
      setPatientID('');
      setPatientName('');
      setDOB('');
      setAge('');
      setSelectedConditions([]);  // Clear selected conditions

      // Redirect back to the main page
      navigate('/main');
    } catch (error) {
      console.error('Error adding patient:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar w-1/6 bg-green-900 min-h-screen flex flex-col items-center py-6">
        <div className="logo mb-12">
          <img src="/doctor_img.png" alt="Profile picture" className="w-12 h-12" />
        </div>
        <nav className="nav-icons flex flex-col gap-8 text-green-200">
          <Link to="/main">
            <FaUser className="text-2xl" />
          </Link>
          <Link to="/login">
            <FaSignOutAlt className="text-2xl" />
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-5/6 bg-[#F4F8EF] flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl text-green-900 font-semibold mb-6">Add a New Patient</h1>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Patient ID Input */}
        <div className="mb-4 w-80">
          <label className="text-sm text-green-800 block mb-2">Patient ID</label>
          <input
            type="text"
            value={patientID}
            onChange={(e) => setPatientID(e.target.value)}
            placeholder="Patient ID (e.g. PA01234)" // Updated placeholder
            className="border border-green-900 rounded px-4 py-2 w-full"
          />
        </div>

        {/* Patient Name Input */}
        <div className="mb-4 w-80">
          <label className="text-sm text-green-800 block mb-2">Patient Name</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="border border-green-900 rounded px-4 py-2 w-full"
          />
        </div>

        {/* Patient DOB Input */}
        <div className="mb-4 w-80">
          <label className="text-sm text-green-800 block mb-2">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDOB(e.target.value)}
            className="border border-green-900 rounded px-4 py-2 w-full"
          />
        </div>

        {/* Patient Age Input */}
        <div className="mb-4 w-80">
          <label className="text-sm text-green-800 block mb-2">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter Age" // Added placeholder for age
            min="1" // Ensure the minimum age is 1
            className="border border-green-900 rounded px-4 py-2 w-full"
          />
        </div>

        {/* Medical Conditions Dropdown */}
        <div className="mb-4 w-80">
          <label className="text-sm text-green-800 block mb-2">Medical Conditions</label>
          <select
            onChange={handleConditionChange}
            className="border border-green-900 rounded px-4 py-2 w-full"
          >
            <option value="">Select a condition</option>
            {medicalConditionsList.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        {/* Display Selected Conditions */}
        <div className="mb-4 w-80">
          {selectedConditions.length > 0 && (
            <div className="flex flex-wrap">
              {selectedConditions.map((condition) => (
                <div key={condition} className="border border-green-900 rounded px-2 py-1 mb-2 mr-2 flex items-center">
                  <span className="mr-2">{condition}</span>
                  <button
                    onClick={() => removeCondition(condition)}
                    className="text-red-600"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Patient Button */}
        <button className="bg-green-900 text-white px-6 py-2 rounded" onClick={handleAddPatient}>
          Add Patient
        </button>

        {/* Countdown Timer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-green-900">
          <p>Time until logout: {countdown} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default AddPatientPage;
