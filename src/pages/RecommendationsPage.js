import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { ref, get, child, update } from 'firebase/database';
import { database } from '../firebase'; 
import { Chart } from 'chart.js/auto'; // Import Chart.js
import '../App.css';
import useAutoLogout from '../services/useAutoLogout';

const getDrugImageUrl = (drugName) => 
  `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${drugName}/PNG`;

const RecommendationsPage = () => {
  const [error, setError] = useState('');
  const [warning, setWarning] = useState(''); // State for showing warning if dosage is less than 1
  const [previousDrugImageUrl, setPreviousDrugImageUrl] = useState(null); // State to store previous drug image URL
  const [selectedDrugImageUrl, setSelectedDrugImageUrl] = useState(null); // State to store selected drug image URL
  const navigate = useNavigate();
  const location = useLocation();
  const [dosage, setDosage] = useState(1); // State for dosage control
  const patientData = location.state?.patientData || {};
  const ddiCategory = location.state?.ddiCategory || 'N/A';  // Get ddiCategory from navigation state
  const selectedPreviousDrugs = location.state?.selectedPreviousDrug || 'No previous drugs'; // Default text
  const selectedDrugs = location.state?.selectedDrug || 'No selected drugs'; // Default text
  const {
    tanimoto,
    feature_jsim,
    feature_dsim,
    feature_osim,
  } = location.state?.matchedData;
  const countdown = useAutoLogout();
  const chartRef = useRef(null); // Use useRef to store chart reference

  useEffect(() => {
    // Fetch the chemical structure images for both previousDrug and selectedDrug
    const fetchDrugImages = async () => {
      if (selectedPreviousDrugs && selectedPreviousDrugs !== 'No previous drugs') {
        try {
          const responsePrevious = await fetch(getDrugImageUrl(selectedPreviousDrugs)); // Fetch image from PubChem for previous drug
          if (responsePrevious.ok) {
            const previousImageUrl = responsePrevious.url;
            setPreviousDrugImageUrl(previousImageUrl);
          } else {
            setError(`Could not retrieve image for ${selectedPreviousDrugs}`);
          }
        } catch (error) {
          console.error('Error fetching previous drug image:', error);
          setError('Failed to retrieve previous drug image.');
        }
      }
      if (selectedDrugs && selectedDrugs !== 'No selected drugs') {
        try {
          const responseSelected = await fetch(getDrugImageUrl(selectedDrugs)); // Fetch image from PubChem for selected drug
          if (responseSelected.ok) {
            const selectedImageUrl = responseSelected.url;
            setSelectedDrugImageUrl(selectedImageUrl);
          } else {
            setError(`Could not retrieve image for ${selectedDrugs}`);
          }
        } catch (error) {
          console.error('Error fetching selected drug image:', error);
          setError('Failed to retrieve selected drug image.');
        }
      }
    };
    fetchDrugImages();
  }, [selectedPreviousDrugs, selectedDrugs]);

  const handleIgnore = () => {
    navigate('/patient-info', { state: { patientData } });
  };

  const handleDosageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1) {
      setDosage(value);
      setWarning(''); // Clear warning if valid dosage is entered
    } else {
      setWarning('Dosage must be at least 1'); // Show warning if dosage is less than 1
    }
  };

  const handleAccept = async () => {
    // Check if the dosage is less than 1 and prevent proceeding
    if (dosage < 1) {
      setWarning('Dosage must be at least 1 to proceed.');
      return;
    }
  
    try {
      const patientRef = ref(database, `patients/${patientData.patientID}`);
      const existingPrescriptionsSnapshot = await get(child(patientRef, 'prescriptions'));
      const existingPrescriptions = existingPrescriptionsSnapshot.val() || [];
  
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().split(' ')[0].slice(0, 5);
  
      const newPrescription = {
        drug: selectedDrugs,
        dosage,
        date: formattedDate,
        time: formattedTime,
        drug: selectedDrugs,
        dosage,
        date: formattedDate,
        time: formattedTime,
        previousDrug: selectedPreviousDrugs,
        ddiCategory,
        ddiCategory,
      };
  
      const updatedPrescriptions = [...(existingPrescriptions || []), newPrescription];
      await update(patientRef, { prescriptions: updatedPrescriptions });
  
      const snapshot = await get(patientRef);
      if (snapshot.exists()) {
        const patientData = snapshot.val();
        navigate('/patient-info', { state: { patientData } });
      } 
    } catch (error) {
      console.error('Error updating data:', error);
      setError('Failed to update data. Please try again.');
    }
  };

  // Use useEffect to create chart when the component mounts
  useEffect(() => {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy previous chart instance before creating a new one
    }

    // Create a new chart instance
    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Tanimoto', 'Feature JSim', 'Feature DSim', 'Feature OSim'],
        datasets: [
          {
            label: 'Drug Feature Comparison',
            data: [tanimoto, feature_jsim, feature_dsim, feature_osim],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointRadius: 4,
            fill: true
          }
        ]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true
          }
        }
      }
    });
    

    // Clean up chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [tanimoto, feature_jsim, feature_dsim, feature_osim]); // Add dependencies to rerender the chart if data changes

  return (
    <div className="flex">
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

      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F8EF]">
        <div className="w-full max-w-4xl p-8">
          <h1 className="text-3xl text-green-900 font-semibold mb-6">
            Recommended Drugs Combinations and Dosages
          </h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex items-center mb-6">
            {previousDrugImageUrl && (
              <div className="mr-4">
                <img src={previousDrugImageUrl} alt={`${selectedPreviousDrugs} structure`} className="w-32 h-32" />
                <p className="text-green-900">{selectedPreviousDrugs}</p>
              </div>
            )}
            
            {/* Add large plus symbol between the drug images */}
            <div className="text-green-900 text-5xl font-bold mx-4">+</div>
            
            {selectedDrugImageUrl && (
              <div>
                <img src={selectedDrugImageUrl} alt={`${selectedDrugs} structure`} className="w-32 h-32" />
                <p className="text-green-900">{selectedDrugs}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl text-green-900 font-semibold">{ddiCategory}</h2>
          </div>

          {/* Chart Container */}
          <div className="mb-6">
            <h2 className="text-2xl text-green-900 font-semibold mb-4">Feature Comparison Chart
            </h2>
            
            <canvas id="myChart" width="400" height="150"></canvas>
          </div>

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
                    min="1" // Set min to 1 to prevent user from entering values lower than 1
                    step="1"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <button className="mr-4 px-6 py-2 border rounded text-green-900 bg-white" onClick={handleAccept}>Accept</button>
            <button className="px-6 py-2 border rounded text-green-900 bg-white" onClick={handleIgnore}>Ignore</button>
          </div>
        </div>

        <div className="bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-green-900">
          <p>Time until logout: {countdown} seconds</p>
        </div>
      </div>
    </div>
  );
};
export default RecommendationsPage;
