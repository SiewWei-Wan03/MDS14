import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { ref, update, get, child } from 'firebase/database'; // Import Firebase functions
import { database } from '../firebase'; // Import Firebase instance
import '../App.css';
import useAutoLogout from '../services/useAutoLogout';

// no longer in use




const ReassessingPage = () => {
  const [drugs, setDrugs] = useState([]);
  const [advice, setAdvice] = useState([]); // Initialize as an array
  const [showWarning, setShowWarning] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook
  const patientData = location.state?.patientData || {}; // Get patient data from location state
  const countdown = useAutoLogout();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientRef = ref(database, `patients/${patientData.ID}`);
        
        // Fetch predicted_prescriptions and predicted_advices from Firebase
        const [predictedPrescriptionsSnapshot, predictedAdvicesSnapshot] = await Promise.all([
          get(child(patientRef, 'predicted_prescriptions')),
          get(child(patientRef, 'predicted_advices'))
        ]);

        const predictedPrescriptions = predictedPrescriptionsSnapshot.val() || [];
        const predictedAdvices = predictedAdvicesSnapshot.val() || '';

        setDrugs(predictedPrescriptions);

        // Split advice into an array of sentences or display as a single block
        setAdvice(predictedAdvices.split('.').filter(advice => advice.trim() !== ''));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
      }
    };

    fetchData();
  }, [patientData.ID]);

  const removeDrug = (index) => {
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  const addDrug = () => {
    setDrugs([...drugs, { drug: '', dosage: 1 }]); // Default dosage set to 1
  };

  const handleDrugChange = (index, field, value) => {
    const predictedDrugs = drugs.map((drug, i) =>
      i === index ? { ...drug, [field]: value } : drug
    );
    setDrugs(predictedDrugs);
  };

  const handleSave = async () => {
    try {
      // Create a reference to the specific patient's data in Firebase
      const patientRef = ref(database, `patients/${patientData.ID}`);
  
      // Fetch existing prescriptions
      const existingPrescriptionsSnapshot = await get(child(patientRef, 'prescriptions'));
      const existingPrescriptions = existingPrescriptionsSnapshot.val() || [];
  
      // Get the current date and time
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0]; // yyyy-mm-dd
      const formattedTime = currentDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

  
      // Attach date and time to each drug
      const reassessedDrugs = drugs.map(drug => ({
        ...drug,
        date: formattedDate,
        time: formattedTime,
      }));
  
      // Combine reassessed drugs with existing prescriptions
      const updatedPrescriptions = [...existingPrescriptions, ...reassessedDrugs];
  
      // Update the combined prescriptions list to the 'prescriptions' location
      await update(patientRef, { prescriptions: updatedPrescriptions });
  
      // Update predicted_prescriptions and predicted_advices to null after saving them
      await update(patientRef, {
        predicted_prescriptions: null,
        predicted_advices: null
      });
  
      // Navigate to the patient-info page after saving
      navigate('/patient-info', { state: { patientData } });
    } catch (error) {
      console.error('Error updating data:', error);
      setError('Failed to update data. Please try again.');
    }
  };  

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-green-900 min-h-screen flex flex-col items-center py-6">
        <div className="mb-12">
          <img src="https://placehold.co/50x50" alt="MDS logo" />
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
          <h1 className="text-3xl text-green-900 font-semibold mb-6">Reassessing recommendations</h1>
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Drugs</th>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Dosage</th>
                <th className="p-2 bg-green-900 text-white border border-green-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((drug, index) => (
                <tr key={index}>
                  <td className="p-2 border border-green-900">
                    <input
                      type="text"
                      value={drug.drug} // Correct the reference
                      onChange={(e) => handleDrugChange(index, 'drug', e.target.value)}
                      className="w-full p-1"
                    />
                  </td>
                  <td className="p-2 border border-green-900">
                    <input
                      type="number"
                      min="1"
                      value={drug.dosage}
                      onChange={(e) => handleDrugChange(index, 'dosage', Math.max(1, e.target.value))}
                      className="w-full p-1"
                    />
                  </td>
                  <td className="p-2 border border-green-900">
                    <button
                      onClick={() => removeDrug(index)}
                      className="px-2 py-1 border rounded text-green-900 bg-white"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addDrug}
            className="px-6 py-2 mb-4 border rounded text-green-900 bg-white"
          >
            Add
          </button>
          {showWarning && (
            <div className="flex items-center mb-4 bg-green-500 p-2 rounded">
              <span className="flex-grow text-white">Excessive Drug A-443654 might not be able to be absorbed by patient due to kidney failure!</span>
              <button
                onClick={() => setShowWarning(false)}
                className="px-6 py-2 border rounded text-green-900 bg-white"
              >
                Ignore
              </button>
            </div>
          )}
          <div className="mb-6">
            <h2 className="text-2xl text-green-900 font-semibold mb-4">Additional lifestyle or dietary advice:</h2>
            <ul className="list-disc list-inside text-green-900">
              {advice.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleSave}
            className="px-8 py-4 mb-4 border rounded text-green-900 bg-white"
          >
            Save
          </button>
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </div>
        {/* Countdown Timer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-green-900">
          <p>Time until logout: {countdown} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default ReassessingPage;
