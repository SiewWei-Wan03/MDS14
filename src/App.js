import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FaCirclePlus } from "react-icons/fa6";
import './App.css';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PatientInfoPage from './pages/PatientInfoPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ReassessingPage from './pages/ReassessingPage';
import SelectPrescriptionPage from './pages/SelectPrescriptionPage';
import { database } from './firebase';
import { ref, get } from "firebase/database";
import useAutoLogout from './services/useAutoLogout'; 
import AddPatientPage from './pages/AddPatientPage';

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
        <Route path="/add-patient" element={<AddPatientPage />} />
        <Route path="/main" element={<MainLayout />} /> {/* MainLayout route */}
      </Routes>
    </Router>
  );
}

const MainLayout = () => {
  const [patientID, setPatientID] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('')

  // Use the custom hook to handle auto logout and get the countdown timer
  const countdown = useAutoLogout(); 

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
        setError("Patient does not exist, please check the Patient ID again.");
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
        <img src="/doctor_img.png" alt="Profile picture" className="w-12 h-12" /> 
      </div>
        <nav className="nav-icons flex flex-col gap-8 text-green-200">
          <Link to="/main">
            <FaUser className="text-2xl" title="Main Page"/>
          </Link>
          <Link to="/login">
            <FaSignOutAlt className="text-2xl" title='Log Out'/>
          </Link>
        </nav>
      </div>
      {/* Main Content */}
      <div className="main-content flex-1 flex flex-col items-center justify-center bg-[#F4F8EF] relative">
        <div className="text-center">
          <h1 className="heading text-2xl text-green-900 font-semibold mb-4">Please enter the patient ID:</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
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

        {/* Add New Patient Button */}
        <div className="mt-12 text-center">
          <button className="button bg-green-900 text-white px-6 py-2 rounded flex items-center gap-2" onClick={() => navigate('/add-patient')}>
          <FaCirclePlus />ADD PATIENT
          </button>
        </div>

        {/* Countdown Timer Display */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-green-900">
          <p>Time until logout: {countdown} seconds</p>
        </div>
      </div>
    </div>
  );
};

export default App;
