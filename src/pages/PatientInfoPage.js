import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import useAutoLogout from '../services/useAutoLogout'; // Import the custom hook
import '../App.css';

const PatientInfoPage = () => {
  const [patientD, setPatientData] = useState(null); // State to hold patient data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieving the patient data from location state passed from another page
  const patientData = location.state?.patientData;
  const patientID = location.state?.patientData.patientID;

  // Use the custom hook to handle auto logout and countdown
  const countdown = useAutoLogout(); 
  useEffect(() => {
    console.log("patient ID:", patientID);
  }, [patientID]);

  const handleAddPrescriptions = () => {
    // Navigate to the prescription page, passing the current patient data
    navigate('/select-prescriptions', { state: { patientData } });
  };

  if (error) return <div>{error}</div>;
  if (!patientData) return <div>No patient data available</div>; // Display message if no patient data is available

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-green-900 min-h-screen flex flex-col items-center py-6">
        <div className="logo mb-12">
          <img src="/doctor_img.png" alt="Profile picture" className="w-12 h-12" />
        </div>
        <nav className="flex flex-col gap-8 text-green-200">
          <Link to="/main">
            <FaUser className="text-2xl" title="Main Page"/>
          </Link>
          <Link to="/login">
            <FaSignOutAlt className="text-2xl" title='Log Out'/>
          </Link>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F8EF] relative">
        <div className="w-full max-w-4xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-green-900 font-semibold mb-4">General Information</h1>
            <div className="flex justify-around">
              {/* Display patient's general information */}
              <div className="bg-green-900 text-white p-6 rounded-lg w-1/3 text-left">
                <div className="flex items-center mb-4">
                  <img src="/patient1.png" alt="Patient avatar" className="w-12 h-12 mr-4" />
                  <div>
                    <p className="font-semibold">Patient</p>
                    {/* Display patient's name */}
                    <p>{patientData.name}</p> 
                  </div>
                </div>
                {/* Display patient's date of birth and age */}
                <p className='font-semibold'>Date of birth: <span className='font-normal'>{patientData.DOB}</span></p>
                <p className='font-semibold'>Age: <span className="font-normal">{patientData.age}</span></p>
                {/* Display patient's ID */}
                <p className='font-semibold'>Patient ID: <span className="font-normal">{patientData.patientID}</span></p>
              </div>
              {/* Display patient's medical conditions */}
              <div className="w-1/3 max-h-40 overflow-y-auto">
                <h2 className="text-green-900 font-semibold mb-4">Medical Conditions:</h2>
                <ul className="text-left">
                  {/* Check if conditions exist and map over them to display each condition */}
                  {Array.isArray(patientData?.conditions) && patientData.conditions.length > 0 ? (
                    patientData.conditions.map((condition, index) => (
                      <li key={index} className="bg-green-100 text-green-900 rounded px-4 py-2 mb-2">
                        {condition}
                      </li>
                    ))
                  ) : (
                    <p>No medical conditions found</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
          {/* Display patient's prescription history */}
          <div className="text-center mb-8">
            <h2 className="text-2xl text-green-900 font-semibold mb-4">Prescription History</h2>
            <div className="h-64 overflow-y-auto">
              <table className="table-auto w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border border-green-900">Drugs</th>
                    <th className="px-4 py-2 border border-green-900">Dosage</th>
                    <th className="px-4 py-2 border border-green-900">Date</th>
                    <th className="px-4 py-2 border border-green-900">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Check if there are prescriptions available, skip the initial dummy entry */}
                  {patientData.prescriptions && patientData.prescriptions.length > 1 ? (
                    patientData.prescriptions.slice(1).map((prescription, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border border-green-900">{prescription.drug}</td>
                        <td className="px-4 py-2 border border-green-900">{prescription.dosage}</td>
                        <td className="px-4 py-2 border border-green-900">{prescription.date}</td>
                        <td className="px-4 py-2 border border-green-900">{prescription.time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 border border-green-900 text-center">No prescriptions available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Button to add a new prescription */}
            <button onClick={handleAddPrescriptions} className="flex items-center mt-4 text-green-900 bg-transparent border-none cursor-pointer">
              <FaPlusCircle className="mr-2" />
              Add new prescription
            </button>
          </div>
        </div>
        {/* Countdown Timer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-green-900">
          <p>Time until logout: {countdown} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoPage;
