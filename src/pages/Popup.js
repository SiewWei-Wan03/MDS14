import React from 'react';

const Popup = ({ onOk }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl mb-4">Result</h2>
        <p className="mb-4">The patient has Benign neoplasm</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onOk}>OK</button>
      </div>
    </div>
  );
};

export default Popup;
