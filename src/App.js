import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import './App.css';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PatientInfoPage from './pages/PatientInfoPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ReassessingPage from './pages/ReassessingPage';
import SelectPrescriptionPage from './pages/SelectPrescriptionPage';
import { database } from './firebase';
import { ref, get } from "firebase/database";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Default route should be LoginPage */}
        <Route path='/register' element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/patient-info" element={<PatientInfoPage />} />
        <Route path="/select-prescriptions" element={<SelectPrescriptionPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/reassessing" element={<ReassessingPage />} />
        <Route path="/main" element={<MainLayout />} /> {/* MainLayout route */}
      </Routes>
    </Router>
  );
}

const MainLayout = () => {
  const [patientID, setPatientID] = useState('');
  const navigate = useNavigate();

  const handleSearchClick = async () => {
    if (!patientID.trim()) {
      alert("Please enter a patient ID");
      return;
    }

    const patientRef = ref(database, `patients/${patientID}`);

    try {
      const snapshot = await get(patientRef);
      if (snapshot.exists()) {
        const patientData = snapshot.val();
        navigate('/patient-info', { state: { patientData } });
      } else {
        alert("Patient does not exist");
      }
    } catch (error) {
      console.error("Error fetching patient data: ", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar w-1/6 bg-green-900 min-h-screen flex flex-col items-center py-6">
        <div className="logo mb-12">
          <img src="https://placehold.co/50x50" alt="MDS logo" />
        </div>
        <nav className="nav-icons flex flex-col gap-8 text-green-200">
          <Link to="/main">
            <FaUser className="text-2xl" />
          </Link>
          <FaEnvelope className="text-2xl" />
          <Link to="/login">
            <FaSignOutAlt className="text-2xl" />
          </Link>
        </nav>
      </div>
      {/* Main Content */}
      <div className="main-content flex-1 flex flex-col items-center justify-center bg-[#F4F8EF]">
        <div className="text-center">
          <h1 className="heading text-2xl text-green-900 font-semibold mb-4">Please enter the patient ID:</h1>
          <label className="label text-sm text-green-800 mb-2 block" htmlFor="patient-id">Patient ID (e.g. PA12345)</label>
          <input 
            id="patient-id" 
            type="text" 
            value={patientID} 
            onChange={(e) => setPatientID(e.target.value)} 
            onKeyPress={handleKeyPress}
            className="input border border-green-900 rounded px-4 py-2 mb-4" 
          />
          <button className="button bg-green-900 text-white px-6 py-2 rounded" onClick={handleSearchClick}>SEARCH</button>
        </div>
      </div>
    </div>
  );
};

export default App;
