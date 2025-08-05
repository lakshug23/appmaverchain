import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import MagicLoader from '../components/MagicLoader';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import { RoleStatus } from '../components/RoleProtection';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import BackButton from '../components/BackButton';
import { searchWHODrugs, isWHOApproved } from '../utils/who-drugs-api';
import { generatePrintableQR } from '../utils/qrcode';
import QRCodeDisplay from '../components/QRCodeDisplay';

const ManufacturerDashboard = () => {
  const { account } = useWallet();
  const { createBatch, getManufacturerBatches, transferBatch, userRole, requestDrugs, approveRequest, rejectRequest, getDrugRequest, grantRole, forceReinitialize } = useContract();
  const { t } = useLanguage();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    batch: null,
    recipient: ''
  });
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    batch: null,
    scanned: false,
    transactionHash: null
  });

  const [batchForm, setBatchForm] = useState({
    drugName: '',
    quantity: '',
    expiryDate: '',
    manufacturingDate: ''
  });

  // New state for enhanced features
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [whoVerification, setWhoVerification] = useState(null);
  const [distributorRequests, setDistributorRequests] = useState([]);
  const [newMedicineArrivals, setNewMedicineArrivals] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [hasManufacturerRole, setHasManufacturerRole] = useState(false);
  const [roleCheckLoading, setRoleCheckLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);

  // WHO approved drugs for live updates (hardcoded as requested)
  const whoNewArrivals = [
    {
      id: 1,
      name: "Remdesivir",
      purpose: "Antiviral medication for COVID-19 treatment",
      status: "pending",
      timestamp: Date.now() - 3600000 // 1 hour ago
    },
    {
      id: 2,
      name: "Molnupiravir",
      purpose: "Oral antiviral for COVID-19 prevention",
      status: "pending",
      timestamp: Date.now() - 7200000 // 2 hours ago
    },
    {
      id: 3,
      name: "Paxlovid",
      purpose: "Combination antiviral for COVID-19 treatment",
      status: "approved",
      timestamp: Date.now() - 10800000 // 3 hours ago
    }
  ];

  useEffect(() => {
    if (account) {
      checkManufacturerRole();
      loadManufacturerBatches();
      loadDistributorRequests();
      setNewMedicineArrivals(whoNewArrivals);
    }
  }, [account]);

  const forceRefreshContract = async () => {
    try {
      console.log('🔄 Force refreshing contract connection...');
      await forceReinitialize();
    } catch (error) {
      console.error('❌ Error force refreshing:', error);
    }
  };

  const checkManufacturerRole = async () => {
    if (!account) return;
    
    try {
      setRoleCheckLoading(true);
      console.log('🔍 Checking manufacturer role for account:', account);
      
      // Check if current account has manufacturer role
      const isManufacturer = userRole === 'manufacturer' || userRole === 'admin';
      
      // Also check if it's the sample manufacturer account
      const sampleManufacturerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      const isSampleManufacturer = account.toLowerCase() === sampleManufacturerAddress.toLowerCase();
      
      const hasRole = isManufacturer || isSampleManufacturer;
      setHasManufacturerRole(hasRole);
      
      console.log('✅ Role check complete. Has manufacturer role:', hasRole);
      console.log('✅ User role:', userRole);
      console.log('✅ Is sample manufacturer:', isSampleManufacturer);
    } catch (error) {
      console.error('❌ Error checking manufacturer role:', error);
      setHasManufacturerRole(false);
    } finally {
      setRoleCheckLoading(false);
    }
  };

  const assignManufacturerRole = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      console.log('🔍 Assigning manufacturer role to:', account);
      
      // Grant manufacturer role to current account
      await grantRole('manufacturer', account);
      
      console.log('✅ Manufacturer role assigned successfully');
      setHasManufacturerRole(true);
      alert('Manufacturer role assigned successfully! You can now create batches.');
    } catch (error) {
      console.error('❌ Error assigning manufacturer role:', error);
      alert('Error assigning manufacturer role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadManufacturerBatches = async () => {
    if (!account) return;

    try {
      setLoading(true);
      console.log('🔍 Loading batches for account:', account);
      const manufacturerBatches = await getManufacturerBatches(account);
      console.log('✅ Manufacturer batches loaded:', manufacturerBatches);
      setBatches(manufacturerBatches);
    } catch (error) {
      console.error('❌ Error loading manufacturer batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistributorRequests = async () => {
    // Simulate loading distributor requests
    // In real implementation, this would fetch from contract
    const mockRequests = [
      {
        id: 1,
        distributor: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        drugName: "Paracetamol",
        quantity: 500,
        reason: "Low stock",
        status: "pending",
        timestamp: Date.now() - 1800000
      },
      {
        id: 2,
        distributor: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        drugName: "Ibuprofen",
        quantity: 300,
        reason: "High demand",
        status: "approved",
        timestamp: Date.now() - 3600000
      }
    ];
    setDistributorRequests(mockRequests);
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!account) return;

    try {
      setLoading(true);
      const expiryTimestamp = Math.floor(new Date(batchForm.expiryDate).getTime() / 1000);
      const manufacturingTimestamp = Math.floor(new Date(batchForm.manufacturingDate).getTime() / 1000);
      
      // Verify drug with WHO API
      const whoStatus = isWHOApproved(batchForm.drugName);
      setWhoVerification(whoStatus);
      
      const batchId = await createBatch(
        batchForm.drugName,
        parseInt(batchForm.quantity),
        expiryTimestamp
      );
      
      setBatchForm({ drugName: '', quantity: '', expiryDate: '', manufacturingDate: '' });
      await loadManufacturerBatches();
      
      // Add to logs
      addToLogs('BATCH_CREATED', `Created batch #${batchId} - ${batchForm.drugName} (${batchForm.quantity} units)`);
      
      alert(t.manufacturer.createBatch.success);
    } catch (error) {
      console.error('❌ Error creating batch:', error);
      alert(t.manufacturer.createBatch.error + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrugNameChange = (e) => {
    const drugName = e.target.value;
    setBatchForm({...batchForm, drugName});
    
    if (drugName.length > 2) {
      const suggestions = searchWHODrugs(drugName);
      setDrugSuggestions(suggestions);
    } else {
      setDrugSuggestions([]);
    }
  };

  const selectDrugSuggestion = (drugName) => {
    setBatchForm({...batchForm, drugName});
    setDrugSuggestions([]);
    setSelectedDrug(drugName);
  };

  const openTransferModal = (batch) => {
    setTransferModal({
      isOpen: true,
      batch: batch,
      recipient: ''
    });
  };

  const closeTransferModal = () => {
    setTransferModal({
      isOpen: false,
      batch: null,
      recipient: ''
    });
  };

  const openQRModal = (batch) => {
    setQrModal({
      isOpen: true,
      batch: batch,
      scanned: false,
      transactionHash: null
    });
  };

  const closeQRModal = () => {
    setQrModal({
      isOpen: false,
      batch: null,
      scanned: false,
      transactionHash: null
    });
  };

  const simulateQRScan = () => {
    // Simulate QR code scan with transaction
    const mockTransactionHash = '0x' + Math.random().toString(16).substr(2, 64);
    setQrModal(prev => ({
      ...prev,
      scanned: true,
      transactionHash: mockTransactionHash
    }));
    
    // Add to recent logs
    addToLogs('QR_SCAN', `Batch #${qrModal.batch?.id} scanned via simulation`, mockTransactionHash);
  };

  const addToLogs = (type, message, transactionHash = null) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      transactionHash,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    setRecentLogs(prev => [newLog, ...prev.slice(0, 19)]); // Keep last 20 logs

    // Also log to admin dashboard
    const adminLog = {
      type: type.toLowerCase(),
      manufacturer: account,
      timestamp: Date.now(),
      transactionHash: transactionHash || `0x${Math.random().toString(16).substr(2, 40)}`,
      message: message
    };

    // Extract drug name and quantity from message for admin logs
    const drugMatch = message.match(/(\w+)\s*\((\d+)\s*units?\)/);
    if (drugMatch) {
      adminLog.drugName = drugMatch[1];
      adminLog.quantity = parseInt(drugMatch[2]);
    }

    const existingLogs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
    existingLogs.unshift(adminLog);
    localStorage.setItem('adminActivityLogs', JSON.stringify(existingLogs));
  };

  const handleRealQRScan = (qrData) => {
    try {
      // Parse QR data
      const decodedData = atob(qrData);
      const trackingData = JSON.parse(decodedData);
      
      // Verify the scan
      const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Add to logs
      addToLogs('QR_SCAN', `Batch #${trackingData.batchId} scanned via mobile device`, transactionHash);
      
      // Update QR modal if it's open
      if (qrModal.isOpen && qrModal.batch?.id.toString() === trackingData.batchId) {
        setQrModal(prev => ({
          ...prev,
          scanned: true,
          transactionHash
        }));
      }
      
      alert(`✅ QR Code scanned successfully!\nBatch: ${trackingData.drugName}\nTransaction: ${transactionHash}`);
      
    } catch (error) {
      console.error('Error processing QR scan:', error);
      addToLogs('QR_SCAN_ERROR', 'Invalid QR code format', null);
      alert('❌ Invalid QR code format');
    }
  };

  const handleTransfer = async () => {
    if (!transferModal.batch || !transferModal.recipient) return;

    try {
      setLoading(true);
      await transferBatch(transferModal.batch.id, transferModal.recipient);
      closeTransferModal();
      await loadManufacturerBatches();
      alert('Batch transferred successfully!');
    } catch (error) {
      console.error('❌ Error transferring batch:', error);
      alert('Error transferring batch: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      const request = distributorRequests.find(req => req.id === requestId);
      
      // Simulate drug dispatch
      const dispatchTransactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      const dispatchTimestamp = new Date().toISOString();
      
      // Update request status
      const updatedRequests = distributorRequests.map(req => 
        req.id === requestId ? {
          ...req, 
          status: 'dispatched',
          dispatchTransactionHash,
          dispatchTimestamp,
          dispatchedQuantity: req.quantity
        } : req
      );
      setDistributorRequests(updatedRequests);
      
      // Add to logs
      addToLogs('REQUEST_APPROVED', `Approved distributor request for ${request?.drugName} (${request?.quantity} units)`);
      addToLogs('DRUG_DISPATCHED', `Dispatched ${request?.quantity} units of ${request?.drugName} to distributor ${request?.distributor}`, dispatchTransactionHash);
      
      // Send notification to distributor (in real implementation, this would be a blockchain event)
      console.log(`📦 DISPATCH NOTIFICATION: ${request?.quantity} units of ${request?.drugName} dispatched to ${request?.distributor}`);
      
      // Store dispatch notification for distributor dashboard
      const dispatchNotification = {
        id: Date.now(),
        drugName: request?.drugName,
        quantity: request?.quantity,
        distributor: request?.distributor,
        transactionHash: dispatchTransactionHash,
        timestamp: dispatchTimestamp,
        status: 'dispatched'
      };
      
      localStorage.setItem('dispatchNotifications', JSON.stringify([
        ...JSON.parse(localStorage.getItem('dispatchNotifications') || '[]'),
        dispatchNotification
      ]));
      
      alert(`✅ Request approved and ${request?.quantity} units of ${request?.drugName} dispatched successfully!\nTransaction: ${dispatchTransactionHash}`);
    } catch (error) {
      console.error('❌ Error approving request:', error);
      alert('Error approving request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true);
      // In real implementation, this would call the contract
      const updatedRequests = distributorRequests.map(req => 
        req.id === requestId ? {...req, status: 'rejected'} : req
      );
      setDistributorRequests(updatedRequests);
      
      // Add to logs
      const request = distributorRequests.find(req => req.id === requestId);
      addToLogs('REQUEST_REJECTED', `Rejected distributor request for ${request?.drugName} (${request?.quantity} units)`);
      
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      alert('Error rejecting request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineResponse = (medicineId, response) => {
    const updatedArrivals = newMedicineArrivals.map(medicine => 
      medicine.id === medicineId ? {...medicine, status: response} : medicine
    );
    setNewMedicineArrivals(updatedArrivals);
    
    // Add to logs
    const medicine = newMedicineArrivals.find(m => m.id === medicineId);
    if (response === 'approved') {
      addToLogs('MEDICINE_APPROVED', `Approved ${medicine?.name} for market: ${medicine?.purpose}`);
      
      // Send report to hospitals
      sendHospitalReport(medicine?.name, medicine?.purpose);
      
      alert('Medicine approved for market! Hospital report sent.');
    } else {
      addToLogs('MEDICINE_DECLINED', `Declined ${medicine?.name}: ${medicine?.purpose}`);
      alert('Medicine declined.');
    }
  };

  const sendHospitalReport = (medicineName, purpose) => {
    const reportTransactionHash = '0x' + Math.random().toString(16).substr(2, 64);
    const reportTimestamp = new Date().toISOString();
    
    // Simulate sending report to all hospitals
    const hospitalReport = {
      id: Date.now(),
      medicineName,
      purpose,
      reportTransactionHash,
      reportTimestamp,
      status: 'sent'
    };
    
    // Add to logs
    addToLogs('HOSPITAL_REPORT_SENT', `Sent WHO report for ${medicineName} to all hospitals`, reportTransactionHash);
    
    // In real implementation, this would be a blockchain event
    console.log(`🏥 HOSPITAL REPORT: New medicine ${medicineName} - ${purpose}`);
    console.log(`📋 Report sent to all registered hospitals at ${reportTimestamp}`);
    
    // Store report for hospital dashboard access
    localStorage.setItem('hospitalReports', JSON.stringify([
      ...JSON.parse(localStorage.getItem('hospitalReports') || '[]'),
      hospitalReport
    ]));
  };

  function getStatusColor(status) {
    switch (status) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 0: return 'Available';
      case 1: return 'In Transit';
      case 2: return 'Delivered';
      default: return 'Unknown';
    }
  }

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
                  <h1 className="text-4xl font-bold text-white mb-2">{t.manufacturer.title}</h1>
                  <p className="text-lg text-white/80 mb-4">
                    {t.manufacturer.subtitle}
                  </p>
                  {account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                      <RoleStatus />
                      {!roleCheckLoading && (
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          hasManufacturerRole 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {hasManufacturerRole ? '✅ Manufacturer' : '❌ No Manufacturer Role'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <BackButton />
                  <button
                    onClick={forceRefreshContract}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ⚡ Force Connect
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔄 Refresh Contract
                  </button>
                  <button
                    onClick={() => {
                      if (window.ethereum) {
                        window.ethereum.request({
                          method: 'wallet_requestAccounts',
                          params: []
                        }).then(() => {
                          // Switch to sample manufacturer account
                          alert('Please switch to the sample manufacturer account in MetaMask:\n\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
                        });
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    🔑 Switch to Sample Manufacturer
                  </button>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{t.manufacturer.role}</div>
                    <div className="text-white/70">{t.manufacturer.roleDescription}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Assignment Section */}
          {!hasManufacturerRole && !roleCheckLoading && (
            <div className="mb-8">
              <GlowingCard glowColor="#f59e0b" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  Role Assignment Required
                </h2>
                
                <div className="text-white/80 mb-4">
                  <p>Your account doesn't have the manufacturer role. You need this role to create batches.</p>
                  <p className="text-sm mt-2">Connected Account: {account}</p>
                </div>
                
                <button
                  onClick={assignManufacturerRole}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      Assigning Role...
                    </div>
                  ) : (
                    '🔑 Assign Manufacturer Role'
                  )}
                </button>
              </GlowingCard>
            </div>
          )}

          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Create Batch with WHO Integration */}
            <GlowingCard glowColor="#3b82f6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                Create New Batch with WHO Verification
              </h2>
              
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Drug Name (WHO Verified)
                  </label>
                  <input
                    type="text"
                    value={batchForm.drugName}
                    onChange={handleDrugNameChange}
                    placeholder="Enter drug name..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                  
                  {/* WHO Verification Status */}
                  {whoVerification !== null && (
                    <div className={`mt-2 p-2 rounded-lg text-sm ${
                      whoVerification ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {whoVerification ? '✅ WHO Approved Drug' : '❌ Not in WHO Database'}
                    </div>
                  )}
                  
                  {/* Drug Suggestions */}
                  {drugSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg max-h-40 overflow-y-auto">
                      {drugSuggestions.map((drug, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectDrugSuggestion(drug)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors"
                        >
                          {drug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    value={batchForm.manufacturingDate}
                    onChange={(e) => setBatchForm({...batchForm, manufacturingDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={batchForm.quantity}
                    onChange={(e) => setBatchForm({...batchForm, quantity: e.target.value})}
                    placeholder="1000"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={batchForm.expiryDate}
                    onChange={(e) => setBatchForm({...batchForm, expiryDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white backdrop-blur-sm"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !hasManufacturerRole}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      Creating Batch...
                    </div>
                  ) : !hasManufacturerRole ? (
                    '❌ Need Manufacturer Role'
                  ) : (
                    'Create Batch & Generate QR'
                  )}
                </button>
              </form>
            </GlowingCard>

            {/* Batch Management */}
            <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                Batch Management
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={loadManufacturerBatches}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      Loading...
                    </div>
                  ) : (
                    'Refresh Batches'
                  )}
                </button>
                
                {loading && batches.length === 0 ? (
                  <div className="text-center py-8">
                    <MagicLoader size={60} particleCount={3} speed={0.8} className="mb-4" />
                    <p className="text-white/60">Loading batches...</p>
                  </div>
                ) : batches.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {batches.map((batch) => (
                      <div key={batch.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-white">#{batch.id} - {batch.drugName}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </div>
                        <div className="text-white/80 text-sm mb-3">
                          <p>Quantity: {batch.quantity} units</p>
                          <p>Expiry: {new Date(parseInt(batch.expiryDate) * 1000).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openQRModal(batch)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            📱 QR Code
                          </button>
                          {(batch.status === 0 || batch.status === '0' || Number(batch.status) === 0) && (
                            <button 
                              onClick={() => openTransferModal(batch)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              🚚 Transfer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-white mb-2">No batches yet</h3>
                    <p className="text-white/60">Create your first drug batch using the form above.</p>
                  </div>
                )}
              </div>
            </GlowingCard>

            {/* Distributor Requests */}
            <GlowingCard glowColor="#f59e0b" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Distributor Requests & Dispatch Management
              </h2>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {distributorRequests.length > 0 ? (
                  distributorRequests.map((request) => (
                    <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-2">{request.drugName}</h4>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Quantity Requested</p>
                              <p className="text-white text-lg font-bold">{request.quantity} units</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Reason</p>
                              <p className="text-white">{request.reason}</p>
                            </div>
                          </div>
                          <p className="text-white/50 text-xs">
                            Requested: {new Date(request.timestamp).toLocaleString()}
                          </p>
                          {request.dispatchTimestamp && (
                            <p className="text-green-300 text-xs mt-1">
                              Dispatched: {new Date(request.dispatchTimestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-2 text-sm font-semibold rounded-full ${
                          request.status === 'dispatched' ? 'bg-green-100 text-green-800' :
                          request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'dispatched' ? '📦 Dispatched' : request.status}
                        </span>
                      </div>
                      
                      {request.dispatchTransactionHash && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-green-300 font-semibold">Dispatch Confirmed</span>
                          </div>
                          <p className="text-green-300 text-sm">
                            Transaction: {request.dispatchTransactionHash.slice(0, 10)}...{request.dispatchTransactionHash.slice(-8)}
                          </p>
                          <p className="text-green-300 text-sm">
                            Quantity Dispatched: {request.dispatchedQuantity} units
                          </p>
                        </div>
                      )}
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-3 mt-4">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            ✅ Approve & Dispatch
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-4xl mb-4">📋</div>
                    <p className="text-white/60">No pending requests</p>
                  </div>
                )}
              </div>
            </GlowingCard>

            {/* New Medicine Arrivals */}
            <GlowingCard glowColor="#8b5cf6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                New Medicine Arrivals (WHO) & Hospital Reports
              </h2>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                                  {newMedicineArrivals.map((medicine) => (
                    <div key={medicine.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-2">{medicine.name}</h4>
                          <div className="mb-3">
                            <p className="text-white/70 text-sm font-semibold mb-1">Purpose</p>
                            <p className="text-white">{medicine.purpose}</p>
                          </div>
                          <p className="text-white/50 text-xs">
                            Arrived: {new Date(medicine.timestamp).toLocaleString()}
                          </p>
                          {medicine.status === 'approved' && (
                            <p className="text-green-300 text-xs mt-1">
                              ✅ Approved and hospital report sent
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-2 text-sm font-semibold rounded-full ${
                          medicine.status === 'approved' ? 'bg-green-100 text-green-800' :
                          medicine.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {medicine.status === 'approved' ? '✅ Approved' : medicine.status}
                        </span>
                      </div>
                      
                      {medicine.status === 'approved' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-blue-300 font-semibold">Hospital Report Sent</span>
                          </div>
                          <p className="text-blue-300 text-sm">
                            All registered hospitals have been notified about {medicine.name}
                          </p>
                        </div>
                      )}
                      
                      {medicine.status === 'pending' && (
                        <div className="flex space-x-3 mt-4">
                          <button
                            onClick={() => handleMedicineResponse(medicine.id, 'approved')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            ✅ Approve & Send Report
                          </button>
                          <button
                            onClick={() => handleMedicineResponse(medicine.id, 'declined')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            ❌ Decline
                          </button>
                        </div>
                      )}
                                         </div>
                   ))}
                </div>
            </GlowingCard>

            {/* Recent Logs Section */}
            <GlowingCard glowColor="#6366f1" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Recent Activity Logs
              </h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <div key={log.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{log.message}</h4>
                          <p className="text-white/70 text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          {log.transactionHash && (
                            <p className="text-white/50 text-xs font-mono">
                              TX: {log.transactionHash.slice(0, 10)}...{log.transactionHash.slice(-8)}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          log.type === 'QR_SCAN' ? 'bg-green-100 text-green-800' :
                          log.type === 'BATCH_CREATED' ? 'bg-blue-100 text-blue-800' :
                          log.type === 'QR_SCAN_ERROR' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-4xl mb-4">📋</div>
                    <p className="text-white/60">No activity logs yet</p>
                    <p className="text-white/40 text-sm mt-2">Create batches and scan QR codes to see activity</p>
                  </div>
                )}
              </div>
            </GlowingCard>
          </div>

          {/* Transfer Modal */}
          {transferModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Transfer Batch #{transferModal.batch?.id}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={transferModal.recipient}
                      onChange={(e) => setTransferModal({...transferModal, recipient: e.target.value})}
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleTransfer}
                      disabled={loading || !transferModal.recipient}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold transition-all duration-300"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                          Transferring...
                        </div>
                      ) : (
                        'Transfer'
                      )}
                    </button>
                    <button
                      onClick={closeTransferModal}
                      className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced QR Modal with Transaction Tick */}
          {qrModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-lg w-full mx-4 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">QR Code for Batch #{qrModal.batch?.id}</h3>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <QRCodeDisplay 
                      batchId={qrModal.batch?.id}
                      drugName={qrModal.batch?.drugName}
                      manufacturer={account}
                      manufactureDateTimestamp={Math.floor(Date.now() / 1000)}
                      size={200}
                    />
                  </div>
                  
                  {/* Transaction Status */}
                  {qrModal.scanned && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-green-300 font-semibold">Transaction Verified ✓</span>
                      </div>
                      <div className="text-green-300 text-sm">
                        <p>Batch ID: #{qrModal.batch?.id}</p>
                        <p>Hash: {qrModal.transactionHash}</p>
                        <p>Status: Dispatched to Distributor</p>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-white/80 text-sm mb-4">
                    Batch: {qrModal.batch?.drugName}<br/>
                    Quantity: {qrModal.batch?.quantity} units
                  </p>
                  
                  <div className="space-y-3">
                    {!qrModal.scanned && (
                      <div className="space-y-2">
                        <button
                          onClick={simulateQRScan}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          📱 Simulate Mobile Scan
                        </button>
                        
                        <div className="border-t border-white/20 pt-3">
                          <label className="block text-sm font-semibold text-white/90 mb-2">
                            Manual QR Code Input (for mobile scanning demo)
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Paste QR code data here..."
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleRealQRScan(e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                const input = e.target.previousElementSibling;
                                if (input.value) {
                                  handleRealQRScan(input.value);
                                  input.value = '';
                                }
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              Scan
                            </button>
                          </div>
                          <p className="text-white/50 text-xs mt-1">
                            Copy the tracking string from the QR code and paste it here to simulate mobile scanning
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={closeQRModal}
                      className="w-full bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
