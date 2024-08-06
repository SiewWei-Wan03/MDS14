import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { ref, set, get, child, update } from 'firebase/database';
import { database } from '../firebase'; 
import '../App.css';

const AddConditionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData || {};
  const [conditions, setConditions] = useState({
    cardiovascularDisease: false,
    kidneyFailure: false,
    diabetes: false,
    asthma: false,
    other: '',
  });
  const [disabledConditions, setDisabledConditions] = useState({
    cardiovascularDisease: false,
    kidneyFailure: false,
    diabetes: false,
    asthma: false,
  });
  const [otherConditions, setOtherConditions] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (patientData.conditions) {
      const patientConditions = patientData.conditions || [];
      const additionalConditions = [];
      const updatedConditions = {
        cardiovascularDisease: false,
        kidneyFailure: false,
        diabetes: false,
        asthma: false,
        other: '',
      };
      const updatedDisabledConditions = {
        cardiovascularDisease: false,
        kidneyFailure: false,
        diabetes: false,
        asthma: false,
      };

      patientConditions.forEach((condition) => {
        switch (condition) {
          case 'Cardiovascular disease':
            updatedConditions.cardiovascularDisease = true;
            updatedDisabledConditions.cardiovascularDisease = true;
            break;
          case 'Kidney failure':
            updatedConditions.kidneyFailure = true;
            updatedDisabledConditions.kidneyFailure = true;
            break;
          case 'Diabetes':
            updatedConditions.diabetes = true;
            updatedDisabledConditions.diabetes = true;
            break;
          case 'Asthma':
            updatedConditions.asthma = true;
            updatedDisabledConditions.asthma = true;
            break;
          default:
            additionalConditions.push(condition);
        }
      });

      setConditions(updatedConditions);
      setDisabledConditions(updatedDisabledConditions);
      setOtherConditions(
        additionalConditions.filter((c) => c !== 'Breast cancer').join(', ')
      );
    }
  }, [patientData]);

  const handleCheckboxChange = (condition) => {
    if (!disabledConditions[condition]) {
      setConditions({ ...conditions, [condition]: !conditions[condition] });
    }
  };

  const handleInputChange = (e) => {
    setConditions({ ...conditions, other: e.target.value });
  };

  const handleCancel = () => {
    navigate('/patient-info');
  };

  const handleOk = async () => {
    const { cardiovascularDisease, kidneyFailure, diabetes, asthma, other } = conditions;
  
    // Check if no condition is selected and return early with an error message.
    if (!cardiovascularDisease && !kidneyFailure && !diabetes && !asthma && !other) {
      setError('Please select at least one condition or enter a value in the "Other" box.');
      return;
    }
  
    try {
      const patientRef = ref(database, `patients/${patientData.ID}`);
      const existingConditionsSnapshot = await get(child(patientRef, 'conditions'));
      const existingConditions = existingConditionsSnapshot.val() || [];
  
      const newConditions = [
        ...(cardiovascularDisease && !existingConditions.includes('Cardiovascular disease')
          ? ['Cardiovascular disease']
          : []),
        ...(kidneyFailure && !existingConditions.includes('Kidney failure')
          ? ['Kidney failure']
          : []),
        ...(diabetes && !existingConditions.includes('Diabetes') ? ['Diabetes'] : []),
        ...(asthma && !existingConditions.includes('Asthma') ? ['Asthma'] : []),
        ...(other && other.trim() !== "" && !existingConditions.includes(other.trim())
          ? [other.trim()]
          : []),
      ];
  
      console.log(newConditions);
  
      const updatedConditions = [...existingConditions, ...newConditions].filter(
        (condition) => condition !== undefined && condition !== null
      );
  
      console.log(updatedConditions);
  
      await update(patientRef, { conditions: updatedConditions });
  
      navigate('/recommendations');
    } catch (error) {
      console.error('Error saving conditions:', error);
      setError('Failed to save conditions. Please try again.');
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
            Additional Medical Conditions
          </h1>
          <p className="text-xl text-green-900 mb-4">
            Please select any additional conditions the patient has, by ticking the appropriate
            checkbox(es):
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex flex-col">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.cardiovascularDisease}
                onChange={() => handleCheckboxChange('cardiovascularDisease')}
                disabled={disabledConditions.cardiovascularDisease}
              />
              <span
                className={
                  disabledConditions.cardiovascularDisease
                    ? 'text-green-900 line-through'
                    : 'text-green-900'
                }
              >
                Cardiovascular Disease
              </span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.kidneyFailure}
                onChange={() => handleCheckboxChange('kidneyFailure')}
                disabled={disabledConditions.kidneyFailure}
              />
              <span
                className={
                  disabledConditions.kidneyFailure
                    ? 'text-green-900 line-through'
                    : 'text-green-900'
                }
              >
                Kidney Failure
              </span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.diabetes}
                onChange={() => handleCheckboxChange('diabetes')}
                disabled={disabledConditions.diabetes}
              />
              <span
                className={
                  disabledConditions.diabetes
                    ? 'text-green-900 line-through'
                    : 'text-green-900'
                }
              >
                Diabetes
              </span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={conditions.asthma}
                onChange={() => handleCheckboxChange('asthma')}
                disabled={disabledConditions.asthma}
              />
              <span
                className={
                  disabledConditions.asthma ? 'text-green-900 line-through' : 'text-green-900'
                }
              >
                Asthma
              </span>
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
          {otherConditions && (
            <p className="text-sm text-green-900 mt-4">Other conditions: {otherConditions}</p>
          )}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleCancel}
              className="mr-4 px-6 py-2 border rounded text-green-900"
            >
              Cancel
            </button>
            <button onClick={handleOk} className="px-6 py-2 bg-green-900 text-white rounded">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddConditionsPage;
