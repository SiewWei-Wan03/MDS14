import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import '../App.css';

const AddConditionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData || {};
  const [conditions, setConditions] = useState({
    heartDisease: false,
    kidneyFailure: false,
    diabetes: false,
    allergy: false,
    asthma: false,
    other: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientData.conditions) {
      const patientConditions = patientData.conditions || {};
      setConditions({
        heartDisease: patientConditions.heartDisease || false,
        kidneyFailure: patientConditions.kidneyFailure || false,
        diabetes: patientConditions.diabetes || false,
        allergy: patientConditions.allergy || false,
        asthma: patientConditions.asthma || false,
        other: patientConditions.other || ''
      });
    }
  }, [patientData]);

  const handleCheckboxChange = (condition) => {
    setConditions({ ...conditions, [condition]: !conditions[condition] });
  };

  const handleInputChange = (e) => {
    setConditions({ ...conditions, other: e.target.value });
  };

  const handleCancel = () => {
    navigate('/patient-info');
  };

  const handleOk = () => {
    const { heartDisease, kidneyFailure, diabetes, allergy, asthma, other } = conditions;
    if (!heartDisease && !kidneyFailure && !diabetes && !allergy && !asthma && !other) {
      setError('Please select at least one condition or enter a value in the "Other" box.');
    } else {
      navigate('/recommendations');
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
          <h1 className="text-3xl text-green-900 font-semibold mb-6">Additional Medical Conditions</h1>
          <p className="text-xl text-green-900 mb-4">
            Please select any additional conditions the patient has, by ticking the appropriate checkbox(es):
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex flex-col">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.heartDisease}
                onChange={() => handleCheckboxChange('heartDisease')}
                disabled
              />
              <span className="text-green-900 line-through">Heart Disease</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.kidneyFailure}
                onChange={() => handleCheckboxChange('kidneyFailure')}
              />
              <span className="text-green-900">Kidney Failure</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.diabetes}
                onChange={() => handleCheckboxChange('diabetes')}
              />
              <span className="text-green-900">Diabetes</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.allergy}
                onChange={() => handleCheckboxChange('allergy')}
                disabled
              />
              <span className="text-green-900 line-through">Allergy</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.asthma}
                onChange={() => handleCheckboxChange('asthma')}
              />
              <span className="text-green-900">Asthma</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={!!conditions.other}
                onChange={() => handleCheckboxChange('other')}
              />
              <span className="text-green-900">Other:</span>
              <input
                type="text"
                className="ml-2 border rounded px-2 py-1"
                value={conditions.other}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleCancel} className="mr-4 px-6 py-2 border rounded text-green-900">Cancel</button>
            <button onClick={handleOk} className="px-6 py-2 bg-green-900 text-white rounded">OK</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddConditionsPage;
