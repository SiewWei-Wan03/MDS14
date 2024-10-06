import React, { useState, useEffect } from 'react';
import { ref, update, set } from 'firebase/database';
import { database } from '../firebase'; // Adjust path as necessary
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate for redirection
import { FaUser, FaSignOutAlt } from 'react-icons/fa'; // Import icons
import useAutoLogout from '../services/useAutoLogout'; 


const AddPatientPage = () => {
  const [patientID, setPatientID] = useState('');
  const [patientName, setPatientName] = useState('');
  const [dob, setDOB] = useState('');
  const [age, setAge] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);

  const navigate = useNavigate(); // Initialize navigate for redirection

  const countdown = useAutoLogout();

  // List of predefined medical conditions
  const medicalConditionsList = [
    "Allergy to local anesthetics",
    "Alzheimer's disease",
    "Anemia",
    "Anxiety disorders",
    "Asthma",
    "Bipolar disorder",
    "Bladder cancer",
    "Bone cancer",
    "Brain cancer",
    "Breast cancer",
    "Cardiovascular disease",
    "Celiac disease",
    "Cervical cancer",
    "Chronic fatigue syndrome",
    "Chronic obstructive pulmonary disease (COPD)",
    "Chronic pain",
    "Crohn's disease",
    "Depression",
    "Diabetes",
    "Dementia",
    "Endometriosis",
    "Epilepsy",
    "Esophageal cancer",
    "Eczema",
    "Gallbladder cancer",
    "Glaucoma",
    "Gout",
    "Head and neck cancer",
    "Hepatitis B",
    "Hepatitis C",
    "Hemophilia",
    "HIV/AIDS",
    "Hodgkin's lymphoma",
    "Hyperthyroidism",
    "Hypertension",
    "Hypothyroidism",
    "Irritable bowel syndrome (IBS)",
    "Kidney disease",
    "Leukemia",
    "Liver cancer",
    "Liver disease",
    "Lung cancer",
    "Lupus",
    "Macular degeneration",
    "Melanoma (Skin cancer)",
    "Mesothelioma",
    "Migraine",
    "Multiple myeloma",
    "Multiple sclerosis",
    "Neuroblastoma",
    "Non-Hodgkin's lymphoma",
    "Obesity",
    "Osteoarthritis",
    "Osteoporosis",
    "Ovarian cancer",
    "Pancreatic cancer",
    "Parkinson's disease",
    "Peptic ulcer disease",
    "Polycystic ovary syndrome (PCOS)",
    "Prostate cancer",
    "Psoriasis",
    "Retinoblastoma",
    "Rheumatoid arthritis",
    "Sarcoma",
    "Schizophrenia",
    "Sickle cell disease",
    "Sleep apnea",
    "Stomach cancer",
    "Stroke",
    "Testicular cancer",
    "Thyroid cancer",
    "Thyroid disease",
    "Tuberculosis",
    "Ulcerative colitis"
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

  const handleAddPatient = async () => {
    if (!patientID.trim() || !patientName.trim() || !dob.trim() || !age.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const newPatientRef = ref(database, `patients/${patientID}`);

    try {
      await set(newPatientRef, {
        patientID: patientID,
        name: patientName,
        DOB: dob,
        age: age,
        conditions: selectedConditions, // Save selected conditions as an array
        prescriptions: ['dummy'] // Initialize prescriptions as an empty array
      });
      alert(`Patient ${patientName} has been added successfully!`);
      setPatientID('');
      setPatientName('');
      setDOB('');
      setAge('');
      setSelectedConditions([]);  // Clear selected conditions

      // Redirect back to the main page
      navigate('/main'); 
    } catch (error) {
      console.error('Error adding patient:', error);
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

        {/* Patient ID Input */}
        <div className="mb-4 w-80">
          <label className="text-sm text-green-800 block mb-2">Patient ID</label>
          <input
            type="text"
            value={patientID}
            onChange={(e) => setPatientID(e.target.value)}
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
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
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
