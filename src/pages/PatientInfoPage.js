import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import useAutoLogout from '../services/useAutoLogout'; // Import the custom hook
import '../App.css';

const PatientInfoPage = () => {
  const [patientD, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  // const { state } = useLocation();
  const patientData = location.state?.patientData;
  const patientID = location.state?.patientData.patientID;
  

  // Use the custom hook to handle auto logout and countdown
  const countdown = useAutoLogout(); 
  useEffect (() => {
    console.log("patient ID:", patientID)
  })

  // // Fetch patient data
  // useEffect(() => {
  //   const fetchPatientData = async () => {
  //     if (patientID) {
  //       try {
  //         const snapshot = await get(ref(database, `patients/${patientID}`));
  //         if (snapshot.exists()) {
  //           setPatientData(snapshot.val());
  //         } else {
  //           setError('No data available for this patient.');
  //         }
  //       } catch (error) {
  //         console.error('Error fetching patient data:', error);
  //         setError('Failed to fetch patient data. Please try again.');
  //       } finally {
  //         setLoading(false);
  //       }
  //     } else {
  //       setLoading(false);
  //       setError('No patient ID provided.');
  //       // Optionally redirect to home if patient ID is missing
  //       setTimeout(() => navigate('/main'), 2000);
  //     }
  //   };

  //   fetchPatientData();
  // }, [patientD]);

  const handleAddPrescriptions = () => {
    navigate('/select-prescriptions', { state: { patientData } });
  };

  if (error) return <div>{error}</div>;
  if (!patientData) return <div>No patient data available</div>

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
          {/* <div className="flex justify-end mb-6">
            <input type="text" placeholder="Search..." className="border border-green-900 rounded px-4 py-2" />
          </div> */}
          <div className="text-center mb-8">
            <h1 className="text-3xl text-green-900 font-semibold mb-4">General Information</h1>
            <div className="flex justify-around">
              <div className="bg-green-900 text-white p-6 rounded-lg w-1/3 text-left">
                <div className="flex items-center mb-4">
                  <img src="/patient1.png" alt="Patient avatar" className="w-12 h-12 mr-4" />
                  <div>
                    <p className="font-semibold">Patient</p>
                    <p>{patientData.name}</p>
                  </div>
                </div>
                <p className='font-semibold'>Date of birth: <span className='font-normal'>{patientData.DOB}</span></p>
                <p className='font-semibold'>Age: <span className="font-normal">{patientData.age}</span></p>
                <p className='font-semibold'>Patient ID: <span className="font-normal">{patientData.patientID}</span></p>
              </div>
              <div className="w-1/3 max-h-40 overflow-y-auto">
                <h2 className="text-green-900 font-semibold mb-4">Medical Conditions:</h2>
                <ul className="text-left">
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
