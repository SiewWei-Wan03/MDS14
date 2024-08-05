import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import '../App.css';
import Popup from './Popup'; // Import the Popup component

const RecommendationsPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleIgnore = () => {
    setShowPopup(true);
  };

  const handlePopupOk = () => {
    setShowPopup(false);
    navigate('/reassessing');
  };

  const handleAccept = () => {
    navigate('/patient-info'); // Navigate back to the patient info page
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
          <h1 className="text-3xl text-green-900 font-semibold mb-6">Recommended drugs combinations and dosages</h1>
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Drugs</th>
                <th className="text-left p-2 bg-green-900 text-white border border-green-900">Dosage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-green-900">A-443654</td>
                <td className="p-2 border border-green-900">5</td>
              </tr>
              <tr>
                <td className="p-2 border border-green-900">A-443654</td>
                <td className="p-2 border border-green-900">2</td>
              </tr>
            </tbody>
          </table>
          <div className="mb-6">
            <h2 className="text-2xl text-green-900 font-semibold mb-4">Additional lifestyle or dietary advice:</h2>
            <ul className="list-disc list-inside text-green-900">
              <li>Drink 8-10 glasses of water daily and follow a high-fiber, low-sugar diet with plenty of whole grains, vegetables, and fruits to manage blood glucose levels and detoxification.</li>
              <li>Engage in 30 minutes of moderate aerobic exercise like brisk walking most days, plus strength training twice weekly, adjusting intensity if you experience fatigue or muscle pain.</li>
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
