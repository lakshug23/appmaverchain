import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import MagicLoader from '../components/MagicLoader';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import { RoleStatus } from '../components/RoleProtection';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import BackButton from '../components/BackButton';
import QRCodeDisplay from '../components/QRCodeDisplay';
import SimpleQRCode from '../components/SimpleQRCode';
import InventoryManagement from '../components/InventoryManagement';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DistributorDashboard = () => {
  const { account } = useWallet();
  const { 
    getDistributorBatches, 
    transferToHospital, 
    userRole, 
    createBatch, 
    requestFromManufacturer: contractRequestFromManufacturer,
    getDistributorRequests,
    contract
  } = useContract();
  const { t } = useLanguage();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    batch: null,
    selectedHospital: ''
  });
  const [dispatchNotifications, setDispatchNotifications] = useState([]);
  
  // New state for enhanced features
  const [qrArrivals, setQrArrivals] = useState([]);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [manufacturerRequests, setManufacturerRequests] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedMedicine, setSelectedMedicine] = useState('All Medicines');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Day');
  
  // Hospital Requests Filters
  const [hospitalFilter, setHospitalFilter] = useState({
    urgency: 'All',
    type: 'All', // Rural/Urban
    drug: 'All Medicines',
    dateRange: 'All Time',
    sortBy: 'priority' // priority, distance, timestamp
  });

  // Sample data for enhanced features
  const medicines = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Insulin Glargine', 'Covishield Vaccine', 'Azithromycin 500mg'];
  
  // Enhanced sample QR arrivals from manufacturer with realistic data
  const sampleQrArrivals = [
    {
      id: 1,
      drugName: 'Paracetamol 500mg',
      drugCode: 'PARA500-2025',
      quantity: 500,
      manufacturer: 'Aurobindo Pharma Ltd',
      manufacturerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      qrCode: JSON.stringify({
        id: 'QR_PARA_001_2025_08_04',
        drug: 'Paracetamol 500mg',
        batch: 'AP2025080401',
        mfg: 'Aurobindo Pharma Ltd',
        qty: 500,
        exp: new Date(Date.now() + (730 * 86400000)).toISOString().split('T')[0]
      }),
      batchNumber: 'AP2025080401',
      manufactureDate: Date.now() - 86400000, // 1 day ago
      expiryDate: Date.now() + (730 * 86400000), // 2 years from now
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'pending',
      regulatoryApproval: 'FDA-APPROVED-2024',
      storageConditions: 'Store below 25°C, dry place',
      whoApproved: true
    },
    {
      id: 2,
      drugName: 'Insulin Glargine 100IU/ml',
      drugCode: 'INSU100-2025',
      quantity: 200,
      manufacturer: 'Biocon Biologics',
      manufacturerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      qrCode: JSON.stringify({
        id: 'QR_INSU_002_2025_08_04',
        drug: 'Insulin Glargine 100IU/ml',
        batch: 'BB2025080402',
        mfg: 'Biocon Biologics',
        qty: 200,
        exp: new Date(Date.now() + (180 * 86400000)).toISOString().split('T')[0],
        cold: true
      }),
      batchNumber: 'BB2025080402',
      manufactureDate: Date.now() - 172800000, // 2 days ago
      expiryDate: Date.now() + (180 * 86400000), // 6 months from now
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'pending',
      regulatoryApproval: 'FDA-APPROVED-2024',
      storageConditions: 'Refrigerate 2-8°C, do not freeze',
      whoApproved: true,
      requiresColdChain: true
    },
    {
      id: 3,
      drugName: 'Amoxicillin 250mg',
      drugCode: 'AMOX250-2025',
      quantity: 750,
      manufacturer: 'Cipla Limited',
      manufacturerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      qrCode: JSON.stringify({
        id: 'QR_AMOX_003_2025_08_04',
        drug: 'Amoxicillin 250mg',
        batch: 'CL2025080403',
        mfg: 'Cipla Limited',
        qty: 750,
        exp: new Date(Date.now() + (1095 * 86400000)).toISOString().split('T')[0]
      }),
      batchNumber: 'CL2025080403',
      manufactureDate: Date.now() - 259200000, // 3 days ago
      expiryDate: Date.now() + (1095 * 86400000), // 3 years from now
      timestamp: Date.now() - 10800000, // 3 hours ago
      status: 'pending',
      regulatoryApproval: 'FDA-APPROVED-2024',
      storageConditions: 'Store below 30°C, protect from moisture',
      whoApproved: true
    },
    {
      id: 4,
      drugName: 'Covishield Vaccine',
      drugCode: 'COV19-2025',
      quantity: 100,
      manufacturer: 'Serum Institute of India',
      manufacturerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      qrCode: JSON.stringify({
        id: 'QR_COV_004_2025_08_04',
        drug: 'Covishield Vaccine',
        batch: 'SII2025080404',
        mfg: 'Serum Institute of India',
        qty: 100,
        exp: new Date(Date.now() + (270 * 86400000)).toISOString().split('T')[0],
        cold: true,
        vaccine: true
      }),
      batchNumber: 'SII2025080404',
      manufactureDate: Date.now() - 86400000, // 1 day ago
      expiryDate: Date.now() + (270 * 86400000), // 9 months from now
      timestamp: Date.now() - 1800000, // 30 minutes ago
      status: 'pending',
      regulatoryApproval: 'WHO-EUL-2024',
      storageConditions: 'Store at 2-8°C, protect from light',
      whoApproved: true,
      requiresColdChain: true,
      priority: 'high',
      vaccineDoses: 100
    }
  ];

  // Sample hospital requests with rural/urban logic
  const sampleHospitalRequests = [
    {
      id: 1,
      hospitalName: 'Rural Health Center',
      location: 'Rural Tamil Nadu',
      type: 'rural',
      drugName: 'Paracetamol 500mg',
      quantity: 200,
      urgency: 'high',
      distance: 150,
      timestamp: Date.now() - 1800000
    },
    {
      id: 2,
      hospitalName: 'Apollo Hospitals',
      location: 'Chennai, TN',
      type: 'urban',
      drugName: 'Insulin Glargine',
      quantity: 100,
      urgency: 'medium',
      distance: 50,
      timestamp: Date.now() - 3600000
    },
    {
      id: 3,
      hospitalName: 'Rural Medical Center',
      location: 'Rural Karnataka',
      type: 'rural',
      drugName: 'Amoxicillin 250mg',
      quantity: 150,
      urgency: 'medium',
      distance: 200,
      timestamp: Date.now() - 5400000
    },
    {
      id: 4,
      hospitalName: 'City General Hospital',
      location: 'Bangalore, KA',
      type: 'urban',
      drugName: 'Covishield Vaccine',
      quantity: 300,
      urgency: 'high',
      distance: 75,
      timestamp: Date.now() - 7200000
    }
  ];

  // Sample inventory data for charts
  const sampleInventoryData = [
    { name: 'Paracetamol 500mg', stock: 1500, demand: 1200, status: 'optimal' },
    { name: 'Amoxicillin 250mg', stock: 800, demand: 1000, status: 'low' },
    { name: 'Insulin Glargine', stock: 2000, demand: 1800, status: 'optimal' },
    { name: 'Covishield Vaccine', stock: 500, demand: 800, status: 'critical' },
    { name: 'Azithromycin 500mg', stock: 1200, demand: 1100, status: 'optimal' }
  ];

  useEffect(() => {
    if (account) {
      // Debug contract and function availability
      console.log('🔍 Contract instance available:', !!contract);
      
      // Safely check contract methods without causing errors
      if (contract && contract.interface && contract.interface.functions) {
        console.log('🔍 Contract methods:', Object.keys(contract.interface.functions));
      } else {
        console.log('🔍 Contract methods: Not available');
      }
      
      console.log('🔍 contractRequestFromManufacturer available:', !!contractRequestFromManufacturer);
      
      loadDistributorBatches();
      loadDispatchNotifications();
      loadQrArrivals();
      loadHospitalRequests();
      loadInventoryData();
      loadManufacturerRequests();
    }
  }, [account, contract, contractRequestFromManufacturer]);

  const loadDispatchNotifications = () => {
    // Load dispatch notifications from localStorage (simulating blockchain events)
    const notifications = JSON.parse(localStorage.getItem('dispatchNotifications') || '[]');
    setDispatchNotifications(notifications);
  };

  const loadQrArrivals = () => {
    // Load persisted QR arrivals and merge with sample data
    const persistedArrivals = JSON.parse(localStorage.getItem('distributorQRArrivals') || '[]');
    const acceptedArrivals = JSON.parse(localStorage.getItem('acceptedQRArrivals') || '[]');
    
    // Mark previously accepted arrivals
    const updatedSampleArrivals = sampleQrArrivals.map(arrival => {
      const wasAccepted = acceptedArrivals.find(accepted => accepted.id === arrival.id);
      return wasAccepted ? { ...arrival, status: 'accepted', acceptedAt: wasAccepted.acceptedAt } : arrival;
    });
    
    // Combine all arrivals
    const allArrivals = [...persistedArrivals, ...updatedSampleArrivals];
    
    // Remove duplicates based on ID
    const uniqueArrivals = allArrivals.filter((arrival, index, self) => 
      index === self.findIndex(a => a.id === arrival.id)
    );
    
    // Sort by timestamp (newest first)
    uniqueArrivals.sort((a, b) => b.timestamp - a.timestamp);
    
    setQrArrivals(uniqueArrivals);
  };

  const simulateQRScan = () => {
    // Simulate scanning a new QR code arrival
    const newArrival = {
      id: Date.now(), // Use timestamp as unique ID
      drugName: 'Azithromycin 500mg',
      drugCode: 'AZIT500-2025',
      quantity: Math.floor(Math.random() * 500) + 100, // Random quantity 100-600
      manufacturer: 'Dr Reddy\'s Laboratories',
      manufacturerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      qrCode: JSON.stringify({
        id: `QR_SCAN_${Date.now()}`,
        drug: 'Azithromycin 500mg',
        batch: `DR${Date.now().toString().slice(-8)}`,
        mfg: 'Dr Reddy\'s Laboratories',
        qty: Math.floor(Math.random() * 500) + 100,
        exp: new Date(Date.now() + (365 * 86400000)).toISOString().split('T')[0],
        scanned: true
      }),
      batchNumber: `DR${Date.now().toString().slice(-8)}`,
      manufactureDate: Date.now() - Math.floor(Math.random() * 86400000 * 5), // 0-5 days ago
      expiryDate: Date.now() + (365 * 86400000), // 1 year from now
      timestamp: Date.now(),
      status: 'pending',
      regulatoryApproval: 'FDA-APPROVED-2024',
      storageConditions: 'Store below 25°C, dry place',
      whoApproved: true,
      scannedByDistributor: true
    };

    setQrArrivals(prev => {
      const updated = [newArrival, ...prev];
      
      // Persist the new arrival
      const persistedArrivals = JSON.parse(localStorage.getItem('distributorQRArrivals') || '[]');
      persistedArrivals.unshift(newArrival);
      localStorage.setItem('distributorQRArrivals', JSON.stringify(persistedArrivals));
      
      return updated;
    });

    alert(`📱 QR Code Scanned!\n\n💊 ${newArrival.drugName}\n📦 ${newArrival.quantity} units\n🏭 ${newArrival.manufacturer}\n\n✅ Added to pending arrivals`);
  };

  const rejectStock = async (qrArrival) => {
    if (!window.confirm(`Are you sure you want to reject this stock?\n\n${qrArrival.drugName} (${qrArrival.quantity} units)\nFrom: ${qrArrival.manufacturer}`)) {
      return;
    }

    try {
      setLoading(true);

      // Update QR arrival status
      setQrArrivals(prev => prev.map(item => 
        item.id === qrArrival.id 
          ? { ...item, status: 'rejected', rejectedAt: Date.now() }
          : item
      ));

      // Log rejection
      const adminLog = {
        type: 'qr_stock_rejected',
        distributor: account,
        drugName: qrArrival.drugName,
        quantity: qrArrival.quantity,
        manufacturer: qrArrival.manufacturer,
        qrCode: qrArrival.qrCode,
        reason: 'Rejected by distributor',
        timestamp: Date.now(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
      existingLogs.unshift(adminLog);
      localStorage.setItem('adminActivityLogs', JSON.stringify(existingLogs));

      alert('❌ Stock rejected and logged to system.');
      
    } catch (error) {
      console.error('Error rejecting stock:', error);
      alert('Error rejecting stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitalRequests = () => {
    // Sort hospital requests based on rural/urban logic (2:1 ratio)
    const sortedRequests = [...sampleHospitalRequests].sort((a, b) => {
      // First, group by urgency
      if (a.urgency !== b.urgency) {
        const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      
      // Within same urgency, prioritize rural (2:1 ratio)
      if (a.type === 'rural' && b.type === 'urban') return -1;
      if (a.type === 'urban' && b.type === 'rural') return 1;
      
      return 0;
    });
    
    setHospitalRequests(sortedRequests);
  };
  
  const loadInventoryData = () => {
    setInventoryData(sampleInventoryData);
  };
  
  const loadManufacturerRequests = async () => {
    if (!account) return;
    
    try {
      console.log('🔍 Loading distributor-to-manufacturer requests from blockchain...');
      setLoading(true);
      
      // First try to get blockchain requests
      let blockchainRequests = [];
      try {
        let requests;
        // Try using the context function first
        try {
          console.log('🧪 Trying to use getDistributorRequests from context...');
          if (typeof getDistributorRequests === 'function') {
            requests = await getDistributorRequests(account);
          } else {
            throw new Error('getDistributorRequests is not a function');
          }
        } catch (requestError) {
          // Fall back to direct contract call
          console.error('❌ Error using getDistributorRequests:', requestError);
          console.log('🧪 Falling back to direct contract method...');
          
          if (!contract) {
            console.log('⚠️ Contract not initialized, using mock data instead');
            // Use mock data if contract is not available
            requests = [];
            return;
          }
          
          // Check if the contract has the method
          if (contract.getDistributorRequests && typeof contract.getDistributorRequests === 'function') {
            console.log('📞 Calling contract.getDistributorRequests directly...');
            requests = await contract.getDistributorRequests(account);
          } else {
            console.error('❌ Contract does not have getDistributorRequests method');
            console.log('📊 Available contract methods:', contract ? Object.keys(contract).filter(k => typeof contract[k] === 'function') : 'None');
            // Use mock data as fallback
            requests = [];
          }
        }
        
        // Convert blockchain format to UI format
        blockchainRequests = requests.map(req => ({
          id: req.requestId,
          drugName: req.drugName,
          quantity: req.quantity,
          distributor: req.distributor,
          manufacturer: req.manufacturer,
          timestamp: req.timestamp * 1000, // Convert to JS timestamp
          status: ['pending', 'approved', 'rejected', 'fulfilled'][req.status],
          reason: req.reason,
          urgencyLevel: req.urgencyLevel,
          blockchain: true
        }));
        
        console.log('✅ Loaded blockchain requests:', blockchainRequests);
      } catch (error) {
        console.error('❌ Error loading blockchain requests:', error);
      }
      
      // Also load demo requests from localStorage for backward compatibility
      const demoRequests = JSON.parse(localStorage.getItem('manufacturerRequests') || '[]');
      
      // Merge blockchain and demo requests, prioritizing blockchain ones
      setManufacturerRequests([...blockchainRequests, ...demoRequests]);
      
    } catch (error) {
      console.error('❌ Error loading manufacturer requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /* These functions were moved to a different location */

  const acceptStock = async (qrArrival) => {
    try {
      setLoading(true);
      
      console.log('🔄 Processing QR arrival acceptance:', qrArrival);
      
      // Simulate real blockchain batch creation when accepting QR arrival
      if (createBatch) {
        try {
          console.log('🏭 Creating blockchain batch from QR arrival...');
          
          // Calculate expiry date (6 months from now for most drugs)
          const expiryDate = Math.floor(Date.now() / 1000) + (180 * 24 * 60 * 60);
          
          // Create actual blockchain batch
          const tx = await createBatch(
            qrArrival.drugName,
            qrArrival.quantity,
            expiryDate
          );
          
          console.log('✅ Blockchain batch created:', tx);
          
          // Update QR arrival status with real transaction hash
          setQrArrivals(prev => prev.map(item => 
            item.id === qrArrival.id 
              ? { 
                  ...item, 
                  status: 'accepted', 
                  acceptedAt: Date.now(),
                  batchCreated: true,
                  transactionHash: tx.hash || `0x${Math.random().toString(16).substr(2, 40)}`
                }
              : item
          ));

          // Refresh batches to show new inventory
          setTimeout(() => {
            loadDistributorBatches();
          }, 2000);

        } catch (blockchainError) {
          console.error('❌ Blockchain batch creation failed:', blockchainError);
          // Fall back to simulation if blockchain fails
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          setQrArrivals(prev => prev.map(item => 
            item.id === qrArrival.id 
              ? { 
                  ...item, 
                  status: 'accepted', 
                  acceptedAt: Date.now(),
                  batchCreated: false,
                  transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`
                }
              : item
          ));
        }
      } else {
        // Fallback simulation if createBatch not available
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setQrArrivals(prev => prev.map(item => 
          item.id === qrArrival.id 
            ? { 
                ...item, 
                status: 'accepted', 
                acceptedAt: Date.now(),
                batchCreated: false,
                transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`
              }
            : item
        ));
      }

      // Enhanced logging with more details
      const adminLog = {
        type: 'qr_stock_accepted',
        distributor: account,
        drugName: qrArrival.drugName,
        drugCode: qrArrival.drugCode || qrArrival.drugName.toLowerCase().replace(/\s+/g, '_'),
        quantity: qrArrival.quantity,
        manufacturer: qrArrival.manufacturer,
        qrCode: qrArrival.qrCode,
        timestamp: Date.now(),
        blockchainIntegrated: !!createBatch,
        transactionHash: qrArrival.transactionHash || `0x${Math.random().toString(16).substr(2, 40)}`
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
      existingLogs.unshift(adminLog);
      localStorage.setItem('adminActivityLogs', JSON.stringify(existingLogs));

      // Store accepted QR arrivals for persistence
      const acceptedArrivals = JSON.parse(localStorage.getItem('acceptedQRArrivals') || '[]');
      acceptedArrivals.unshift({
        ...qrArrival,
        acceptedAt: Date.now(),
        distributorAddress: account
      });
      localStorage.setItem('acceptedQRArrivals', JSON.stringify(acceptedArrivals));

      alert(`✅ Stock accepted successfully!\n\n📦 ${qrArrival.drugName}\n🔢 ${qrArrival.quantity} units\n🏭 From: ${qrArrival.manufacturer}\n${createBatch ? '⛓️ Blockchain batch created!' : '📝 Logged to system'}`);
      
    } catch (error) {
      console.error('❌ Error accepting stock:', error);
      alert('❌ Error accepting stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFromManufacturer = async (drugName, quantity, urgency = 'normal', reason = 'Inventory replenishment') => {
    try {
      setLoading(true);
      
      // Get manufacturer address from config
      const manufacturerAddress = SAMPLE_ACCOUNTS.manufacturer.address;
      
      console.log(`🔄 Requesting ${quantity} units of ${drugName} from manufacturer ${manufacturerAddress}`);
      console.log(`Urgency: ${urgency}, Reason: ${reason}`);
      
      // Default to mock mode, but try blockchain if available
      let usingMockMode = true;
      let transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      let tx = null;
      
      // Try blockchain transaction if contract is available
      if (contract && typeof contract.requestFromManufacturer === 'function') {
        try {
          console.log('🔗 Attempting blockchain transaction...');
          
          // Convert urgency to numeric value for contract
          const urgencyLevel = {'low': 0, 'normal': 1, 'high': 2, 'critical': 3}[urgency.toLowerCase()] || 1;
          
          // Call contract method
          tx = await contract.requestFromManufacturer(
            manufacturerAddress,
            drugName,
            quantity,
            reason,
            urgencyLevel
          );
          
          console.log('✅ Request transaction submitted:', tx);
          
          // Use real transaction hash
          transactionHash = tx.hash;
          usingMockMode = false;
          
          console.log('📝 Blockchain transaction hash:', transactionHash);
        } catch (blockchainError) {
          console.error('❌ Blockchain transaction failed, falling back to mock mode:', blockchainError);
          // Continue with mock mode
        }
      } else {
        console.log('ℹ️ Contract method not available, using mock mode');
      }
      
      // Create request object (either from blockchain tx or mock)
      const requestId = Date.now();
      const requestData = {
        id: requestId,
        drugName,
        quantity: parseInt(quantity),
        manufacturer: manufacturerAddress,
        distributor: account,
        timestamp: Date.now(),
        status: 'pending',
        reason,
        urgencyLevel: urgency,
        blockchain: !usingMockMode,
        transactionHash: transactionHash
      };
      
      console.log('📋 Created request:', requestData);
      
      // Store the request in localStorage for persistence
      const existingRequests = JSON.parse(localStorage.getItem('manufacturerRequests') || '[]');
      existingRequests.unshift(requestData);
      localStorage.setItem('manufacturerRequests', JSON.stringify(existingRequests));
      
      // Add to state
      setManufacturerRequests(prev => [requestData, ...prev]);
      
      // Log transaction details
      console.log('📝 Transaction hash:', transactionHash);

      // Log to admin dashboard for visibility
      const adminLog = {
        type: 'manufacturer_request',
        distributor: account,
        drugName,
        quantity,
        timestamp: Date.now(),
        transactionHash: transactionHash,
        blockchainIntegrated: true
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
      existingLogs.unshift(adminLog);
      localStorage.setItem('adminActivityLogs', JSON.stringify(existingLogs));

      // Show success message with transaction details
      const mockWarning = usingMockMode ? "\n\n⚠️ NOTE: Using mock mode due to blockchain connectivity issues." : "";
      
      alert(`✅ Request sent to manufacturer${usingMockMode ? " (simulated)" : " via blockchain"}!
      
Drug: ${drugName}
Quantity: ${quantity} units
Urgency: ${urgency}
Reason: ${reason}
Transaction: ${transactionHash.slice(0, 10)}...${transactionHash.slice(-6)}
      
Your request has been recorded${usingMockMode ? " locally" : " on the blockchain"} and is awaiting manufacturer approval.${mockWarning}`);
      
      // Refresh requests after a short delay to get updated blockchain data
      setTimeout(() => loadManufacturerRequests(), 3000);
      
    } catch (error) {
      console.error('❌ Error requesting from manufacturer:', error);
      
      // Ensure manufacturer address is defined even in error case
      const fallbackManufacturerAddress = SAMPLE_ACCOUNTS.manufacturer.address;
      
      // Create a fallback request even in case of error to ensure UI functionality
      const fallbackHash = `0x${Math.random().toString(16).substr(2, 40)}`;
      const fallbackRequest = {
        id: `fallback-${Date.now()}`,
        drugName: drugName,
        quantity: quantity,
        manufacturer: fallbackManufacturerAddress,
        distributor: account,
        timestamp: Date.now(),
        status: 'pending',
        reason: reason || 'Inventory replenishment',
        urgencyLevel: urgency || 'normal',
        blockchain: false,
        transactionHash: fallbackHash,
        fallback: true
      };
      
      // Update UI with fallback request
      setManufacturerRequests(prev => [fallbackRequest, ...prev]);
      
      alert(`⚠️ There was an issue with the blockchain transaction, but your request has been saved locally.
      
Error: ${error.message}

Drug: ${drugName}
Quantity: ${quantity} units
Reference ID: ${fallbackHash.slice(0, 10)}...${fallbackHash.slice(-6)}`);
    } finally {
      setLoading(false);
    }
  };

  const fulfillHospitalRequest = async (request) => {
    try {
      setLoading(true);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove fulfilled request
      setHospitalRequests(prev => prev.filter(r => r.id !== request.id));

      // Log to admin dashboard
      const adminLog = {
        type: 'hospital_request_fulfilled',
        distributor: account,
        hospital: request.hospitalName,
        drugName: request.drugName,
        quantity: request.quantity,
        timestamp: Date.now(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
      existingLogs.unshift(adminLog);
      localStorage.setItem('adminActivityLogs', JSON.stringify(existingLogs));

      alert('Hospital request fulfilled!');
    } catch (error) {
      console.error('Error fulfilling hospital request:', error);
      alert('Error fulfilling hospital request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadDistributorBatches = async () => {
    if (!account) return;

    try {
      setLoading(true);
      console.log('🔍 Loading distributor batches for account:', account);
      const distributorBatches = await getDistributorBatches(account);
      console.log('✅ Distributor batches loaded:', distributorBatches);
      setBatches(distributorBatches);
    } catch (error) {
      console.error('❌ Error loading distributor batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = (batch) => {
    setTransferModal({
      isOpen: true,
      batch: batch,
      selectedHospital: ''
    });
  };

  const closeTransferModal = () => {
    setTransferModal({
      isOpen: false,
      batch: null,
      selectedHospital: ''
    });
  };

  const handleTransfer = async () => {
    if (!transferModal.selectedHospital) {
      alert('Please select a hospital');
      return;
    }

    try {
      setLoading(true);
      await transferToHospital(transferModal.batch.id, transferModal.selectedHospital);
      closeTransferModal();
      await loadDistributorBatches();
      alert('Batch transferred successfully!');
    } catch (error) {
      console.error('❌ Error transferring batch:', error);
      alert('Error transferring batch: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getBatchStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Available';
      case 1: return 'In Transit';
      case 2: return 'Delivered';
      default: return 'Unknown';
    }
  };

  // Hospital Requests Export and Filtering Functions
  const exportHospitalRequestsReport = (format = 'csv') => {
    const filteredRequests = getFilteredHospitalRequests();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    if (format === 'csv') {
      const csvContent = [
        // Header
        'Hospital Name,Location,Type,Drug Name,Quantity,Urgency,Distance (km),Request Time,Priority Rank',
        // Data rows
        ...filteredRequests.map((request, index) => 
          `"${request.hospitalName}","${request.location}","${request.type}","${request.drugName}",${request.quantity},"${request.urgency}",${request.distance},"${new Date(request.timestamp).toLocaleString()}",${index + 1}`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `hospital-requests-report-${timestamp}.csv`;
      link.click();
      
    } else if (format === 'json') {
      const jsonContent = JSON.stringify({
        generatedAt: new Date().toISOString(),
        filters: hospitalFilter,
        totalRequests: filteredRequests.length,
        data: filteredRequests.map((request, index) => ({
          ...request,
          priorityRank: index + 1,
          requestTime: new Date(request.timestamp).toISOString()
        }))
      }, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `hospital-requests-report-${timestamp}.json`;
      link.click();
    }
    
    alert(`📊 ${format.toUpperCase()} report exported successfully!\n\n📁 ${filteredRequests.length} requests included\n🕒 Generated: ${new Date().toLocaleString()}`);
  };

  const getFilteredHospitalRequests = () => {
    let filtered = [...hospitalRequests];
    
    // Apply urgency filter
    if (hospitalFilter.urgency !== 'All') {
      filtered = filtered.filter(request => request.urgency === hospitalFilter.urgency);
    }
    
    // Apply type filter (Rural/Urban)
    if (hospitalFilter.type !== 'All') {
      filtered = filtered.filter(request => request.type === hospitalFilter.type);
    }
    
    // Apply drug filter
    if (hospitalFilter.drug !== 'All Medicines') {
      filtered = filtered.filter(request => request.drugName === hospitalFilter.drug);
    }
    
    // Apply date range filter
    if (hospitalFilter.dateRange !== 'All Time') {
      const now = Date.now();
      let timeLimit;
      
      switch (hospitalFilter.dateRange) {
        case 'Last Hour':
          timeLimit = now - (60 * 60 * 1000);
          break;
        case 'Last 24 Hours':
          timeLimit = now - (24 * 60 * 60 * 1000);
          break;
        case 'Last 7 Days':
          timeLimit = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case 'Last 30 Days':
          timeLimit = now - (30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeLimit = 0;
      }
      
      filtered = filtered.filter(request => request.timestamp >= timeLimit);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (hospitalFilter.sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'timestamp':
          return b.timestamp - a.timestamp; // Newest first
        case 'priority':
        default:
          // Priority logic: urgency first, then rural/urban ratio, then distance
          if (a.urgency !== b.urgency) {
            const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          }
          if (a.type === 'rural' && b.type === 'urban') return -1;
          if (a.type === 'urban' && b.type === 'rural') return 1;
          return a.distance - b.distance;
      }
    });
    
    return filtered;
  };

  const clearFiltersHospitalRequests = () => {
    setHospitalFilter({
      urgency: 'All',
      type: 'All',
      drug: 'All Medicines',
      dateRange: 'All Time',
      sortBy: 'priority'
    });
  };

  // Sample hospitals for transfer
  const hospitals = [
    { address: SAMPLE_ACCOUNTS.hospital.address, name: 'Central Hospital' },
    { address: '0x8ba1f109551bD432803012645Hac136c300cc22d', name: 'Regional Medical Center' },
    { address: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', name: 'City General Hospital' }
  ];

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
                  <h1 className="text-4xl font-bold text-white mb-2">🚚 {t.distributor.title}</h1>
                  <p className="text-lg text-white/80 mb-4">
                    {t.distributor.description}
                  </p>
                  {account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        {t.common.connected}: {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                      <RoleStatus />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <BackButton />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{t.distributor.role}</div>
                    <div className="text-white/70">{t.distributor.roleDescription}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'inventory' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📦 {t.distributor.inventory}
            </button>
            <button
              onClick={() => setActiveTab('qr-arrivals')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'qr-arrivals' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📱 {t.distributor.qrArrivals}
            </button>
            <button
              onClick={() => setActiveTab('hospital-requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'hospital-requests' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🏥 {t.distributor.hospitalRequests}
            </button>
            <button
              onClick={() => setActiveTab('manufacturer-requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'manufacturer-requests' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🏭 {t.distributor.manufacturerRequests}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📊 {t.distributor.analytics}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'inventory' && (
            <InventoryManagement />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

        {/* Hospital Requests Tab */}
        {activeTab === 'hospital-requests' && (
          <div className="space-y-6">
            <GlowingCard glowColor="#ef4444" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                {t.distributor.hospitalRequests}
              </h2>
              
              <div className="mb-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h3 className="text-white font-semibold mb-2">🏥 Priority Logic (2:1 Rural:Urban)</h3>
                <p className="text-white/80 text-sm">
                  Requests are prioritized by urgency first, then by rural/urban ratio (2 rural for every 1 urban), 
                  then by distance (closer hospitals first).
                </p>
              </div>

              {/* Smart Restock Alert System - Filters and Export */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <span className="mr-2">🔍</span>
                    Smart Restock Alert System - Incoming Requests
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportHospitalRequestsReport('csv')}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-semibold flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                    <button
                      onClick={() => exportHospitalRequestsReport('json')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-semibold flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export JSON
                    </button>
                  </div>
                </div>
                
                {/* Filter Controls */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  {/* Urgency Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1">Urgency</label>
                    <select
                      value={hospitalFilter.urgency}
                      onChange={(e) => setHospitalFilter(prev => ({ ...prev, urgency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm backdrop-blur-sm"
                    >
                      <option value="All">All Urgency</option>
                      <option value="high">🔥 High</option>
                      <option value="medium">⚡ Medium</option>
                      <option value="low">📋 Low</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1">Hospital Type</label>
                    <select
                      value={hospitalFilter.type}
                      onChange={(e) => setHospitalFilter(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm backdrop-blur-sm"
                    >
                      <option value="All">All Types</option>
                      <option value="rural">🏘️ Rural</option>
                      <option value="urban">🏙️ Urban</option>
                    </select>
                  </div>

                  {/* Drug Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1">Drug</label>
                    <select
                      value={hospitalFilter.drug}
                      onChange={(e) => setHospitalFilter(prev => ({ ...prev, drug: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm backdrop-blur-sm"
                    >
                      <option value="All Medicines">All Medicines</option>
                      {medicines.map((medicine, index) => (
                        <option key={index} value={medicine}>{medicine}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1">Time Range</label>
                    <select
                      value={hospitalFilter.dateRange}
                      onChange={(e) => setHospitalFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm backdrop-blur-sm"
                    >
                      <option value="All Time">All Time</option>
                      <option value="Last Hour">Last Hour</option>
                      <option value="Last 24 Hours">Last 24 Hours</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="Last 30 Days">Last 30 Days</option>
                    </select>
                  </div>

                  {/* Sort By Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1">Sort By</label>
                    <select
                      value={hospitalFilter.sortBy}
                      onChange={(e) => setHospitalFilter(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm backdrop-blur-sm"
                    >
                      <option value="priority">🎯 Priority</option>
                      <option value="distance">📍 Distance</option>
                      <option value="timestamp">🕒 Time</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFiltersHospitalRequests}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-sm font-semibold"
                    >
                      🗑️ Clear Filters
                    </button>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="flex justify-between items-center text-sm text-white/80">
                  <span>
                    Showing {getFilteredHospitalRequests().length} of {hospitalRequests.length} requests
                  </span>
                  <span>
                    Filters Applied: {Object.values(hospitalFilter).filter(v => v !== 'All' && v !== 'All Medicines' && v !== 'All Time' && v !== 'priority').length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {getFilteredHospitalRequests().length > 0 ? (
                  getFilteredHospitalRequests().map((request, index) => (
                    <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-bold text-white text-lg">{request.hospitalName}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              request.type === 'rural' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {request.type === 'rural' ? '🏘️ Rural' : '🏙️ Urban'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency.toUpperCase()} {request.urgency === 'high' ? '🔥' : request.urgency === 'medium' ? '⚡' : '📋'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <p className="text-white/70 text-sm font-semibold">{t.distributor.hospital}</p>
                              <p className="text-white">{request.hospitalName}</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">{t.distributor.quantity}</p>
                              <p className="text-white font-bold">{request.quantity} units</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Drug</p>
                              <p className="text-white">{request.drugName}</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">{t.distributor.distance}</p>
                              <p className="text-white">{request.distance} km</p>
                            </div>
                          </div>
                          <p className="text-white/50 text-xs">
                            {t.distributor.timestamp}: {new Date(request.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-white/60 text-sm">Priority #{index + 1}</span>
                          <button
                            onClick={() => fulfillHospitalRequest(request)}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                                Fulfilling...
                              </div>
                            ) : (
                              `✅ ${t.distributor.fulfillRequest}`
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-4xl mb-4">🏥</div>
                    {hospitalRequests.length === 0 ? (
                      <>
                        <p className="text-white/60">{t.distributor.noHospitalRequests}</p>
                        <p className="text-white/40 text-sm mt-2">{t.distributor.noHospitalRequestsDescription}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-white/60">No requests match the current filters</p>
                        <p className="text-white/40 text-sm mt-2">Try adjusting your filter criteria or clear all filters</p>
                        <button
                          onClick={clearFiltersHospitalRequests}
                          className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm font-semibold"
                        >
                          🗑️ Clear All Filters
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </GlowingCard>
          </div>
        )}

        {/* Manufacturer Requests Tab */}
        {activeTab === 'manufacturer-requests' && (
          <div className="space-y-6">
            <GlowingCard glowColor="#f59e0b" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {t.distributor.manufacturerRequests}
              </h2>
              
              {/* Request Form */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-white font-semibold mb-4">🏭 Request Stock from Manufacturer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      {t.distributor.drugName}
                    </label>
                    <select
                      value={selectedMedicine}
                      onChange={(e) => setSelectedMedicine(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white backdrop-blur-sm"
                    >
                      <option value="All Medicines">Select Medicine</option>
                      {medicines.map((medicine, index) => (
                        <option key={index} value={medicine}>{medicine}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      {t.distributor.quantity}
                    </label>
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white backdrop-blur-sm"
                      id="requestQuantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Urgency Level
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white backdrop-blur-sm"
                      id="requestUrgency"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Reason
                    </label>
                    <input
                      type="text"
                      placeholder="Reason for request"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white backdrop-blur-sm"
                      id="requestReason"
                      defaultValue="Inventory replenishment"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const quantity = document.getElementById('requestQuantity').value;
                        const urgency = document.getElementById('requestUrgency')?.value || 'normal';
                        const reason = document.getElementById('requestReason')?.value || 'Inventory replenishment';
                        
                        if (selectedMedicine !== 'All Medicines' && quantity) {
                          handleRequestFromManufacturer(
                            selectedMedicine, 
                            parseInt(quantity), 
                            urgency, 
                            reason
                          );
                          document.getElementById('requestQuantity').value = '';
                          if (document.getElementById('requestReason')) document.getElementById('requestReason').value = '';
                        } else {
                          alert('Please select a medicine and enter quantity');
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 font-semibold transition-all duration-300"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                          Sending Request...
                        </div>
                      ) : (
                        ` ${t.distributor.requestStock}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Request History */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-4"> Request History</h3>
                {manufacturerRequests.length > 0 ? (
                  manufacturerRequests.map((request) => (
                    <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-2">{request.drugName}</h4>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <p className="text-white/70 text-sm font-semibold">{t.distributor.quantity}</p>
                              <p className="text-white font-bold">{request.quantity} units</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">{t.distributor.status}</p>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {request.status === 'pending' ? '⏳ Pending' : '✅ Approved'}
                              </span>
                            </div>
                          </div>
                          <p className="text-white/50 text-xs">
                            {t.distributor.timestamp}: {new Date(request.timestamp).toLocaleString()}
                          </p>
                          {request.transactionHash && (
                            <p className="text-white/50 text-xs font-mono mt-1">
                              TX: {request.transactionHash.slice(0, 10)}...{request.transactionHash.slice(-8)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-4xl mb-4">🏭</div>
                    <p className="text-white/60">{t.distributor.noManufacturerRequests}</p>
                    <p className="text-white/40 text-sm mt-2">{t.distributor.noManufacturerRequestsDescription}</p>
                  </div>
                )}
              </div>
            </GlowingCard>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Inventory Status Overview */}
            <GlowingCard glowColor="#8b5cf6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Inventory Status - Last 90 Days
              </h2>
              
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex space-x-4">
                  <select
                    value={selectedMedicine}
                    onChange={(e) => setSelectedMedicine(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm"
                  >
                    <option value="All Medicines">All Medicines</option>
                    {medicines.map((medicine, index) => (
                      <option key={index} value={medicine}>{medicine}</option>
                    ))}
                  </select>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm"
                  >
                    <option value="Day">Day</option>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                     Download PDF Report
                  </button>
                </div>

                {/* Inventory Status Bars */}
                <div className="space-y-4">
                  {inventoryData.map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-semibold">{item.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Stock Level Visualization */}
                      <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            item.status === 'optimal' ? 'bg-green-500' : 
                            item.status === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(item.stock / Math.max(item.stock, item.demand)) * 100}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {item.stock} / {Math.max(item.stock, item.demand)} units
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-white/70">Stock:</span>
                          <span className="text-white ml-2">{item.stock} units</span>
                        </div>
                        <div>
                          <span className="text-white/70">Demand:</span>
                          <span className="text-white ml-2">{item.demand} units</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlowingCard>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cold Chain */}
              <GlowingCard glowColor="#06b6d4" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                   Cold Chain
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Temperature:</span>
                    <span className="text-green-400">2-8°C ✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Humidity:</span>
                    <span className="text-green-400">45% ✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Status:</span>
                    <span className="text-green-400">Optimal</span>
                  </div>
                </div>
              </GlowingCard>

              {/* Compliance */}
              <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  ✔ Compliance
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Regulatory:</span>
                    <span className="text-green-400">Compliant ✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Audit Score:</span>
                    <span className="text-green-400">98%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Last Check:</span>
                    <span className="text-white">2 days ago</span>
                  </div>
                </div>
              </GlowingCard>

              {/* Delivery Network */}
              <GlowingCard glowColor="#f59e0b" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                   Delivery Network
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Active Routes:</span>
                    <span className="text-white">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">On-Time Rate:</span>
                    <span className="text-green-400">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Avg Delivery:</span>
                    <span className="text-white">2.3 days</span>
                  </div>
                </div>
              </GlowingCard>
            </div>

            {/* Live Blockchain Feed */}
            <GlowingCard glowColor="#6366f1" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                Live Blockchain Feed
              </h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  { action: "Paracetamol 500mg delivery confirmed", time: "Just now", icon: "📦" },
                  { action: "Insulin Glargine stock level updated", time: "Just now", icon: "📊" },
                  { action: "Amoxicillin 250mg quality verification completed", time: "2m ago", icon: "✅" },
                  { action: "Covishield Vaccine supply request submitted", time: "5m ago", icon: "🔄" },
                  { action: "Azithromycin 500mg inventory count verified", time: "15m ago", icon: "📋" }
                ].map((feed, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-lg">{feed.icon}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{feed.action}</p>
                    </div>
                    <span className="text-white/50 text-xs">{feed.time}</span>
                  </div>
                ))}
              </div>
            </GlowingCard>
          </div>
        )}

        {/* QR Arrivals Tab */}
        {activeTab === 'qr-arrivals' && (
          <div className="space-y-6">
            <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                    </svg>
                  </div>
                  📱 QR Stock Arrivals ({qrArrivals.length})
                </h2>
                
                <button
                  onClick={simulateQRScan}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center"
                >
                  📱 Simulate QR Scan
                </button>
              </div>
              
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 text-2xl font-bold">
                    {qrArrivals.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-white/70 text-sm">Pending</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-green-400 text-2xl font-bold">
                    {qrArrivals.filter(a => a.status === 'accepted').length}
                  </div>
                  <div className="text-white/70 text-sm">Accepted</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-red-400 text-2xl font-bold">
                    {qrArrivals.filter(a => a.status === 'rejected').length}
                  </div>
                  <div className="text-white/70 text-sm">Rejected</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {qrArrivals.length > 0 ? (
                  qrArrivals.map((arrival) => (
                    <div key={arrival.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-bold text-white text-lg mr-3">{arrival.drugName}</h4>
                            {arrival.requiresColdChain && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                ❄️ Cold Chain
                              </span>
                            )}
                            {arrival.priority === 'high' && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold ml-2">
                                🚨 High Priority
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Quantity</p>
                              <p className="text-white text-lg font-bold">{arrival.quantity} units</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Manufacturer</p>
                              <p className="text-white">{arrival.manufacturer}</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Batch Number</p>
                              <p className="text-white font-mono text-sm">{arrival.batchNumber}</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Drug Code</p>
                              <p className="text-white font-mono text-sm">{arrival.drugCode}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Manufacturing Date</p>
                              <p className="text-white text-sm">{new Date(arrival.manufactureDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-white/70 text-sm font-semibold">Expiry Date</p>
                              <p className="text-white text-sm">{new Date(arrival.expiryDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-white/70 text-sm font-semibold">Storage Conditions</p>
                            <p className="text-white text-sm">{arrival.storageConditions}</p>
                          </div>
                          
                          <p className="text-white/50 text-xs">
                            Received: {new Date(arrival.timestamp).toLocaleString()}
                            {arrival.acceptedAt && (
                              <span className="ml-4">
                                ✅ Accepted: {new Date(arrival.acceptedAt).toLocaleString()}
                              </span>
                            )}
                            {arrival.rejectedAt && (
                              <span className="ml-4">
                                ❌ Rejected: {new Date(arrival.rejectedAt).toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <span className={`px-3 py-2 text-sm font-semibold rounded-full ${
                            arrival.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            arrival.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {arrival.status === 'accepted' ? '✅ Accepted' : 
                             arrival.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                          </span>
                          
                          {arrival.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => acceptStock(arrival)}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                              >
                                {loading ? (
                                  <div className="flex items-center">
                                    <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                                    Accepting...
                                  </div>
                                ) : (
                                  '✅ Accept'
                                )}
                              </button>
                              
                              <button
                                onClick={() => rejectStock(arrival)}
                                disabled={loading}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                          
                          {arrival.transactionHash && (
                            <div className="text-white/60 text-xs font-mono">
                              TX: {arrival.transactionHash.slice(0, 10)}...
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* QR Code Display */}
                      <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="text-white font-semibold mb-2">📱 QR Code & Verification</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-white/70">Regulatory Status:</p>
                                <p className="text-green-400 font-semibold">{arrival.regulatoryApproval}</p>
                              </div>
                              <div>
                                <p className="text-white/70">WHO Approved:</p>
                                <p className={arrival.whoApproved ? "text-green-400" : "text-red-400"}>
                                  {arrival.whoApproved ? "✅ Yes" : "❌ No"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <SimpleQRCode value={arrival.qrCode} size={100} />
                            <div className="text-white/60 text-xs mt-2">
                              {(() => {
                                try {
                                  const qrData = JSON.parse(arrival.qrCode);
                                  return qrData.id || arrival.qrCode;
                                } catch {
                                  return arrival.qrCode;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-4xl mb-4">📱</div>
                    <p className="text-white/60">No QR arrivals yet</p>
                    <p className="text-white/40 text-sm mt-2">Scan QR codes or wait for manufacturer shipments</p>
                    <button
                      onClick={simulateQRScan}
                      className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      📱 Simulate First QR Scan
                    </button>
                  </div>
                )}
              </div>
            </GlowingCard>
          </div>
        )}



          {/* Transfer Modal */}
          {transferModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Transfer Batch #{transferModal.batch?.id}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Select Hospital
                    </label>
                    <select
                      value={transferModal.selectedHospital}
                      onChange={(e) => setTransferModal({...transferModal, selectedHospital: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white backdrop-blur-sm"
                    >
                      <option value="">Choose a hospital...</option>
                      {hospitals.map((hospital, index) => (
                        <option key={index} value={hospital.address}>
                          {hospital.name} ({hospital.address.slice(0, 6)}...{hospital.address.slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleTransfer}
                      disabled={loading || !transferModal.selectedHospital}
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
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;
