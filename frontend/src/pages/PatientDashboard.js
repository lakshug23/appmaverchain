import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import MagicLoader from '../components/MagicLoader';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import { RoleStatus } from '../components/RoleProtection';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import BackButton from '../components/BackButton';

const PatientDashboard = () => {
  const { account } = useWallet();
  const { user, isAuthenticated, hasRole } = useAuth();
  const { setupPatientRole, getPatientMedicationHistory, userRole } = useContract();
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientAddress, setPatientAddress] = useState('');

  // Determine if user is logged in as patient vs guest
  const isLoggedInPatient = isAuthenticated() && (hasRole('patient') || user?.role === 'patient');
  const isGuest = !isAuthenticated() || user?.role === 'guest';

  useEffect(() => {
    if (account) {
      setPatientAddress(account);
      loadPatientData(account);
    }
  }, [account]);

  const loadPatientData = async (patientAddress) => {
    if (!patientAddress) return;

    try {
      setLoading(true);
      console.log('🔍 Loading patient data for:', patientAddress);
      const history = await getPatientMedicationHistory(patientAddress);
      console.log('✅ Patient medication history loaded:', history);
      setMedicationHistory(history);
    } catch (error) {
      console.error('❌ Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPatientRole = async () => {
    if (!account) return;

    try {
      setLoading(true);
      await setupPatientRole(account);
      alert('Patient role setup completed successfully!');
    } catch (error) {
      console.error('❌ Error setting up patient role:', error);
      alert('Error setting up patient role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (patientAddress) {
      await loadPatientData(patientAddress);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {isGuest ? '🌐 Public Dashboard' : '👤 Patient Dashboard'}
                  </h1>
                  <p className="text-lg text-white/80 mb-4">
                    {isGuest 
                      ? 'Verify drugs and access public health information'
                      : 'View medication history and manage health records'
                    }
                  </p>
                  {account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                      <RoleStatus />
                    </div>
                  )}
                  {user && !account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        User: {user.name || user.email || 'Guest'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <BackButton />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {isGuest ? 'Guest' : 'Patient'}
                    </div>
                    <div className="text-white/70">
                      {isGuest ? 'Public Access' : 'Health Management'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* 🎯 GUEST USER FEATURES (Always Available) */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                🌐 Guest Features (No Login Required)
              </h2>
              
              <GlowingCards enableGlow={true} glowRadius={20} glowOpacity={0.6} gap="1.5rem">
                {/* QR Code Scanner */}
                <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      📱
                    </div>
                    QR Code Scanner
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Scan any drug QR code to verify authenticity and get batch information.
                  </p>
                  <button
                    onClick={() => window.location.href = '/qr-scanner'}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold transition-all duration-300"
                  >
                    🔍 Start Scanning
                  </button>
                </GlowingCard>

                {/* Drug Authenticity Check */}
                <GlowingCard glowColor="#3b82f6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      ✅
                    </div>
                    Drug Verification
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Verify drug authenticity, check expiry dates, and recall status.
                  </p>
                  <button
                    onClick={() => window.location.href = '/verify'}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-300"
                  >
                    🔎 Verify Drug
                  </button>
                </GlowingCard>

                {/* Report Issue */}
                <GlowingCard glowColor="#f59e0b" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      ⚠️
                    </div>
                    Report Issue
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    Report fake drugs, quality issues, or provide feedback.
                  </p>
                  <button
                    onClick={() => alert('Report functionality will be implemented')}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 font-semibold transition-all duration-300"
                  >
                    📝 Report Issue
                  </button>
                </GlowingCard>
              </GlowingCards>
            </section>

            {/* 🧑‍⚕️ PATIENT FEATURES (Login Required) */}
            {isLoggedInPatient && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  🧑‍⚕️ Patient Features (After Login)
                </h2>
                
                <GlowingCards enableGlow={true} glowRadius={20} glowOpacity={0.6} gap="1.5rem">
                  {/* Dispensed Drug History */}
                  <GlowingCard glowColor="#8b5cf6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        📋
                      </div>
                      Drug History
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      View timeline of all drugs dispensed to you with hospital records.
                    </p>
                    <div className="space-y-2 mb-4">
                      {medicationHistory.length > 0 ? (
                        <div className="text-green-300 text-sm">
                          ✅ {medicationHistory.length} records found
                        </div>
                      ) : (
                        <div className="text-white/60 text-sm">
                          No medication history available
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-semibold transition-all duration-300"
                    >
                      {loading ? 'Loading...' : '📊 View History'}
                    </button>
                  </GlowingCard>

                  {/* Health Records */}
                  <GlowingCard glowColor="#ec4899" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mr-3">
                        🏥
                      </div>
                      Health Records
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      Access encrypted health records, diagnoses, and prescriptions.
                    </p>
                    <button
                      onClick={() => window.location.href = '/health-records'}
                      className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white px-4 py-3 rounded-lg hover:from-pink-700 hover:to-pink-800 font-semibold transition-all duration-300"
                    >
                      🔒 Access Records
                    </button>
                  </GlowingCard>

                  {/* Notifications & Alerts */}
                  <GlowingCard glowColor="#ef4444" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                        🔔
                      </div>
                      Alerts & Recalls
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      Get notified about drug recalls and expiry alerts for your medications.
                    </p>
                    <div className="text-center mb-4">
                      <div className="text-2xl text-red-400">🚨</div>
                      <div className="text-white/60 text-sm">No active alerts</div>
                    </div>
                    <button
                      onClick={() => alert('Notification system will be implemented')}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-300"
                    >
                      🔔 Manage Alerts
                    </button>
                  </GlowingCard>

                  {/* Nearby Facilities */}
                  <GlowingCard glowColor="#06b6d4" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mr-3">
                        📍
                      </div>
                      Nearby Facilities
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      Find registered hospitals and pharmacies near you.
                    </p>
                    <button
                      onClick={() => alert('Facility locator will be implemented')}
                      className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-4 py-3 rounded-lg hover:from-cyan-700 hover:to-cyan-800 font-semibold transition-all duration-300"
                    >
                      🗺️ Find Facilities
                    </button>
                  </GlowingCard>

                  {/* Consent Management */}
                  <GlowingCard glowColor="#84cc16" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center mr-3">
                        🛡️
                      </div>
                      Privacy Control
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      Manage who can access your health records and view access logs.
                    </p>
                    <button
                      onClick={() => alert('Consent management will be implemented')}
                      className="w-full bg-gradient-to-r from-lime-600 to-lime-700 text-white px-4 py-3 rounded-lg hover:from-lime-700 hover:to-lime-800 font-semibold transition-all duration-300"
                    >
                      ⚙️ Manage Access
                    </button>
                  </GlowingCard>

                  {/* Account Settings */}
                  <GlowingCard glowColor="#6366f1" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        ⚙️
                      </div>
                      Account Settings
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      Edit profile, notification preferences, and account settings.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="text-white/60 text-sm">
                        Account: {user?.name || 'Patient User'}
                      </div>
                      <div className="text-white/60 text-sm">
                        Type: {user?.role || 'patient'}
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Settings page will be implemented')}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 font-semibold transition-all duration-300"
                    >
                      🔧 Settings
                    </button>
                  </GlowingCard>
                </GlowingCards>

                {/* Medication History Detail */}
                {medicationHistory.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Medication History</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {medicationHistory.slice(0, 5).map((medication, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-white">{medication.drugName}</h4>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                              Dispensed
                            </span>
                          </div>
                          <div className="text-white/80 text-sm">
                            <p>Quantity: {medication.quantity} units</p>
                            <p>Date: {new Date(medication.timestamp * 1000).toLocaleDateString()}</p>
                            <p>Hospital: {medication.hospital?.slice(0, 6)}...{medication.hospital?.slice(-4)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Guest Login Prompt */}
            {isGuest && (
              <section>
                <GlowingCard glowColor="#6366f1" className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-lg border border-indigo-400/30 shadow-2xl">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🧑‍⚕️</div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Get More Features as a Patient
                    </h3>
                    <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                      Log in to access your medication history, health records, personalized alerts, 
                      and more advanced patient features.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 font-semibold transition-all duration-300 flex items-center"
                      >
                        🔑 Login as Patient
                      </button>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold transition-all duration-300 flex items-center"
                      >
                        📝 Create Account
                      </button>
                    </div>
                  </div>
                </GlowingCard>
              </section>
            )}

            {/* Wallet Setup for Patient Role (if connected with wallet) */}
            {isLoggedInPatient && account && (
              <section>
                <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Blockchain Patient Setup
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-white/80 text-sm">
                      Set up your patient role on the blockchain to access advanced features.
                    </p>
                    
                    <button
                      onClick={handleSetupPatientRole}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                          Setting up...
                        </div>
                      ) : (
                        'Setup Patient Role'
                      )}
                    </button>
                  </div>
                </GlowingCard>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
