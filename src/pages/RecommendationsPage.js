import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { ref, get, child, update } from 'firebase/database';
import { database } from '../firebase'; 
import '../App.css';
import useAutoLogout from '../services/useAutoLogout';

const RecommendationsPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [dosage, setDosage] = useState(0); // State for dosage control
  const patientData = location.state?.patientData || {};
  const ddiCategory = location.state?.ddiCategory || 'N/A';  // Get ddiCategory from navigation state
  const selectedPreviousDrugs = location.state?.selectedPreviousDrug || 'No previous drugs'; // Default text
  const selectedDrugs = location.state?.selectedDrug || 'No selected drugs'; // Default text
  const countdown = useAutoLogout();

  const handleIgnore = () => {
    navigate('/reassessing', { state: { patientData } });
  };

  const handleDosageChange = (e) => {
    setDosage(e.target.value); // Update dosage state when value changes
  };

  const handleAccept = async () => {
    const patientData = location.state?.patientData || {};
    const selectedDrugs = location.state?.selectedDrug || 'No selected drugs'; // Get the selected drug from state
  
    try {
      // Create a reference to the specific patient's data in Firebase
      const patientRef = ref(database, `patients/${patientData.ID}`);
  
      // Fetch existing prescriptions from Firebase
      const existingPrescriptionsSnapshot = await get(child(patientRef, 'prescriptions'));
      const existingPrescriptions = existingPrescriptionsSnapshot.val() || [];
  
      // Get the current date and time
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().split(' ')[0].slice(0, 5);
  
      // Create a new prescription entry with selectedDrugs and dosage
      const newPrescription = {
        drug: selectedDrugs, // Add selected drug(s)
        dosage, // Add the selected dosage (from the state)
        date: formattedDate, // Add the current date
        time: formattedTime, // Add the current time
        previousDrug: selectedPreviousDrugs,
        ddiCategory, // Add the DDI category from the previous state
      };
  
      // Combine the new prescription with existing ones
      const updatedPrescriptions = [...(existingPrescriptions || []), newPrescription];
  
      // Update the combined prescriptions list to Firebase
      await update(patientRef, { prescriptions: updatedPrescriptions });
  
      // Navigate to the patient-info page after saving
      navigate('/patient-info', { state: { patientData } });
    } catch (error) {
      console.error('Error updating data:', error); // Log any errors
      setError('Failed to update data. Please try again.'); // Set an error message
    }
  };
  
  

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-green-900 min-h-screen flex flex-col items-center py-6">
      <div className="logo mb-12">
        <img src="/doctor_img.png" alt="Profile picture" className="w-12 h-12" /> 
      </div>
        <nav className="flex flex-col gap-8 text-green-200">
        <Link to="/main">
            <FaUser className="text-2xl" />
          </Link>
          <Link to="/login">
            <FaSignOutAlt className="text-2xl" />
          </Link>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F8EF]">
        <div className="w-full max-w-4xl p-8">
          <h1 className="text-3xl text-green-900 font-semibold mb-6">
            Recommended Drugs Combinations and Dosages
          </h1>

          {/* Display selected drugs and DDI category */}
          <div className="mb-6">
            <h2 className="text-2xl text-green-900 font-semibold">{selectedPreviousDrugs} & {selectedDrugs}: {ddiCategory}</h2>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Prescription Table */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Drugs</th>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Dosage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-green-900">{selectedDrugs}</td>
                <td className="p-2 border border-green-900">
                  <input 
                    type="number" 
                    value={dosage} 
                    onChange={handleDosageChange} 
                    className="border p-1 w-20"
                    min="0"
                    step="1"
                  />
                </td>
              </tr>
            </tbody>
          </table>        

          {/* Accept/Ignore Buttons */}
          <div className="flex justify-end">
            <button className="mr-4 px-6 py-2 border rounded text-green-900 bg-white" onClick={handleAccept}>Accept</button>
            <button className="px-6 py-2 border rounded text-green-900 bg-white" onClick={handleIgnore}>Ignore</button>
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

export default RecommendationsPage;
