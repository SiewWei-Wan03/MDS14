import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { ref, update } from 'firebase/database'; // Firebase functions for database reference and update
import { database } from '../firebase';  // Import Firebase configuration
import '../App.css';
import useAutoLogout from '../services/useAutoLogout'; // Import custom hook for auto-logout
import * as tf from '@tensorflow/tfjs'; // TensorFlow.js library for model loading and prediction
import Papa from 'papaparse'; // Library to parse CSV data

const SelectPrescriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData || {}; // Retrieve patient data from previous route
  const [selectedDrug, setSelectedDrug] = useState('');
  const [selectedPreviousDrug, setSelectedPreviousDrug] = useState(''); // State for previous drugs
  const [error, setError] = useState('');
  const [model, setModel] = useState(null); // State to hold the loaded TensorFlow model
  const [predictionResult, setPredictionResult] = useState(null); // State to hold the model prediction
  const [isModelLoading, setIsModelLoading] = useState(true); // Loading state for the model
  const [csvData, setCsvData] = useState([]); // State to store the CSV data

  const countdown = useAutoLogout(); // Custom hook for countdown and auto logout

  // List of drugs to be displayed in dropdowns
  const drugsList = [ /* ... array of drugs ... */ ];

  // Function to load the TensorFlow model from a local JSON file
  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      const loadedModel = await tf.loadGraphModel('/model.json'); // Load model from local path
      setModel(loadedModel);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error); // Handle any errors while loading the model
    } finally {
      setIsModelLoading(false); // Set loading to false once model is loaded or error occurs
    }
  };

  // Function to load and parse CSV data using PapaParse
  const loadCsvData = async () => {
    try {
      Papa.parse('/final_SMILES_processed.csv', {
        header: true,
        download: true,
        complete: (results) => {
          setCsvData(results.data); // Store parsed CSV data in the state
          console.log('CSV data loaded successfully');
        },
        error: (error) => {
          console.error("Error loading CSV:", error); // Handle errors in parsing CSV
        },
      });
    } catch (error) {
      console.error('Error in loadCsvData:', error); // Error handling for CSV loading
    }
  };

  // Load the model and CSV data when the component mounts
  useEffect(() => {
    loadModel(); // Load the TensorFlow model
    loadCsvData(); // Load the CSV data
  }, []);

  // Event handler for selecting current drug
  const handleDrugChange = (event) => {
    setSelectedDrug(event.target.value);
  };

  // Event handler for selecting previous drug
  const handlePreviousDrugChange = (event) => {
    setSelectedPreviousDrug(event.target.value);
  };

  // Event handler for cancel action
  const handleCancel = () => {
    navigate('/patient-info', { state: { patientData } }); // Redirect back to patient info page
  };

  // Event handler for saving the prescription
  const handleSave = async () => {
    try {
      if (isModelLoading) {
        console.log("Model is still loading. Please wait.");
        return;
      }
  
      if (!model) {
        console.log("Model not loaded yet. Please try again.");
        return;
      }
  
      // Match selected drugs with the CSV data
      const selectedDrugA = selectedPreviousDrug; // Assuming this is DrugA
      const selectedDrugB = selectedDrug; // Assuming you have a second drug state for DrugB
  
      // Find the matching data from CSV based on selected drugs
      const matchedData = csvData.find(
        (entry) => entry.DrugA === selectedDrugA && entry.DrugB === selectedDrugB
      );
  
      if (!matchedData) {
        console.log("No matching drugs found in the dataset.");
        setError("No matching drugs found in the dataset. Please check your selections.");
        return;
      }
  
      // Extract features for model input (Tanimoto and other features)
      const {
        tanimoto,
        feature_jsim,
        feature_dsim,
        feature_osim,
      } = matchedData;
  
      // Prepare input tensor for the model
      const inputData = [parseFloat(tanimoto), parseFloat(feature_jsim), parseFloat(feature_dsim), parseFloat(feature_osim)];
      const inputTensor = tf.tensor(inputData, [1, inputData.length]); // Create tensor with the correct shape
  
      // Make predictions with the loaded model
      const prediction = model.predict(inputTensor); // Use the model to make predictions
      const predictedValue = await prediction.array(); // Extract the prediction result array
      setPredictionResult(predictedValue); // Store the result to display
      
      // Drug-Drug Interaction (DDI) mapping
      const ddi_mapping = {
        'No interaction found, can be prescribed safely.': 0,
        'Minor interaction found, be careful with the dosage when prescribe': 1,
        'Moderate interaction found, better to choose another prescription.': 2,
        'Major interaction found, should not be prescribed.': 3
      };

      // Determine the maximum prediction value and corresponding category
      const maxPredictionValue = Math.max(...predictedValue[0]);
      let maxIndex = predictedValue[0].indexOf(maxPredictionValue);

      if ((predictedValue[0][3]) > 0.1) {
        maxIndex = 3;
      } else if ((predictedValue[0][2] > 0.15)) {
        maxIndex = 2;
      } else if ((predictedValue[0][1]) > 0.17) {
        maxIndex = 1;
      }
      
      // Reverse map DDI result to find the category
      const reverseDdiMapping = Object.fromEntries(
        Object.entries(ddi_mapping).map(([key, value]) => [value, key])
      );

      // Get the corresponding DDI category
      const ddiCategory = reverseDdiMapping[maxIndex];
  
      // Save the selected prescription to Firebase
      const patientRef = ref(database, patients/${patientData.ID}); // Reference to Firebase database for the patient
      const updatedPrescription = selectedDrug;
  
      await update(patientRef, { selected_prescription: updatedPrescription }); // Update Firebase with the selected prescription

      // Redirect to recommendations page with the prediction result and drug info
      navigate('/recommendations', { state: { patientData, ddiCategory, selectedDrug, selectedPreviousDrug, matchedData } });
    
    } catch (error) {
      console.error('Error saving prescription:', error); // Handle errors in saving the prescription
      setError('Failed to save prescription. Please try again.');
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
            <FaUser className="text-2xl" title="Main Page"/>
          </Link>
          <Link to="/login">
            <FaSignOutAlt className="text-2xl" title='Log Out'/>
          </Link>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F8EF]">
        <div className="w-full max-w-4xl p-8">
          <h1 className="text-3xl text-green-900 font-semibold mb-6">
            Select Prescription
          </h1>
          <p className="text-xl text-green-900 mb-4">
            Please select a drug from the dropdown menus:
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Previous Drugs Dropdown */}
          <div className="flex flex-col mb-4">
            <label className="text-green-900 mb-2">Previous Drugs:</label>
            <select
              value={selectedPreviousDrug}
              onChange={handlePreviousDrugChange}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select a previous drug</option>
              {drugsList.map((drug, index) => (
                <option key={index} value={drug}>
                  {drug}
                </option>
              ))}
            </select>
          </div>

          {/* Current Drugs Dropdown */}
          <div className="flex flex-col mb-4">
            <label className="text-green-900 mb-2">Current Drugs:</label>
            <select
              value={selectedDrug}
              onChange={handleDrugChange}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select a current drug</option>
              {drugsList.map((drug, index) => (
                <option key={index} value={drug}>
                  {drug}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-green-900 text-white px-4 py-2 rounded-md"
            >
              Save Prescription
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>

          {/* Display model prediction result */}
          {predictionResult && (
            <div className="mt-4">
              <p className="text-green-900">Predicted Result: {predictionResult}</p>
            </div>
          )}
        </div>
        {/* Countdown Timer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-green-900">
          <p>Time until logout: {countdown} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default SelectPrescriptionPage;
