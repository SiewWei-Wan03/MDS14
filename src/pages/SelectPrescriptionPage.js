import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { ref, update } from 'firebase/database';
import { database } from '../firebase'; 
import '../App.css';
import useAutoLogout from '../services/useAutoLogout';

const SelectPrescriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData || {};
  const [selectedDrug, setSelectedDrug] = useState('');
  const [error, setError] = useState('');

  const countdown = useAutoLogout();

  const drugsList = [
    'Acetylcarnitine',
    'Acetylcysteine',
    'Albuterol',
    'Alimemazine',
    'Allantoin',
    'Almasilate',
    'Aluminum hydroxide',
    'Amisulpride',
    'Ampicillin',
    'Armodafinil',
    'Artemotil',
    'Atogepant',
    'Atorvastatin',
    'Avobenzone',
    'Bendamustine',
    'Bethanidine',
    'Biotin',
    'Bisphenol A diglycidyl ether',
    'Binimetinib',
    'Bosentan',
    'Brexanolone',
    'Brilliant blue G',
    'Bromazepam',
    'Butabarbital',
    'Cabazitaxel',
    'Calcium lactate',
    'Carbamazepine',
    'Carbamide peroxide',
    'Carprofen',
    'Cefazolin',
    'Cefmetazole',
    'Ceftazidime',
    'Cefpodoxime',
    'Certoparin',
    'Chlormerodrin',
    'Chloroxylenol',
    'Chlorphenesin carbamate',
    'Chromium Cr-51',
    'Chromium picolinate',
    'Ciprofibrate',
    'Clascoterone',
    'Clavulanic acid',
    'Clidinium',
    'CL-315585',
    'Cisatracurium',
    'Cocarboxylase',
    'Cyclophosphamide',
    'Cyproterone acetate',
    'Dapsone',
    'Daptomycin',
    'Dexbrompheniramine',
    'Dexamethasone phosphate',
    'Dexpanthenol',
    'Dextran',
    'Diazoxide',
    'Diethyltoluamide',
    'Dimazole',
    'Dimercaprol',
    'Dimethicone 410',
    'Dimetotiazine',
    'Dimenhydrinate',
    'Diiodohydroxyquinoline',
    'Dioctyl sodium sulfosuccinate',
    'DL-alpha-Tocopherol',
    'Domiphen',
    'Dosulepin',
    'Dopamine',
    'Droxidopa',
    'Enoxacin',
    'Empagliflozin',
    'Epicriptine',
    'Eribulin',
    'Estradiol benzoate',
    'Ethchlorvynol',
    'Ethynodiol diacetate',
    'Feldspar',
    'Felbamate',
    'Felodipine',
    'Fesoterodine',
    'Fidaxomicin',
    'Fluoride ion F-18',
    'Flutamide',
    'Fluticasone',
    'Floctafenine',
    'Formaldehyde',
    'Fosdenopterin',
    'Fostamatinib',
    'Ganaxolone',
    'Gadoteric acid',
    'Gadoteridol',
    'Gadopiclenol',
    'Ganaxolone',
    'Granisetron',
    'Guanidine',
    'Halofantrine',
    'Homatropine',
    'Hydroxypropyl cellulose',
    'Ibandronate',
    'Iobenguane',
    'Iobitridol',
    'Ioxilan',
    'Imidurea',
    'Ivermectin',
    'Isopropyl myristate',
    'Kava',
    'Linagliptin',
    'Light green SF yellowish',
    'Lifitegrast',
    'Lurasidone',
    'Lumefantrine',
    'Lusutrombopag',
    'Mazindol',
    'Mafenide',
    'Meloxicam',
    'Meradimate',
    'Methocarbamol',
    'Metformin',
    'Metaraminol',
    'Metaxalone',
    'Methyl aminolevulinate',
    'Mizolastine',
    'Minocycline',
    'Morphine',
    'Mycophenolic acid',
    'Nabilone',
    'Naloxone',
    'Nafarelin',
    'Nelarabine',
    'Niacin',
    'Norgestimate',
    'Norflurane',
    'Ouabain',
    'Omidenepag isopropyl',
    'Olmesartan',
    'Oteseconazole',
    'Oxymetazoline',
    'Oxitriptan',
    'Palonosetron',
    'Padimate O',
    'Pancuronium',
    'Parthenolide',
    'Pexidartinib',
    'Phenindamine',
    'Pimecrolimus',
    'Pindolol',
    'Pilocarpine',
    'Pirenzepine',
    'Pirbuterol',
    'Povidone',
    'Potassium cation',
    'Pramipexole',
    'Prilocaine',
    'Primaquine',
    'Propyl alcohol',
    'Prednisolone phosphate',
    'Praziquantel',
    'Pseudoephedrine',
    'Repotrectinib',
    'Rifaximin',
    'Rimexolone',
    'Ritodrine',
    'Ramelteon',
    'Repotrectinib',
    'Rimexolone',
    'Selenium Sulfide',
    'Semaglutide',
    'Setmelanotide',
    'Sitagliptin',
    'Sitagliptin',
    'Sodium lauryl sulfoacetate',
    'Starch, corn',
    'Succinylcholine',
    'Tadalafil',
    'Tibolone',
    'Technetium Tc-99m pyrophosphate',
    'Tenofovir disoproxil',
    'Temazepam',
    'Testosterone undecanoate',
    'Thiotepa',
    'Tirofiban',
    'Tolcapone',
    'Trimipramine',
    'Troleandomycin',
    'Tyropanoic acid',
    'Vadadustat',
    'Valaciclovir',
    'Valine',
    'Vinflunine',
    'Voclosporin',
    'Xylose',
    'Zinc sulfate',
    'Zotepine',
    'Zucapsaicin'
  ];

  const handleDrugChange = (event) => {
    setSelectedDrug(event.target.value);
  };

  const handleCancel = () => {
    navigate('/patient-info', { state: { patientData } });
  };

  const handleSave = async () => {
    if (!selectedDrug) {
      setError('Please select a drug from the list.');
      return;
    }

    try {
      const patientRef = ref(database, `patients/${patientData.ID}`);
      const updatedPrescription = selectedDrug;

      await update(patientRef, { selected_prescription: updatedPrescription });

      navigate('/recommendations', { state: { patientData } });
      
    } catch (error) {
      console.error('Error saving prescription:', error);
      setError('Failed to save prescription. Please try again.');
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
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F8EF]">
        <div className="w-full max-w-4xl p-8">
          <h1 className="text-3xl text-green-900 font-semibold mb-6">
            Select Prescription
          </h1>
          <p className="text-xl text-green-900 mb-4">
            Please select a drug from the dropdown menu:
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex flex-col mb-4">
            <select
              value={selectedDrug}
              onChange={handleDrugChange}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select a drug</option>
              {drugsList.map((drug, index) => (
                <option key={index} value={drug}>
                  {drug}
                </option>
              ))}
            </select>
          </div>
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
