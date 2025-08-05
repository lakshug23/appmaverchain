import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import MagicLoader from '../components/MagicLoader';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import BackButton from '../components/BackButton';

const HealthRecords = () => {
  const { account } = useWallet();
  const { user, hasRole } = useAuth();
  const { getHealthRecords, addHealthRecord } = useContract();
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('access'); // 'access', 'records', 'manage'
  
  // Emergency Access System State
  const [dummyNumber, setDummyNumber] = useState('');
  const [adminNumber, setAdminNumber] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [accessLog, setAccessLog] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [accessMethod, setAccessMethod] = useState('dummy'); // 'dummy' or 'aadhar'

  // Function to get next available dummy number (random selection)
  const getNextDummyNumber = () => {
    const availableNumbers = dummyNumberPool.filter(num => !usedNumbers.has(num));
    if (availableNumbers.length > 0) {
      // Random selection from available numbers
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      return availableNumbers[randomIndex];
    }
    // Reset if all numbers used and pick random
    setUsedNumbers(new Set());
    const randomIndex = Math.floor(Math.random() * dummyNumberPool.length);
    return dummyNumberPool[randomIndex];
  };

  // Function to rotate dummy number after use (random)
  const rotateDummyNumber = (usedNumber) => {
    setUsedNumbers(prev => new Set([...prev, usedNumber]));
    setTimeout(() => {
      const nextNumber = getNextDummyNumber();
      setActiveDummyNumber(nextNumber);
    }, 2000); // 2 second delay before showing new random number
  };

  // Mock data for demo
  const validDummyNumbers = new Set(['DUMMY-123456', 'DUMMY-789012', 'DUMMY-345678']);
  const usedDummyNumbers = new Set(['DUMMY-999888', 'DUMMY-555666', 'DUMMY-777444']);
  const validAdminNumbers = new Set(['ADMIN-7890', 'ADMIN-1234', 'ADMIN-5678']);

  // Demo system with single active numbers
  const [activeDummyNumber, setActiveDummyNumber] = useState('DUMMY-123456');
  const [activeAdminNumber, setActiveAdminNumber] = useState('ADMIN-7890');
  const [usedNumbers, setUsedNumbers] = useState(new Set());
  
  // Available dummy numbers pool
  const dummyNumberPool = [
    'DUMMY-123456', 'DUMMY-789012', 'DUMMY-999888', 'DUMMY-456789', 
    'DUMMY-321654', 'DUMMY-987321', 'DUMMY-147258', 'DUMMY-369852'
  ];

  // Sample health passport data with more detailed patient information
  const sampleHealthData = {
    'DUMMY-123456': {
      patientId: 'P-001',
      name: 'Dr. Sarah Mitchell',
      age: 34,
      gender: 'Female',
      bloodType: 'A+', 
      allergies: ['Penicillin', 'Shellfish', 'Latex'],
      conditions: ['Type 1 Diabetes', 'Mild Asthma'],
      medications: ['Insulin Glargine 24 units', 'Metformin 500mg BID', 'Albuterol PRN'],
      emergencyContact: 'Dr. James Mitchell (Husband) +1-555-0123',
      lastUpdated: '2025-01-15',
      medicalHistory: ['Appendectomy 2019', 'Pregnancy 2022', 'COVID-19 2023'],
      insurance: 'BlueCross BlueShield - Policy #BC789456',
      primaryPhysician: 'Dr. Robert Chen - Endocrinology',
      criticalNotes: 'Insulin-dependent. Check blood glucose regularly.'
    },
    'DUMMY-789012': {
      patientId: 'P-002',
      name: 'Marcus Johnson',
      age: 67,
      gender: 'Male',
      bloodType: 'O-',
      allergies: ['Aspirin', 'Iodine'],
      conditions: ['Hypertension', 'Atrial Fibrillation', 'Stage 3 CKD'],
      medications: ['Warfarin 5mg daily', 'Lisinopril 20mg', 'Metoprolol 50mg BID'],
      emergencyContact: 'Lisa Johnson (Daughter) +1-555-0456',
      lastUpdated: '2025-01-10',
      medicalHistory: ['Heart Attack 2020', 'Kidney Stones 2018', 'Cataract Surgery 2021'],
      insurance: 'Medicare + Aetna Supplement',
      primaryPhysician: 'Dr. Elena Rodriguez - Cardiology',
      criticalNotes: 'On blood thinners. Risk of bleeding. INR monitoring required.'
    },
    'DUMMY-999888': {
      patientId: 'P-003',
      name: 'Isabella Garcia',
      age: 8,
      gender: 'Female',
      bloodType: 'B+',
      allergies: ['Tree Nuts', 'Dairy'],
      conditions: ['Severe Food Allergies', 'Asthma'],
      medications: ['EpiPen (Epinephrine)', 'Albuterol Inhaler', 'Prednisolone PRN'],
      emergencyContact: 'Maria Garcia (Mother) +1-555-0789',
      lastUpdated: '2025-01-08',
      medicalHistory: ['Anaphylaxis Episode 2024', 'Pneumonia 2023'],
      insurance: 'Cigna Family Plan',
      primaryPhysician: 'Dr. Amanda Foster - Pediatric Allergy',
      criticalNotes: 'SEVERE ALLERGIES - EpiPen required at all times. Call 911 immediately for reactions.'
    },
    'DUMMY-456789': {
      patientId: 'P-004',
      name: 'Robert Chen',
      age: 45,
      gender: 'Male',
      bloodType: 'AB+',
      allergies: ['Codeine', 'Morphine'],
      conditions: ['Chronic Back Pain', 'Depression'],
      medications: ['Tramadol 50mg TID', 'Sertraline 100mg', 'Ibuprofen PRN'],
      emergencyContact: 'Anna Chen (Wife) +1-555-0234',
      lastUpdated: '2025-01-12',
      medicalHistory: ['Herniated Disc L4-L5', 'Anxiety Disorder 2019'],
      insurance: 'UnitedHealth PPO',
      primaryPhysician: 'Dr. Michael Torres - Pain Management',
      criticalNotes: 'Opioid allergy. Use non-opioid pain management only.'
    }
  };

  // Aadhar to Health Data mapping
  const aadharHealthData = {
    '234567891234': sampleHealthData['DUMMY-123456'], // Dr. Sarah Mitchell
    '345678912345': sampleHealthData['DUMMY-789012'], // Marcus Johnson  
    '456789123456': sampleHealthData['DUMMY-999888'], // Isabella Garcia
    '567891234567': sampleHealthData['DUMMY-456789'], // Robert Chen
  };

  // Valid Aadhar numbers for demo
  const validAadharNumbers = new Set(['234567891234', '345678912345', '456789123456', '567891234567']);
  const usedAadharNumbers = new Set(['123456789012', '987654321098', '111222333444']);

  // Extract patient data from sampleHealthData for management view
  const mockPatientData = Object.values(sampleHealthData);

  const [newRecord, setNewRecord] = useState({
    patientId: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  useEffect(() => {
    if (account) {
      loadHealthRecords();
    }
  }, [account]);

  const loadHealthRecords = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const records = await getHealthRecords(account);
      setHealthRecords(records);
    } catch (error) {
      console.error('❌ Error loading health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.patientId || !newRecord.diagnosis) return;

    try {
      setLoading(true);
      await addHealthRecord(
        newRecord.patientId,
        newRecord.diagnosis,
        newRecord.prescription,
        newRecord.notes
      );
      setNewRecord({ patientId: '', diagnosis: '', prescription: '', notes: '' });
      await loadHealthRecords();
      alert('Health record added successfully!');
    } catch (error) {
      console.error('❌ Error adding health record:', error);
      alert('Error adding health record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Emergency Access System Functions
  const handleAccessAttempt = () => {
    setErrorMessage('');
    setAccessGranted(false);
    setEmergencyMode(false);

    if (!dummyNumber.trim()) {
      setErrorMessage(`Please enter a ${accessMethod === 'dummy' ? 'dummy number' : 'Aadhar number'}`);
      return;
    }

    if (accessMethod === 'dummy') {
      // Dummy number access logic
      if (dummyNumber === activeDummyNumber && !usedNumbers.has(dummyNumber)) {
        setAccessGranted(true);
        setEmergencyMode(false);
        logAccess('Normal', dummyNumber);
        
        // Rotate to next random dummy number after successful use
        rotateDummyNumber(dummyNumber);
        return;
      }

      // Check if dummy number is used/invalid or doesn't match active number
      if (usedNumbers.has(dummyNumber) || dummyNumber !== activeDummyNumber || dummyNumber.startsWith('DUMMY-')) {
        if (!adminNumber.trim()) {
          setErrorMessage(`This dummy number is no longer valid or incorrect. Current valid number is: ${activeDummyNumber}. Please enter an authorized personnel number for emergency access.`);
          return;
        }

        // Check admin number for emergency access
        if (adminNumber === activeAdminNumber) {
          setAccessGranted(true);
          setEmergencyMode(true);
          logAccess('Emergency', dummyNumber, adminNumber);
          return;
        } else {
          setErrorMessage(`Invalid authorized personnel number. Current valid admin number is: ${activeAdminNumber}`);
          return;
        }
      }
    } else {
      // Aadhar number access logic
      if (validAadharNumbers.has(dummyNumber)) {
        setAccessGranted(true);
        setEmergencyMode(false);
        logAccess('Normal', dummyNumber);
        return;
      }

      // Check if Aadhar number is used/invalid
      if (usedAadharNumbers.has(dummyNumber) || /^\d{12}$/.test(dummyNumber)) {
        if (!adminNumber.trim()) {
          setErrorMessage('This Aadhar number is not registered or access denied. Please enter an authorized personnel number for emergency access.');
          return;
        }

        // Check admin number for emergency access
        if (adminNumber === activeAdminNumber) {
          setAccessGranted(true);
          setEmergencyMode(true);
          logAccess('Emergency', dummyNumber, adminNumber);
          return;
        } else {
          setErrorMessage(`Invalid authorized personnel number. Current valid admin number is: ${activeAdminNumber}`);
          return;
        }
      }
    }

    setErrorMessage(`Invalid ${accessMethod === 'dummy' ? 'dummy number format. Please use format: DUMMY-XXXXXX' : 'Aadhar number format. Please use 12-digit Aadhar number'}`);
  };

  const logAccess = (type, dummy, admin = null) => {
    const logEntry = {
      type,
      dummyNumber: dummy,
      adminNumber: admin,
      timestamp: new Date().toLocaleString(),
      patientData: sampleHealthData[dummy] || null
    };
    setAccessLog(prev => [logEntry, ...prev]);
  };

  const resetAccess = () => {
    setAccessGranted(false);
    setEmergencyMode(false);
    setDummyNumber('');
    setAdminNumber('');
    setErrorMessage('');
  };

  const getCurrentPatientData = () => {
    if (accessMethod === 'dummy') {
      return sampleHealthData[dummyNumber] || null;
    } else {
      return aadharHealthData[dummyNumber] || null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Custom Styles for blinking effect */}
      <style>{`
        @keyframes emergency-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        .emergency-blink {
          animation: emergency-blink 1.5s infinite;
        }
        @keyframes number-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
        }
        .number-glow {
          animation: number-glow 2s infinite;
        }
      `}</style>
      
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        >
          <source src="/assets/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl mb-8 border border-white/20">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">🏥 Emergency Health Passport</h1>
                  <p className="text-lg text-white/80 mb-4">
                    Secure access to critical health information during emergencies
                  </p>
                  {account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <BackButton />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">Health Passport</div>
                    <div className="text-white/70">Emergency Access</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('access')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentView === 'access'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  🚨 Emergency Access
                </button>
                {(hasRole('hospital') || hasRole('admin')) && (
                  <button
                    onClick={() => setCurrentView('manage')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      currentView === 'manage'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    📋 Manage Records
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Access View */}
          {currentView === 'access' && (
            <div className="space-y-8">
              {!accessGranted ? (
                <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem">
                  {/* Demo Instructions */}
                  <GlowingCard glowColor="#3b82f6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        ℹ️
                      </div>
                      Live Demo Instructions - Choose Access Method
                    </h2>
                    
                    {/* Access Method Toggle */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-1 border border-white/20">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setAccessMethod('dummy');
                              setDummyNumber('');
                              setErrorMessage('');
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                              accessMethod === 'dummy'
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            🆔 Dummy Number
                          </button>
                          <button
                            onClick={() => {
                              setAccessMethod('aadhar');
                              setDummyNumber('');
                              setErrorMessage('');
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                              accessMethod === 'aadhar'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            🏛️ Aadhar Number
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-white/80 text-sm">
                      {accessMethod === 'dummy' ? (
                        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
                          <p className="font-bold text-green-300 mb-3 text-center">🟢 CURRENT ACTIVE DUMMY NUMBER</p>
                          <div className="text-center">
                            <span className="bg-green-500/30 text-green-200 px-6 py-3 rounded-lg text-lg font-mono border border-green-400/50 inline-block number-glow shadow-lg">
                              {activeDummyNumber}
                            </span>
                          </div>
                          <p className="text-green-300 text-xs mt-2 text-center">
                            ✅ Use this number for instant access. Will randomly rotate after use.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
                          <p className="font-bold text-blue-300 mb-3 text-center">🏛️ VALID AADHAR NUMBERS</p>
                          <div className="space-y-2">
                            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-200 font-mono text-sm">234567891234</span>
                                <span className="text-blue-300 text-xs">→ Dr. Sarah Mitchell</span>
                              </div>
                            </div>
                            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-200 font-mono text-sm">345678912345</span>
                                <span className="text-blue-300 text-xs">→ Marcus Johnson</span>
                              </div>
                            </div>
                            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-200 font-mono text-sm">456789123456</span>
                                <span className="text-blue-300 text-xs">→ Isabella Garcia</span>
                              </div>
                            </div>
                            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-200 font-mono text-sm">567891234567</span>
                                <span className="text-blue-300 text-xs">→ Robert Chen</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-blue-300 text-xs mt-2 text-center">
                            ✅ Use any of these Aadhar numbers for direct patient access
                          </p>
                        </div>
                      )}
                      
                      <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
                        <p className="font-bold text-purple-300 mb-3 text-center">🔐 EMERGENCY ADMIN OVERRIDE</p>
                        <div className="text-center">
                          <span className="bg-purple-500/30 text-purple-200 px-6 py-3 rounded-lg text-lg font-mono border border-purple-400/50 inline-block shadow-lg">
                            {activeAdminNumber}
                          </span>
                        </div>
                        <p className="text-purple-300 text-xs mt-2 text-center">
                          🚨 Use with any invalid/used number for emergency access
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="font-semibold text-yellow-300 mb-2 text-center">📊 System Status</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-white/60">Method: </span>
                            <span className="text-blue-300 font-bold capitalize">{accessMethod}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Access Log: </span>
                            <span className="text-green-300 font-bold">{accessLog.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlowingCard>

                  {/* Access Form */}
                  <GlowingCard 
                    glowColor={errorMessage ? "#ef4444" : "#10b981"} 
                    className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
                  >
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                        🚨
                      </div>
                      Emergency Health Passport Access
                    </h2>
                    
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                      <p className="text-red-300 text-sm font-semibold">
                        ⚠️ FOR EMERGENCY USE ONLY. All access will be logged.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-white/90 mb-2">
                          {accessMethod === 'dummy' ? 'Patient Dummy Number *' : 'Patient Aadhar Number *'}
                        </label>
                        <input
                          type="text"
                          value={dummyNumber}
                          onChange={(e) => setDummyNumber(e.target.value.toUpperCase())}
                          placeholder={accessMethod === 'dummy' ? 'DUMMY-123456' : '234567891234'}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm font-mono"
                        />
                        <p className="text-white/60 text-xs mt-1">
                          {accessMethod === 'dummy' 
                            ? 'Use the blinking dummy number above or any valid DUMMY-XXXXXX format'
                            : 'Enter 12-digit Aadhar number for direct access'
                          }
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-white/90 mb-2">
                          Authorized Personnel Number (Emergency Access Only)
                        </label>
                        <input
                          type="text"
                          value={adminNumber}
                          onChange={(e) => setAdminNumber(e.target.value.toUpperCase())}
                          placeholder="ADMIN-7890"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm font-mono"
                        />
                        <p className="text-white/60 text-xs mt-1">
                          Only required if dummy number is invalid/used
                        </p>
                      </div>

                      {errorMessage && (
                        <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                          <p className="text-red-300 text-sm">{errorMessage}</p>
                        </div>
                      )}

                      <button
                        onClick={handleAccessAttempt}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        🔓 Request Emergency Access
                      </button>
                    </div>
                  </GlowingCard>
                </GlowingCards>
              ) : (
                // Access Granted - Show Health Passport
                <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem">
                  {/* Access Status */}
                  <GlowingCard 
                    glowColor={emergencyMode ? "#ef4444" : "#10b981"} 
                    className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
                  >
                    <div className="text-center">
                      <div className={`text-6xl mb-4 ${emergencyMode ? 'text-red-400' : 'text-green-400'}`}>
                        {emergencyMode ? '🚨' : '✅'}
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {emergencyMode ? 'Emergency Access Granted' : 'Access Granted'}
                      </h2>
                      <p className="text-white/80 mb-4">
                        {emergencyMode ? 'Access logged with admin authorization' : 'Normal access with valid dummy number'}
                      </p>
                      
                      {emergencyMode && (
                        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-4">
                          <p className="text-red-300 text-sm font-semibold">
                            📋 Access logged! Admin: {adminNumber} | Time: {new Date().toLocaleString()}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={resetAccess}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 font-semibold transition-all duration-300"
                      >
                        🔒 End Session
                      </button>
                    </div>
                  </GlowingCard>

                  {/* Patient Health Passport */}
                  {getCurrentPatientData() && (
                    <GlowingCard glowColor="#3b82f6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          🏥
                        </div>
                        Emergency Health Passport
                      </h2>
                      
                      {(() => {
                        const patient = getCurrentPatientData();
                        return (
                          <div className="space-y-6">
                            {/* Critical Alert Banner */}
                            {patient.criticalNotes && (
                              <div className="bg-gradient-to-r from-red-600/30 to-red-700/30 border-2 border-red-400/50 rounded-lg p-4 animate-pulse">
                                <div className="flex items-center mb-2">
                                  <span className="text-2xl mr-2">🚨</span>
                                  <h3 className="font-bold text-red-300 text-lg">CRITICAL MEDICAL ALERT</h3>
                                </div>
                                <p className="text-red-200 font-semibold">{patient.criticalNotes}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                  <span className="text-2xl mr-2">👤</span>
                                  Patient Information
                                </h3>
                                <div className="space-y-2 text-white/80 text-sm">
                                  <p><span className="font-semibold text-blue-300">Name:</span> {patient.name}</p>
                                  <p><span className="font-semibold text-blue-300">Age:</span> {patient.age} years old</p>
                                  <p><span className="font-semibold text-blue-300">Gender:</span> {patient.gender}</p>
                                  <p><span className="font-semibold text-blue-300">Patient ID:</span> {patient.patientId}</p>
                                  <p><span className="font-semibold text-blue-300">Blood Type:</span> <span className="text-red-300 font-bold text-lg">{patient.bloodType}</span></p>
                                  <p><span className="font-semibold text-blue-300">Primary Physician:</span> {patient.primaryPhysician}</p>
                                  <p><span className="font-semibold text-blue-300">Insurance:</span> {patient.insurance}</p>
                                </div>
                              </div>

                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                  <span className="text-2xl mr-2">📞</span>
                                  Emergency Contact
                                </h3>
                                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                                  <p className="text-green-200 font-semibold text-lg">{patient.emergencyContact}</p>
                                </div>
                              </div>

                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                  <span className="text-2xl mr-2">⚠️</span>
                                  Critical Allergies
                                </h3>
                                <div className="space-y-2">
                                  {patient.allergies.map((allergy, idx) => (
                                    <div key={idx} className="bg-red-500/30 text-red-200 px-3 py-2 rounded-lg border border-red-400/50 font-semibold">
                                      🚫 {allergy}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                  <span className="text-2xl mr-2">🏥</span>
                                  Medical Conditions
                                </h3>
                                <div className="space-y-1">
                                  {patient.conditions.map((condition, idx) => (
                                    <span key={idx} className="inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs mr-1 mb-1 border border-yellow-400/30">
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 md:col-span-2">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                  <span className="text-2xl mr-2">💊</span>
                                  Current Medications
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {patient.medications.map((medication, idx) => (
                                    <div key={idx} className="bg-blue-500/20 text-blue-200 px-3 py-2 rounded-lg border border-blue-400/30">
                                      {medication}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 md:col-span-2">
                                <h3 className="font-bold text-white mb-3 flex items-center">
                                  <span className="text-2xl mr-2">📋</span>
                                  Medical History
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  {patient.medicalHistory.map((history, idx) => (
                                    <div key={idx} className="bg-gray-500/20 text-gray-300 px-3 py-2 rounded-lg border border-gray-400/30 text-sm">
                                      {history}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white/60">
                                  Last Updated: {patient.lastUpdated} | Access Code: {dummyNumber}
                                </span>
                                <span className="text-green-300 font-semibold">
                                  ✅ Emergency Access Authorized
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </GlowingCard>
                  )}
                </GlowingCards>
              )}

              {/* Access Log */}
              {accessLog.length > 0 && (
                <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem">
                  <GlowingCard glowColor="#8b5cf6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        📊
                      </div>
                      Access Audit Log
                    </h2>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {accessLog.map((log, idx) => (
                        <div key={idx} className={`bg-white/10 backdrop-blur-sm rounded-lg p-3 border ${
                          log.type === 'Emergency' ? 'border-red-400/30' : 'border-green-400/30'
                        }`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              log.type === 'Emergency' 
                                ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                                : 'bg-green-500/20 text-green-300 border border-green-400/30'
                            }`}>
                              {log.type} Access
                            </span>
                            <span className="text-white/60 text-xs">{log.timestamp}</span>
                          </div>
                          <div className="text-white/80 text-sm">
                            <p>Dummy: {log.dummyNumber}</p>
                            {log.adminNumber && <p>Admin: {log.adminNumber}</p>}
                            {log.patientData && <p>Patient: {log.patientData.name}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlowingCard>
                </GlowingCards>
              )}
            </div>
          )}

          {/* Management View */}
          {currentView === 'manage' && (hasRole('hospital') || hasRole('admin')) && (
          <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem">
            <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  📋
                </div>
                Manage Health Passport Records
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {mockPatientData.length}
                    </div>
                    <div className="text-white/80 text-sm">Registered Patients</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {validDummyNumbers.size}
                    </div>
                    <div className="text-white/80 text-sm">Valid Access Codes</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-red-400 mb-2">
                      {accessLog.length}
                    </div>
                    <div className="text-white/80 text-sm">Access Attempts</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h3 className="font-bold text-white mb-4">📝 Patient Records</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mockPatientData.map((patient, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">{patient.name}</div>
                            <div className="text-white/60 text-xs">ID: {patient.patientId}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white/80 text-sm">Blood: {patient.bloodType}</div>
                            <div className="text-white/60 text-xs">Updated: {patient.lastUpdated}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                    📝 Add New Patient Record
                  </button>
                </div>
              </div>
            </GlowingCard>
          </GlowingCards>
        )}
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
