import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { ref, update } from 'firebase/database';
import { database } from '../firebase'; 
import '../App.css';
import useAutoLogout from '../services/useAutoLogout';
import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

const SelectPrescriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patientData || {};
  const [selectedDrug, setSelectedDrug] = useState('');
  const [selectedPreviousDrug, setSelectedPreviousDrug] = useState(''); // New state for previous drugs
  const [error, setError] = useState('');
  const [model, setModel] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [csvData, setCsvData] = useState([]);


  const countdown = useAutoLogout();

  const drugsList = [
    "ACETYLCARNITINE",
    "ACETYLCYSTEINE",
    "ALIMEMAZINE",
    "ALLANTOIN",
    "ALMASILATE",
    "ALUMINUM HYDROXIDE",
    "AMISULPRIDE",
    "AMPICILLIN",
    "ARMODAFINIL",
    "ARTEMOTIL",
    "ATOGEPANT",
    "ATORVASTATIN",
    "AVOBENZONE",
    "BENDAMUSTINE",
    "BETHANIDINE",
    "BIOTIN",
    "BISPHENOL A DIGLYCIDYL ETHER",
    "BINIMETINIB",
    "BOSENTAN",
    "BREXANOLONE",
    "BRILLIANT BLUE G",
    "BROMAZEPAM",
    "BUTABARBITAL",
    "CABAZITAXEL",
    "CALCIUM LACTATE",
    "CARBAMAZEPINE",
    "CARBAMIDE PEROXIDE",
    "CARPROFEN",
    "CEFAZOLIN",
    "CEFMETAZOLE",
    "CEFTAZIDIME",
    "CEFPODOXIME",
    "CHLORMERODRIN",
    "CHLOROXYLENOL",
    "CHLORPHENESIN CARBAMATE",
    "CHROMIUM CR-51",
    "CHROMIUM PICOLINATE",
    "CIPROFIBRATE",
    "CLASCOTERONE",
    "CLAVULANIC ACID",
    "CLIDINIUM",
    "CISATRACURIUM",
    "COCARBOXYLASE",
    "CYCLOPHOSPHAMIDE",
    "CYPROTERONE ACETATE",
    "DAPSONE",
    "DAPTOMYCIN",
    "DEXBROMPHENIRAMINE",
    "DEXPANTHENOL",
    "DIAZOXIDE",
    "DIETHYLTOLUAMIDE",
    "DIMAZOLE",
    "DIMERCAPROL",
    "DIMETOTIAZINE",
    "DIMENHYDRINATE",
    "DIIODOHYDROXYQUINOLINE",
    "DL-ALPHA-TOCOPHEROL",
    "DOMIPHEN",
    "DOSULEPIN",
    "DOPAMINE",
    "DROXIDOPA",
    "ENOXACIN",
    "EMPAGLIFLOZIN",
    "EPICRIPTINE",
    "ERIBULIN",
    "ESTRADIOL BENZOATE",
    "ETHCHLORVYNOL",
    "ETHYNODIOL DIACETATE",
    "FELBAMATE",
    "FELODIPINE",
    "FESOTERODINE",
    "FIDAXOMICIN",
    "FLUORIDE ION F-18",
    "FLUTAMIDE",
    "FLUTICASONE",
    "FLOCTAFENINE",
    "FORMALDEHYDE",
    "FOSDENOPTERIN",
    "FOSTAMATINIB",
    "GANAXOLONE",
    "GADOTERIC ACID",
    "GADOTERIDOL",
    "GADOPICLENOL",
    "GRANISETRON",
    "GUANIDINE",
    "HALOFANTRINE",
    "HOMATROPINE",
    "IBANDRONATE",
    "IOBENGUANE",
    "IOBITRIDOL",
    "IOXILAN",
    "IMIDUREA",
    "IVERMECTIN",
    "ISOPROPYL MYRISTATE",
    "KAVA",
    "LINAGLIPTIN",
    "LIGHT GREEN SF YELLOWISH",
    "LIFITEGRAST",
    "LURASIDONE",
    "LUMEFANTRINE",
    "LUSUTROMBOPAG",
    "MAZINDOL",
    "MAFENIDE",
    "MELOXICAM",
    "MERADIMATE",
    "METHOCARBAMOL",
    "METFORMIN",
    "METARAMINOL",
    "METAXALONE",
    "METHYL AMINOLEVULINATE",
    "MIZOLASTINE",
    "MINOCYCLINE",
    "MORPHINE",
    "MYCOPHENOLIC ACID",
    "NABILONE",
    "NALOXONE",
    "NAFARELIN",
    "NELARABINE",
    "NIACIN",
    "NORGESTIMATE",
    "NORFLURANE",
    "OUABAIN",
    "OMIDENEPAG ISOPROPYL",
    "OLMESARTAN",
    "OTESECONAZOLE",
    "OXYMETAZOLINE",
    "OXITRIPTAN",
    "PALONOSETRON",
    "PADIMATE O",
    "PANCURONIUM",
    "PARTHENOLIDE",
    "PEXIDARTINIB",
    "PHENINDAMINE",
    "PIMECROLIMUS",
    "PINDOLOL",
    "PILOCARPINE",
    "PIRENZEPINE",
    "PIRBUTEROL",
    "POTASSIUM CATION",
    "PRAMIPEXOLE",
    "PRILOCAINE",
    "PRIMAQUINE",
    "PROPYL ALCOHOL",
    "PREDNISOLONE PHOSPHATE",
    "PRAZIQUANTEL",
    "PSEUDOEPHEDRINE",
    "REPOTRECTINIB",
    "RIFAXIMIN",
    "RIMEXOLONE",
    "RITODRINE",
    "RAMELTEON",
    "SELENIUM SULFIDE",
    "SEMAGLUTIDE",
    "SETMELANOTIDE",
    "SITAGLIPTIN",
    "SODIUM LAURYL SULFOACETATE",
    "SUCCINYLCHOLINE",
    "TADALAFIL",
    "TIBOLONE",
    "TECHNETIUM TC-99M PYROPHOSPHATE",
    "TENOFOVIR DISOPROXIL",
    "TEMAZEPAM",
    "TESTOSTERONE UNDECANOATE",
    "THIOTEPA",
    "TIROFIBAN",
    "TOLCAPONE",
    "TRIMIPRAMINE",
    "TROLEANDOMYCIN",
    "TYROPANOIC ACID",
    "VADADUSTAT",
    "VALACICLOVIR",
    "VALINE",
    "VINFLUNINE",
    "VOCLOSPORIN",
    "XYLOSE",
    "ZINC SULFATE",
    "ZOTEPINE",
    "ZUCAPSAICIN"
];


  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      const loadedModel = await tf.loadGraphModel('/model.json');
      setModel(loadedModel);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsModelLoading(false);
    }
  };

  const loadCsvData = async () => {
    try {
      Papa.parse('/final_SMILES_processed.csv', {
        header: true,
        download: true,
        complete: (results) => {
          setCsvData(results.data);
          console.log('CSV data loaded successfully');
        },
        error: (error) => {
          console.error("Error loading CSV:", error);
        },
      });
    } catch (error) {
      console.error('Error in loadCsvData:', error);
    }
  };

  useEffect(() => {
    loadModel();
    loadCsvData(); // Load the CSV data as well
  }, []);

  const handleDrugChange = (event) => {
    setSelectedDrug(event.target.value);
  };

  const handlePreviousDrugChange = (event) => {
    setSelectedPreviousDrug(event.target.value);
  };

  const handleCancel = () => {
    navigate('/patient-info', { state: { patientData } });
  };

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
  
      const matchedData = csvData.find(
        (entry) => entry.DrugA === selectedDrugA && entry.DrugB === selectedDrugB
      );
  
      if (!matchedData) {
        console.log("No matching drugs found in the dataset.");
        setError("No matching drugs found in the dataset. Please check your selections.");
        return;
      }
  
      // Extract Tanimoto and other features for the input tensor
      const {
        tanimoto,
        feature_jsim,
        feature_dsim,
        feature_osim,
      } = matchedData;
  
      // Prepare input for the model
      const inputData = [parseFloat(tanimoto), parseFloat(feature_jsim), parseFloat(feature_dsim), parseFloat(feature_osim)];
      const inputTensor = tf.tensor(inputData, [1, inputData.length]); // Adjust shape as needed
  
      // Make predictions with the loaded model
      const prediction = model.predict(inputTensor);
      const predictedValue = await prediction.array(); // Extract the prediction result
      setPredictionResult(predictedValue); // Store the result to display
      
    // DDI mapping
    const ddi_mapping = {
      'No interaction found, can be prescribed safely.': 0,
      'Minor interaction found, be careful with the dosage when prescribe': 1,
      'Moderate interaction found, better to choose another prescription.': 2,
      'Major interaction found, should not be prescribed.': 3
    };

    // Find the maximum prediction value and its index
    const maxPredictionValue = Math.max(...predictedValue[0]);
    let maxIndex = predictedValue[0].indexOf(maxPredictionValue);

    if ((predictedValue[0][3]) > 0.1) {
      maxIndex = 3
    } else if ((predictedValue[0][2] > 0.15)) {
      maxIndex = 2
    } else if ((predictedValue[0][1]) > 0.17) {
      maxIndex = 1
    }
      
    // Reverse the ddi_mapping to get categories by index
    const reverseDdiMapping = Object.fromEntries(
      Object.entries(ddi_mapping).map(([key, value]) => [value, key])
    );

    // Get the corresponding DDI category
    const ddiCategory = reverseDdiMapping[maxIndex];
  
      // Save selected prescription to Firebase
      const patientRef = ref(database, `patients/${patientData.ID}`);
      const updatedPrescription = selectedDrug;
  
      await update(patientRef, { selected_prescription: updatedPrescription });

      navigate('/recommendations', { state: { patientData, ddiCategory, selectedDrug, selectedPreviousDrug, matchedData } });
    
    } catch (error) {
      console.error('Error saving prescription:', error);
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
            <FaUser className="text-2xl" />
          </Link>
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
