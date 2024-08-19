import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';
import { ref, get, child } from 'firebase/database';
import { database } from '../firebase'; // Ensure that this is the correct path to your Firebase instance
import '../App.css';

const PatientInfoPage = () => {
  const [patientData, setPatientData] = useState(null); // State to store patient data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle any errors
  const navigate = useNavigate();
  const location = useLocation();
  const patientID = location.state?.patientData?.ID; // Get the patient ID from location state

  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientID) {
        try {
          const patientRef = ref(database, `patients/${patientID}`);
          const snapshot = await get(child(patientRef, '/'));
  
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('Fetched patient data:', data);  // Add this line
            setPatientData(data); // Set the fetched data to state
          } else {
            setError('No data available for this patient.');
          }
        } catch (error) {
          console.error('Error fetching patient data:', error);
          setError('Failed to fetch patient data. Please try again.');
        } finally {
          setLoading(false); // Set loading to false once the data is fetched
        }
      } else {
        setLoading(false);
        setError('No patient ID provided.');
      }
    };
  
    fetchPatientData();
  }, [patientID]);
  
  const handleAddConditions = () => {
    navigate('/add-conditions', { state: { patientData } });
  };

  if (loading) {
    return <div>Loading...</div>; // Display a loading state
  }

  if (error) {
    return <div>{error}</div>; // Display any errors
  }

  if (!patientData) {
    return <div>No patient data available</div>;
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-green-900 min-h-screen flex flex-col items-center py-6">
        <div className="mb-12">
          <img src="https://placehold.co/50x50" alt="MDS logo" />
        </div>
        <nav className="flex flex-col gap-8 text-green-200">
          <Link to="/">
            <FaUser className="text-2xl" />
          </Link>
          <FaEnvelope className="text-2xl" />
          <FaSignOutAlt className="text-2xl" />
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F8EF]">
        <div className="w-full max-w-4xl p-8">
          <div className="flex justify-end mb-6">
            <input type="text" placeholder="Search..." className="border border-green-900 rounded px-4 py-2" />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl text-green-900 font-semibold mb-4">General Information</h1>
            <div className="flex justify-around">
              <div className="bg-green-900 text-white p-6 rounded-lg w-1/3 text-left">
                <div className="flex items-center mb-4">
                  <img src="https://placehold.co/50x50" alt="Patient avatar" className="rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">Patient</p>
                    <p>{patientData.name}</p>
                  </div>
                </div>
                <p>Date of birth: <span className="font-semibold">{patientData.DOB}</span></p>
                <p>Age: <span className="font-semibold">{patientData.age}</span></p>
                <p>Patient ID: <span className="font-semibold">{patientData.ID}</span></p>
              </div>
              <div className="w-1/3">
                <h2 className="text-green-900 font-semibold mb-4">Medical Conditions:</h2>
                <ul className="text-left">
                  {patientData.conditions.map((condition, index) => (
                    <li key={index} className="bg-green-100 text-green-900 rounded px-4 py-2 mb-2">
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-2xl text-green-900 font-semibold mb-4">Prescription History</h2>
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
                {patientData.prescriptions.map((prescription, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border border-green-900">{prescription.drug}</td>
                    <td className="px-4 py-2 border border-green-900">{prescription.dosage}</td>
                    <td className="px-4 py-2 border border-green-900">{prescription.date}</td>
                    <td className="px-4 py-2 border border-green-900">{prescription.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAddConditions} className="flex items-center mt-4 text-green-900 bg-transparent border-none cursor-pointer">
              <FaPlusCircle className="mr-2" />
              Add new prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoPage;
