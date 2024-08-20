import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { ref, get, child, update } from 'firebase/database';
import { database } from '../firebase'; 
import '../App.css';
import Popup from './Popup'; 

const RecommendationsPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [predicted_retried_prescriptions, setPrescriptions] = useState([]);
  const [advices, setAdvices] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData || {};

  useEffect(() => {
    console.log(patientData);

    const fetchPrescriptionsAndAdvices = async () => {
      try {
        const patientRef = ref(database, `patients/${patientData.ID}`);
    
        const [nprescriptionsSnapshot, advicesSnapshot] = await Promise.all([
          get(child(patientRef, 'predicted_prescriptions')),
          get(child(patientRef, 'predicted_advices'))
        ]);
    
        const nprescriptions = nprescriptionsSnapshot.val() || [];
        setPrescriptions(nprescriptions);
        console.log(nprescriptions);
    
        const advicesData = advicesSnapshot.val() || '';
        const advicesList = advicesData.split('.').filter(sentence => sentence.trim() !== '').map(sentence => sentence.trim() + '.');
        setAdvices(advicesList);
        console.log(advicesList);
    
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
      }
    };

    fetchPrescriptionsAndAdvices();
  }, [location.state?.patientData]);

  const handleIgnore = () => {
    setShowPopup(true);
  };

  const handlePopupOk = () => {
    setShowPopup(false);
    navigate('/reassessing', { state: { patientData } });
  };

  const handleAccept = async () => {
    const patientData = location.state?.patientData || {};
  
    try {
      // Create a reference to the specific patient's data
      const patientRef = ref(database, `patients/${patientData.ID}`);
  
      // Fetch predicted prescriptions
      const nprescriptionsSnapshot = await get(child(patientRef, 'predicted_prescriptions'));
      const nprescriptions = nprescriptionsSnapshot.val() || [];
  
      // Fetch existing prescriptions
      const existingPrescriptionsSnapshot = await get(child(patientRef, 'prescriptions'));
      const existingPrescriptions = existingPrescriptionsSnapshot.val() || [];
  
      // Get the current date and time
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().split(' ')[0].slice(0, 5);
  
      // Add current date and time to each predicted prescription
      const updatedNprescriptions = nprescriptions.map(prescription => ({
        ...prescription,
        date: formattedDate,
        time: formattedTime,
      }));
  
      // Combine predicted prescriptions with existing ones
      const updatedPrescriptions = [...(existingPrescriptions || []), ...(updatedNprescriptions || [])];
  
      // Update the combined prescriptions list to the 'prescriptions' location
      await update(patientRef, { prescriptions: updatedPrescriptions });
  
      // Update predicted_prescriptions and predicted_advices to null
      await update(patientRef, {
        predicted_prescriptions: null,
        predicted_advices: null
      });
  
      // Navigate to the patient-info page
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
          <h1 className="text-3xl text-green-900 font-semibold mb-6">
            Recommended drugs combinations and dosages
          </h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Drugs</th>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Dosage</th>
              </tr>
            </thead>
            <tbody>
              {predicted_retried_prescriptions.length > 0 ? (
                predicted_retried_prescriptions.map((prescription, index) => (
                  <tr key={index}>
                    <td className="p-2 border border-green-900">{prescription.drug}</td>
                    <td className="p-2 border border-green-900">{prescription.dosage}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="p-2 border border-green-900 text-center">No prescriptions available</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mb-6">
            <h2 className="text-2xl text-green-900 font-semibold mb-4">Additional lifestyle or dietary advice:</h2>
            <ul className="list-disc list-inside text-green-900">
              {advices.length > 0 ? (
                advices.map((description, index) => (
                  <li key={index}>{description}</li>
                ))
              ) : (
                <li>No additional advice available</li>
              )}
            </ul>
          </div>
          <div className="flex justify-end">
            <button className="mr-4 px-6 py-2 border rounded text-green-900 bg-white" onClick={handleAccept}>Accept</button>
            <button className="px-6 py-2 border rounded text-green-900 bg-white" onClick={handleIgnore}>Ignore</button>
          </div>
        </div>
      </div>
      {showPopup && <Popup onOk={handlePopupOk} />} {/* Conditionally render the Popup */}
    </div>
  );
};

export default RecommendationsPage;
