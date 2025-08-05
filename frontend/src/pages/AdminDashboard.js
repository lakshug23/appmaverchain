import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import { RoleStatus } from '../components/RoleProtection';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import MagicLoader from '../components/MagicLoader';
import WalletConnector from '../components/WalletConnector';
import { searchWHODrugs, getDrugVerificationStatus } from '../utils/who-drugs-api';

const AdminDashboard = () => {
  const { account } = useWallet();
  const { userRole, grantRole, registerHospital, addWHOApprovedDrug } = useContract();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  // Role management state
  const [roleForm, setRoleForm] = useState({
    address: '',
    role: 'MANUFACTURER'
  });

  // Hospital registration state
  const [hospitalForm, setHospitalForm] = useState({
    address: '',
    name: '',
    registrationNumber: '',
    type: '0', // 0 for Urban, 1 for Rural
    threshold: '',
    capacity: ''
  });

  // WHO drug state
  const [whoDrugName, setWhoDrugName] = useState('');
  const [drugVerification, setDrugVerification] = useState({ verified: false, message: '' });
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Live statistics state
  const [statistics, setStatistics] = useState({
    totalBatches: 0,
    activeHospitals: 0,
    totalUsers: 0,
    whoDrugs: 0
  });
  
  // Recent activity state
  const [recentActivity, setRecentActivity] = useState([]);

  // Load activity from localStorage
  useEffect(() => {
    const loadActivityLogs = () => {
      try {
        const logs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
        if (!Array.isArray(logs)) {
          setRecentActivity([]);
          return;
        }
        
        const formattedLogs = logs
          .filter(log => log && log.type) // Filter out invalid logs
          .map(log => ({
            id: log.timestamp || Date.now(),
            message: formatActivityMessage(log),
            timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time',
            color: getActivityColor(log.type)
          }));
        setRecentActivity(formattedLogs);
      } catch (error) {
        console.error('Error loading activity logs:', error);
        setRecentActivity([]);
      }
    };

    loadActivityLogs();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadActivityLogs, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to safely format addresses
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string' || address.length < 10) {
      return 'Unknown';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatActivityMessage = (log) => {
    if (!log || !log.type) {
      return '📋 Unknown Activity';
    }

    const drugName = log.drugName || 'Unknown Drug';
    const quantity = log.quantity || 0;

    switch (log.type) {
      case 'stock_accepted':
        return `📦 Stock Accepted: ${drugName} (${quantity} units) from ${log.manufacturer || 'Unknown'} by Distributor ${formatAddress(log.distributor)}`;
      case 'manufacturer_request':
        return `🏭 Manufacturer Request: ${drugName} (${quantity} units) requested by Distributor ${formatAddress(log.distributor)}`;
      case 'hospital_request_fulfilled':
        return `🏥 Hospital Request Fulfilled: ${drugName} (${quantity} units) delivered to ${log.hospital || 'Unknown'} by Distributor ${formatAddress(log.distributor)}`;
      case 'batch_created':
        return `🏭 Batch Created: ${drugName} (${quantity} units) by Manufacturer ${formatAddress(log.manufacturer)}`;
      case 'qr_scan':
        return `📱 QR Code Scanned: Batch ${log.batchId || 'Unknown'} scanned by ${formatAddress(log.scanner)}`;
      case 'request_approved':
        return `✅ Request Approved: ${drugName} (${quantity} units) approved for ${formatAddress(log.recipient)}`;
      case 'request_rejected':
        return `❌ Request Rejected: ${drugName} (${quantity} units) rejected for ${formatAddress(log.recipient)}`;
      case 'medicine_approved':
        return `💊 Medicine Approved: ${drugName} approved by ${formatAddress(log.hospital)}`;
      case 'medicine_declined':
        return `💊 Medicine Declined: ${drugName} declined by ${formatAddress(log.hospital)}`;
      default:
        return `📋 Activity: ${log.type} - ${drugName}`;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'stock_accepted':
      case 'hospital_request_fulfilled':
      case 'request_approved':
      case 'medicine_approved':
        return 'green';
      case 'manufacturer_request':
      case 'batch_created':
      case 'qr_scan':
        return 'blue';
      case 'request_rejected':
      case 'medicine_declined':
        return 'red';
      default:
        return 'yellow';
    }
  };



  // Live statistics animation
  useEffect(() => {
    const animateStatistics = () => {
      setStatistics(prev => ({
        totalBatches: Math.floor(Math.random() * 1000) + 500,
        activeHospitals: Math.floor(Math.random() * 200) + 100,
        totalUsers: Math.floor(Math.random() * 5000) + 2000,
        whoDrugs: Math.floor(Math.random() * 500) + 200
      }));
    };

    // Initial animation
    animateStatistics();
    
    // Update every 3 seconds
    const interval = setInterval(animateStatistics, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getAllSampleAccounts = () => {
    const accounts = [];
    
    // Add main roles
    accounts.push({ ...SAMPLE_ACCOUNTS.manufacturer, role: 'MANUFACTURER' });
    accounts.push({ ...SAMPLE_ACCOUNTS.distributor, role: 'DISTRIBUTOR' });
    accounts.push({ ...SAMPLE_ACCOUNTS.hospital, role: 'HOSPITAL' });
    
    // Add patients
    SAMPLE_ACCOUNTS.patients.forEach(patient => {
      accounts.push({ ...patient, role: 'PATIENT' });
    });
    
    return accounts;
  };

  const handleGrantRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await grantRole(roleForm.role, roleForm.address);
      setRoleForm({ address: '', role: 'MANUFACTURER' });
      
      // Add to recent activity
      const newActivity = {
        id: Date.now(),
        type: 'role_granted',
        message: `${t.admin.grantRoles.success} - ${roleForm.role} role granted to ${roleForm.address.slice(0, 6)}...${roleForm.address.slice(-4)}`,
        timestamp: new Date().toLocaleString(),
        color: 'blue'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
      
      alert(t.admin.grantRoles.success);
    } catch (error) {
      console.error('Error granting role:', error);
      
      // Add error to recent activity
      const newActivity = {
        id: Date.now(),
        type: 'role_error',
        message: `${t.admin.grantRoles.error}: ${error.message}`,
        timestamp: new Date().toLocaleString(),
        color: 'red'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      alert(t.admin.grantRoles.error + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterHospital = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await registerHospital(
        hospitalForm.address,
        hospitalForm.name,
        hospitalForm.registrationNumber,
        parseInt(hospitalForm.type),
        parseInt(hospitalForm.threshold),
        parseInt(hospitalForm.capacity)
      );
      setHospitalForm({ address: '', name: '', registrationNumber: '', type: '0', threshold: '', capacity: '' });
      
      // Add to recent activity
      const newActivity = {
        id: Date.now(),
        type: 'hospital_registered',
        message: `${t.admin.registerHospital.success} - ${hospitalForm.name} registered`,
        timestamp: new Date().toLocaleString(),
        color: 'green'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      alert(t.admin.registerHospital.success);
    } catch (error) {
      console.error('Error registering hospital:', error);
      
      // Add error to recent activity
      const newActivity = {
        id: Date.now(),
        type: 'hospital_error',
        message: `${t.admin.registerHospital.error}: ${error.message}`,
        timestamp: new Date().toLocaleString(),
        color: 'red'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      alert(t.admin.registerHospital.error + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // WHO Drug Verification Function
  const verifyWHODrug = async (drugName) => {
    try {
      // Simulate WHO API call - in real implementation, this would call actual WHO API
      const whoApprovedDrugs = [
        'paracetamol', 'acetaminophen', 'aspirin', 'ibuprofen', 'amoxicillin',
        'metformin', 'omeprazole', 'atorvastatin', 'losartan', 'amlodipine',
        'metoprolol', 'furosemide', 'hydrochlorothiazide', 'lisinopril',
        'simvastatin', 'pantoprazole', 'citalopram', 'sertraline', 'fluoxetine',
        'dolo', 'crocin', 'combiflam', 'vicks', 'strepsils', 'betadine'
      ];
      
      const isApproved = whoApprovedDrugs.some(drug => 
        drugName.toLowerCase().includes(drug.toLowerCase()) || 
        drug.toLowerCase().includes(drugName.toLowerCase())
      );
      
      if (isApproved) {
        setDrugVerification({
          verified: true,
          message: '✅ Verified with WHO approved drug database'
        });
      } else {
        setDrugVerification({
          verified: false,
          message: '❌ Not found in WHO approved drug database'
        });
      }
    } catch (error) {
      setDrugVerification({
        verified: false,
        message: '❌ Error verifying with WHO database'
      });
    }
  };

  const handleDrugNameChange = (e) => {
    const drugName = e.target.value;
    setWhoDrugName(drugName);
    
    // Get auto-fill suggestions
    const suggestions = searchWHODrugs(drugName);
    setDrugSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && drugName.length >= 2);
    
    // Verify drug against WHO list
    const verificationResult = getDrugVerificationStatus(drugName);
    setDrugVerification(verificationResult);
  };

  const handleDrugSuggestionClick = (suggestion) => {
    setWhoDrugName(suggestion);
    setDrugSuggestions([]);
    setShowSuggestions(false);
    
    // Verify the selected drug
    const verificationResult = getDrugVerificationStatus(suggestion);
    setDrugVerification(verificationResult);
  };

  const handleAddWHODrug = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { ethers } = require('ethers');
      const drugHash = ethers.keccak256(ethers.toUtf8Bytes(whoDrugName + '-WHO-2024'));
      await addWHOApprovedDrug(drugHash);
      setWhoDrugName('');
      setDrugVerification({ verified: false, message: '' });
      
      // Add to recent activity
      const newActivity = {
        id: Date.now(),
        type: 'who_drug_added',
        message: `${t.admin.whoDrugs.success} - ${whoDrugName} added to WHO approved list`,
        timestamp: new Date().toLocaleString(),
        color: 'yellow'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      alert(t.admin.whoDrugs.success);
    } catch (error) {
      console.error('Error adding WHO drug:', error);
      
      // Add error to recent activity
      const newActivity = {
        id: Date.now(),
        type: 'who_drug_error',
        message: `${t.admin.whoDrugs.error}: ${error.message}`,
        timestamp: new Date().toLocaleString(),
        color: 'red'
      };
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      alert(t.admin.whoDrugs.error + ': ' + error.message);
    } finally {
      setLoading(false);
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
          {/* Wallet Connection Status */}
          <WalletConnector />
          
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl mb-8 border border-white/20">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{t.admin.title}</h1>
                  <p className="text-lg text-white/80 mb-4">
                    {t.admin.subtitle}
                  </p>
                  {account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        {t.admin.connected}: {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                      <RoleStatus />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{t.admin.systemAdmin}</div>
                  <div className="text-white/70">{t.admin.fullAccess}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Accounts Overview */}
          <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl mb-8 border border-white/20">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                Authorized Accounts
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        {t.admin.sampleAccounts.name}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        {t.admin.sampleAccounts.address}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        {t.admin.sampleAccounts.requiredRole}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                        {t.admin.sampleAccounts.patientId}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {getAllSampleAccounts().map((account, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {account.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 font-mono">
                          {account.address.slice(0, 10)}...{account.address.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            account.role === 'MANUFACTURER' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                            account.role === 'DISTRIBUTOR' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                            account.role === 'HOSPITAL' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                            account.role === 'PATIENT' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                            'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                          }`}>
                            {account.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                          {account.id || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem" maxWidth="100%" padding="2rem">
            {/* Role Management */}
            <GlowingCard glowColor="#3b82f6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                {t.admin.grantRoles.title}
              </h2>
              
              <form onSubmit={handleGrantRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    {t.admin.grantRoles.userAddress}
                  </label>
                  <input
                    type="text"
                    value={roleForm.address}
                    onChange={(e) => setRoleForm({...roleForm, address: e.target.value})}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    {t.admin.grantRoles.role}
                  </label>
                  <select
                    value={roleForm.role}
                    onChange={(e) => setRoleForm({...roleForm, role: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}
                  >
                    <option value="MANUFACTURER" className="bg-gray-800 text-white">{t.admin.grantRoles.manufacturer}</option>
                    <option value="DISTRIBUTOR" className="bg-gray-800 text-white">{t.admin.grantRoles.distributor}</option>
                    <option value="HOSPITAL" className="bg-gray-800 text-white">{t.admin.grantRoles.hospital}</option>
                    <option value="PATIENT" className="bg-gray-800 text-white">{t.admin.grantRoles.patient}</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      {t.admin.grantRoles.loading}
                    </div>
                  ) : (
                    t.admin.grantRoles.button
                  )}
                </button>
              </form>
            </GlowingCard>

            {/* Hospital Registration */}
            <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {t.admin.registerHospital.title}
              </h2>
              
              <form onSubmit={handleRegisterHospital} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    {t.admin.registerHospital.hospitalAddress}
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.address}
                    onChange={(e) => setHospitalForm({...hospitalForm, address: e.target.value})}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    {t.admin.registerHospital.hospitalName}
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.name}
                    onChange={(e) => setHospitalForm({...hospitalForm, name: e.target.value})}
                    placeholder="General Hospital"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={hospitalForm.registrationNumber}
                    onChange={(e) => setHospitalForm({...hospitalForm, registrationNumber: e.target.value})}
                    placeholder="REG-2024-001"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    {t.admin.registerHospital.hospitalType}
                  </label>
                  <select
                    value={hospitalForm.type}
                    onChange={(e) => setHospitalForm({...hospitalForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white backdrop-blur-sm hover:bg-white/15 transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}
                  >
                    <option value="0" className="bg-gray-800 text-white">{t.admin.registerHospital.urban}</option>
                    <option value="1" className="bg-gray-800 text-white">{t.admin.registerHospital.rural}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    {t.admin.registerHospital.stockThreshold}
                  </label>
                  <input
                    type="number"
                    value={hospitalForm.threshold}
                    onChange={(e) => setHospitalForm({...hospitalForm, threshold: e.target.value})}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Hospital Capacity
                  </label>
                  <input
                    type="number"
                    value={hospitalForm.capacity}
                    onChange={(e) => setHospitalForm({...hospitalForm, capacity: e.target.value})}
                    placeholder="500"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      {t.admin.registerHospital.loading}
                    </div>
                  ) : (
                    t.admin.registerHospital.button
                  )}
                </button>
              </form>
            </GlowingCard>

            {/* WHO Drug Management */}
            <GlowingCard glowColor="#f59e0b" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                {t.admin.whoDrugs.title}
              </h2>
              
              <form onSubmit={handleAddWHODrug} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    {t.admin.whoDrugs.drugName}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={whoDrugName}
                      onChange={handleDrugNameChange}
                      onFocus={() => setShowSuggestions(whoDrugName.length >= 2)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Start typing drug name..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                      required
                    />
                    
                    {/* Auto-fill Suggestions */}
                    {showSuggestions && drugSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-gray-800/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                        {drugSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => handleDrugSuggestionClick(suggestion)}
                            className="px-4 py-3 text-white hover:bg-white/10 cursor-pointer transition-colors duration-200 border-b border-white/10 last:border-b-0"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {drugVerification.message && (
                    <div className={`mt-2 p-2 rounded-lg text-sm ${
                      drugVerification.isApproved 
                        ? 'bg-green-500/20 border border-green-400/30 text-green-200' 
                        : 'bg-red-500/20 border border-red-400/30 text-red-200'
                    }`}>
                      {drugVerification.message}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      {t.admin.whoDrugs.loading}
                    </div>
                  ) : (
                    t.admin.whoDrugs.button
                  )}
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> {t.admin.whoDrugs.note}
                </p>
              </div>
            </GlowingCard>

            {/* System Stats */}
            <GlowingCard glowColor="#8b5cf6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                {t.admin.systemStats.title}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                    <div className="text-2xl font-bold text-blue-300 animate-pulse">
                      {statistics.totalBatches.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-200">{t.admin.systemStats.totalBatches}</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                    <div className="text-2xl font-bold text-green-300 animate-pulse">
                      {statistics.activeHospitals.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-200">{t.admin.systemStats.activeHospitals}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                    <div className="text-2xl font-bold text-purple-300 animate-pulse">
                      {statistics.totalUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-200">{t.admin.systemStats.totalUsers}</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                    <div className="text-2xl font-bold text-yellow-300 animate-pulse">
                      {statistics.whoDrugs.toLocaleString()}
                    </div>
                    <div className="text-sm text-yellow-200">{t.admin.systemStats.whoDrugs}</div>
                  </div>
                </div>
              </div>
            </GlowingCard>
          </GlowingCards>

          {/* Recent Activity */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t.admin.recentActivity.title}</h2>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <p className="text-lg">{t.admin.recentActivity.noActivity}</p>
                  <p className="text-sm mt-2">{t.admin.recentActivity.description}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        activity.color === 'blue' ? 'bg-blue-500/10 border-blue-400' :
                        activity.color === 'green' ? 'bg-green-500/10 border-green-400' :
                        activity.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-400' :
                        activity.color === 'red' ? 'bg-red-500/10 border-red-400' :
                        'bg-white/10 border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.message}</p>
                          <p className="text-white/60 text-sm mt-1">{activity.timestamp}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          activity.color === 'blue' ? 'bg-blue-400' :
                          activity.color === 'green' ? 'bg-green-400' :
                          activity.color === 'yellow' ? 'bg-yellow-400' :
                          activity.color === 'red' ? 'bg-red-400' :
                          'bg-white/40'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
