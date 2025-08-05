import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import MagicLoader from '../components/MagicLoader';
import { SAMPLE_ACCOUNTS } from '../config/contracts';
import { RoleStatus } from '../components/RoleProtection';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import BackButton from '../components/BackButton';
import QRCodeDisplay from '../components/QRCodeDisplay';
import SimpleQRCode from '../components/SimpleQRCode';
import GoogleMapsLike from '../components/GoogleMapsLike';
import QRCodeGenerator from '../components/QRCodeGenerator';

const HospitalDashboard = () => {
  const { account } = useWallet();
  const { getHospitalBatches, dispenseToPatient, userRole } = useContract();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [activityLogs, setActivityLogs] = useState([]);
  const [qrArrivals, setQrArrivals] = useState([]);
  const [lowStockRequests, setLowStockRequests] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [dispensingToPatient, setDispensingToPatient] = useState({
    isOpen: false,
    medication: null,
    patient: '',
    quantity: 1,
    reason: ''
  });
  const [dispenseModal, setDispenseModal] = useState({
    isOpen: false,
    batch: null,
    selectedPatient: ''
  });
  const [showDistributorMap, setShowDistributorMap] = useState(false);
  const [selectedLowStockItem, setSelectedLowStockItem] = useState(null);

  // Demo account support for development
  const currentAccountAddress = account?.address || SAMPLE_ACCOUNTS.hospital.address;

  // Sample medications available for dispensing
  const [availableMedications] = useState([
    {
      id: 'med-001',
      drugName: 'Paracetamol 500mg',
      quantity: 250,
      manufacturer: 'Apollo Pharmaceuticals',
      status: 2,
      expiryDate: Math.floor((Date.now() + (365 * 86400000)) / 1000), // 1 year from now
      batchNumber: 'PARA2025001',
      storageTemp: 'Room Temperature (15-25°C)'
    },
    {
      id: 'med-002', 
      drugName: 'Insulin Glargine 100IU/ml',
      quantity: 85,
      manufacturer: 'Novo Nordisk',
      status: 2,
      expiryDate: Math.floor((Date.now() + (180 * 86400000)) / 1000), // 6 months from now
      batchNumber: 'INSU2025002',
      storageTemp: 'Refrigerated (2-8°C)',
      requiresColdChain: true
    },
    {
      id: 'med-003',
      drugName: 'Amoxicillin 250mg',
      quantity: 180,
      manufacturer: 'GSK Pharmaceuticals',
      status: 2,
      expiryDate: Math.floor((Date.now() + (730 * 86400000)) / 1000), // 2 years from now
      batchNumber: 'AMOX2025003',
      storageTemp: 'Room Temperature (Below 30°C)'
    },
    {
      id: 'med-004',
      drugName: 'Metformin 500mg',
      quantity: 320,
      manufacturer: 'Cipla Ltd',
      status: 2,
      expiryDate: Math.floor((Date.now() + (550 * 86400000)) / 1000), // 18 months from now
      batchNumber: 'METF2025004',
      storageTemp: 'Room Temperature (15-30°C)'
    },
    {
      id: 'med-005',
      drugName: 'Aspirin 75mg',
      quantity: 450,
      manufacturer: 'Bayer Healthcare',
      status: 2,
      expiryDate: Math.floor((Date.now() + (900 * 86400000)) / 1000), // 2.5 years from now
      batchNumber: 'ASPR2025005',
      storageTemp: 'Room Temperature (Below 25°C)'
    }
  ]);

  // Sample patients for dispensing
  const [patients] = useState([
    {
      name: 'Rajesh Kumar',
      address: SAMPLE_ACCOUNTS.patients[0].address,
      patientId: 'P001',
      age: 45,
      condition: 'Diabetes Type 2'
    },
    {
      name: 'Priya Sharma',
      address: SAMPLE_ACCOUNTS.patients[1].address,
      patientId: 'P002', 
      age: 32,
      condition: 'Hypertension'
    },
    {
      name: 'Mohammed Ali',
      address: SAMPLE_ACCOUNTS.patients[2].address,
      patientId: 'P003',
      age: 28,
      condition: 'Bacterial Infection'
    },
    {
      name: 'Sunita Reddy',
      address: SAMPLE_ACCOUNTS.patients[3].address,
      patientId: 'P004',
      age: 55,
      condition: 'Cardiac Care'
    },
    {
      name: 'Arjun Patel',
      address: SAMPLE_ACCOUNTS.patients[4].address,
      patientId: 'P005',
      age: 38,
      condition: 'Pain Management'
    }
  ]);

  useEffect(() => {
    if (account) {
      loadHospitalBatches();
      loadActivityLogs();
      loadQrArrivals();
      loadLowStockRequests();
    }
  }, [account]);

  // Function to load hospital batches
  const loadHospitalBatches = async () => {
    if (!account || !account.address) {
      console.warn("Account not available, cannot load hospital batches.");
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Loading hospital batches for account:', account.address);
      const hospitalBatches = await getHospitalBatches(account.address);
      console.log('✅ Hospital batches loaded:', hospitalBatches);
      setBatches(hospitalBatches);
    } catch (error) {
      console.error('❌ Error loading hospital batches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to load activity logs from localStorage
  const loadActivityLogs = () => {
    const logs = JSON.parse(localStorage.getItem('hospitalActivityLogs') || '[]');
    setActivityLogs(logs);
  };

  // Add new activity log
  const addActivityLog = (action, details) => {
    // Use demo account if no wallet connected
    const currentAccountAddress = account?.address || demoAccount.address;
    
    if (!currentAccountAddress) {
      console.warn("Cannot add activity log: account not available");
      return;
    }
    
    const newLog = {
      id: Date.now(),
      timestamp: Date.now(),
      action,
      details,
      userAddress: currentAccountAddress
    };
    
    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);
    localStorage.setItem('hospitalActivityLogs', JSON.stringify(updatedLogs));
  };

  // Function to load QR arrivals from localStorage
  const loadQrArrivals = () => {
    // Sample QR arrivals - in a real app, these would come from blockchain/backend
    const sampleQrArrivals = [
      {
        id: 'qr-1001',
        drugName: 'Paracetamol 500mg',
        drugCode: 'PARA500-2025',
        quantity: 300,
        distributor: 'MedSupply Chain Ltd.',
        distributorAddress: SAMPLE_ACCOUNTS.distributor.address,
        qrCode: JSON.stringify({
          id: 'QR_PARA_1001_2025_08_04',
          drug: 'Paracetamol 500mg',
          batch: 'MS2025080401',
          dist: 'MedSupply Chain Ltd.',
          qty: 300,
          exp: new Date(Date.now() + (365 * 86400000)).toISOString().split('T')[0]
        }),
        batchNumber: 'MS2025080401',
        expiryDate: Date.now() + (365 * 86400000), // 1 year from now
        timestamp: Date.now() - 7200000, // 2 hours ago
        status: 'pending',
        regulatoryApproval: 'FDA-APPROVED-2024',
        storageConditions: 'Store below 25°C in a dry place',
      },
      {
        id: 'qr-1002',
        drugName: 'Insulin Glargine 100IU/ml',
        drugCode: 'INSU100-2025',
        quantity: 100,
        distributor: 'ColdChain Pharmaceuticals',
        distributorAddress: SAMPLE_ACCOUNTS.distributor.address,
        qrCode: JSON.stringify({
          id: 'QR_INSU_1002_2025_08_04',
          drug: 'Insulin Glargine 100IU/ml',
          batch: 'CC2025080402',
          dist: 'ColdChain Pharmaceuticals',
          qty: 100,
          exp: new Date(Date.now() + (180 * 86400000)).toISOString().split('T')[0],
          cold: true
        }),
        batchNumber: 'CC2025080402',
        expiryDate: Date.now() + (180 * 86400000), // 6 months from now
        timestamp: Date.now() - 3600000, // 1 hour ago
        status: 'pending',
        regulatoryApproval: 'FDA-APPROVED-2024',
        storageConditions: 'Refrigerate 2-8°C, do not freeze',
        requiresColdChain: true
      },
      {
        id: 'qr-1003',
        drugName: 'Amoxicillin 250mg',
        drugCode: 'AMOX250-2025',
        quantity: 500,
        distributor: 'PharmaDist Networks',
        distributorAddress: SAMPLE_ACCOUNTS.distributor.address,
        qrCode: JSON.stringify({
          id: 'QR_AMOX_1003_2025_08_04',
          drug: 'Amoxicillin 250mg',
          batch: 'PD2025080403',
          dist: 'PharmaDist Networks',
          qty: 500,
          exp: new Date(Date.now() + (730 * 86400000)).toISOString().split('T')[0]
        }),
        batchNumber: 'PD2025080403',
        expiryDate: Date.now() + (730 * 86400000), // 2 years from now
        timestamp: Date.now() - 1800000, // 30 minutes ago
        status: 'pending',
        regulatoryApproval: 'FDA-APPROVED-2024',
        storageConditions: 'Store below 30°C, protect from moisture',
      }
    ];
    
    // Load persisted QR arrivals and merge with sample data
    const persistedArrivals = JSON.parse(localStorage.getItem('hospitalQRArrivals') || '[]');
    const acceptedArrivals = JSON.parse(localStorage.getItem('acceptedHospitalQRArrivals') || '[]');
    
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

  // Function to load low stock requests
  const loadLowStockRequests = () => {
    // Hyderabad-based distributors with geographic locations
    const hyderabadDistributors = [
      {
        id: 1,
        name: 'Apollo Pharmacy Distribution Hub',
        address: SAMPLE_ACCOUNTS.distributor.address,
        location: 'Jubilee Hills, Hyderabad',
        coordinates: { lat: 17.4326, lng: 78.4071 },
        distance: 2.8, // km
        estimatedDelivery: '1.5 hours',
        available: true,
        rating: 4.9,
        specialization: 'Multi-specialty medications',
        inventory: {
          'Paracetamol 500mg': 8000,
          'Amoxicillin 250mg': 4500,
          'Insulin Glargine 100IU/ml': 1200,
          'Metformin 500mg': 3500,
          'Aspirin 75mg': 6000
        },
        pricing: {
          'Paracetamol 500mg': 0.12, // per unit
          'Amoxicillin 250mg': 0.38,
          'Insulin Glargine 100IU/ml': 11.25,
          'Metformin 500mg': 0.28,
          'Aspirin 75mg': 0.08
        },
        advantages: ['24/7 service', 'Premium quality', 'Fast delivery']
      },
      {
        id: 2,
        name: 'Mediplus Pharma Networks',
        address: '0x8ba1f109551bD432803012645Hac136c300cc22d',
        location: 'Banjara Hills, Hyderabad',
        coordinates: { lat: 17.4065, lng: 78.4691 },
        distance: 4.2, // km
        estimatedDelivery: '2 hours',
        available: true,
        rating: 4.7,
        specialization: 'Bulk pharmaceutical supply',
        inventory: {
          'Paracetamol 500mg': 5500,
          'Amoxicillin 250mg': 3200,
          'Insulin Glargine 100IU/ml': 800,
          'Metformin 500mg': 2800,
          'Aspirin 75mg': 4200
        },
        pricing: {
          'Paracetamol 500mg': 0.10, // Best price for Paracetamol
          'Amoxicillin 250mg': 0.42,
          'Insulin Glargine 100IU/ml': 12.80,
          'Metformin 500mg': 0.25, // Best price for Metformin
          'Aspirin 75mg': 0.09
        },
        advantages: ['Competitive pricing', 'Bulk discounts', 'Reliable supply']
      },
      {
        id: 3,
        name: 'ColdChain MedSupply Hyderabad',
        address: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
        location: 'Hi-Tech City, Hyderabad',
        coordinates: { lat: 17.4475, lng: 78.3563 },
        distance: 6.1, // km
        estimatedDelivery: '2.5 hours',
        available: true,
        rating: 4.8,
        specialization: 'Cold chain & temperature-sensitive medications',
        inventory: {
          'Paracetamol 500mg': 7200,
          'Amoxicillin 250mg': 5100,
          'Insulin Glargine 100IU/ml': 1800, // Best for insulin
          'Metformin 500mg': 4100,
          'Aspirin 75mg': 5800
        },
        pricing: {
          'Paracetamol 500mg': 0.15,
          'Amoxicillin 250mg': 0.36,
          'Insulin Glargine 100IU/ml': 10.95, // Best price for insulin
          'Metformin 500mg': 0.30,
          'Aspirin 75mg': 0.07 // Best price for aspirin
        },
        advantages: ['Cold chain expertise', 'Temperature monitoring', 'Insulin specialists']
      },
      {
        id: 4,
        name: 'Hetero Drugs Distribution',
        address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
        location: 'HITEC City, Hyderabad', 
        coordinates: { lat: 17.4435, lng: 78.3772 },
        distance: 5.8, // km
        estimatedDelivery: '2.5 hours',
        available: true,
        rating: 4.6,
        specialization: 'Generic medications & antibiotics',
        inventory: {
          'Paracetamol 500mg': 6800,
          'Amoxicillin 250mg': 6500, // Best for antibiotics
          'Insulin Glargine 100IU/ml': 950,
          'Metformin 500mg': 5200,
          'Aspirin 75mg': 7100
        },
        pricing: {
          'Paracetamol 500mg': 0.13,
          'Amoxicillin 250mg': 0.34, // Best price for antibiotics
          'Insulin Glargine 100IU/ml': 12.50,
          'Metformin 500mg': 0.27,
          'Aspirin 75mg': 0.08
        },
        advantages: ['Generic specialists', 'Large inventory', 'Antibiotic expertise']
      },
      {
        id: 5,
        name: 'Dr Reddys Pharma Hub',
        address: '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
        location: 'Miyapur, Hyderabad',
        coordinates: { lat: 17.4969, lng: 78.3428 },
        distance: 8.9, // km
        estimatedDelivery: '3 hours',
        available: true,
        rating: 4.5,
        specialization: 'Branded & research medications',
        inventory: {
          'Paracetamol 500mg': 4200,
          'Amoxicillin 250mg': 2800,
          'Insulin Glargine 100IU/ml': 1500,
          'Metformin 500mg': 6200, // Best for diabetes medications
          'Aspirin 75mg': 8500
        },
        pricing: {
          'Paracetamol 500mg': 0.14,
          'Amoxicillin 250mg': 0.40,
          'Insulin Glargine 100IU/ml': 11.80,
          'Metformin 500mg': 0.24, // Premium but reliable
          'Aspirin 75mg': 0.075
        },
        advantages: ['Research-grade quality', 'Branded medications', 'Long-term partnership']
      }
    ];
    
    // Sample low stock items that need to be ordered
    const lowStockItems = [
      {
        id: 'ls-001',
        drugName: 'Paracetamol 500mg',
        currentStock: 45,
        minimumRequired: 200,
        recommendedOrder: 500,
        priority: 'high',
        lastOrdered: Date.now() - (28 * 86400000), // 28 days ago
        criticalLevel: 50,
        monthlyUsage: 180,
        nearbyDistributors: hyderabadDistributors.map(d => ({
          ...d,
          optimized: d.id === 2, // Mediplus has best price
          score: d.id === 2 ? 95 : d.id === 1 ? 92 : d.id === 5 ? 88 : d.id === 4 ? 85 : 82
        }))
      },
      {
        id: 'ls-002',
        drugName: 'Insulin Glargine 100IU/ml',
        currentStock: 12,
        minimumRequired: 50,
        recommendedOrder: 120,
        priority: 'critical',
        lastOrdered: Date.now() - (42 * 86400000), // 42 days ago
        criticalLevel: 20,
        monthlyUsage: 45,
        nearbyDistributors: hyderabadDistributors.map(d => ({
          ...d,
          optimized: d.id === 3, // ColdChain specialist for insulin
          score: d.id === 3 ? 98 : d.id === 1 ? 90 : d.id === 5 ? 85 : d.id === 2 ? 80 : 78
        }))
      },
      {
        id: 'ls-003',
        drugName: 'Amoxicillin 250mg',
        currentStock: 95,
        minimumRequired: 200,
        recommendedOrder: 400,
        priority: 'medium',
        lastOrdered: Date.now() - (35 * 86400000), // 35 days ago
        criticalLevel: 100,
        monthlyUsage: 160,
        nearbyDistributors: hyderabadDistributors.map(d => ({
          ...d,
          optimized: d.id === 4, // Hetero Drugs best for antibiotics
          score: d.id === 4 ? 94 : d.id === 3 ? 88 : d.id === 1 ? 85 : d.id === 2 ? 82 : 80
        }))
      },
      {
        id: 'ls-004',
        drugName: 'Metformin 500mg',
        currentStock: 78,
        minimumRequired: 150,
        recommendedOrder: 350,
        priority: 'medium',
        lastOrdered: Date.now() - (25 * 86400000), // 25 days ago
        criticalLevel: 80,
        monthlyUsage: 140,
        nearbyDistributors: hyderabadDistributors.map(d => ({
          ...d,
          optimized: d.id === 2, // Mediplus best price for diabetes meds
          score: d.id === 2 ? 93 : d.id === 5 ? 90 : d.id === 1 ? 87 : d.id === 4 ? 84 : 81
        }))
      },
      {
        id: 'ls-005',
        drugName: 'Aspirin 75mg',
        currentStock: 220,
        minimumRequired: 300,
        recommendedOrder: 600,
        priority: 'low',
        lastOrdered: Date.now() - (15 * 86400000), // 15 days ago
        criticalLevel: 250,
        monthlyUsage: 200,
        nearbyDistributors: hyderabadDistributors.map(d => ({
          ...d,
          optimized: d.id === 3, // ColdChain has best aspirin price
          score: d.id === 3 ? 91 : d.id === 5 ? 89 : d.id === 1 ? 86 : d.id === 4 ? 84 : 81
        }))
      }
    ];
    
    setLowStockRequests(lowStockItems);
  };

  const openDistributorMap = (item) => {
    setSelectedLowStockItem(item);
    setShowDistributorMap(true);
  };

  const closeDistributorMap = () => {
    setShowDistributorMap(false);
    setSelectedLowStockItem(null);
  };

  const openDispenseModal = (batch) => {
    setDispenseModal({
      isOpen: true,
      batch: batch,
      selectedPatient: ''
    });
  };

  const closeDispenseModal = () => {
    setDispenseModal({
      isOpen: false,
      batch: null,
      selectedPatient: ''
    });
  };

  // Open modal for dispensing medication to patient
  const openDispensingModal = (medication) => {
    setDispensingToPatient({
      isOpen: true,
      medication,
      patient: '',
      quantity: 1,
      reason: 'Regular prescription'
    });
  };

  // Close dispensing to patient modal
  const closeDispensingModal = () => {
    setDispensingToPatient({
      isOpen: false,
      medication: null,
      patient: '',
      quantity: 1,
      reason: ''
    });
  };

  // Handle dispensing medication to patient
  const handleDispenseToPatient = async () => {
    const { medication, patient, quantity, reason } = dispensingToPatient;
    
    if (!patient) {
      alert('Please select a patient');
      return;
    }

    // Use demo account if no wallet connected
    const currentAccountAddress = account?.address || demoAccount.address;

    try {
      setLoading(true);
      
      // Generate transaction hash for demo
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Create a dispensing record
      const dispensingRecord = {
        id: `disp-${Date.now()}`,
        drugName: medication.drugName,
        quantity,
        patient,
        reason,
        timestamp: Date.now(),
        transactionHash: txHash,
        hospitalAddress: currentAccountAddress
      };
      
      // Store dispensing record
      const existingRecords = JSON.parse(localStorage.getItem('patientDispensings') || '[]');
      existingRecords.unshift(dispensingRecord);
      localStorage.setItem('patientDispensings', JSON.stringify(existingRecords));
      
      // Update inventory (decrement quantity)
      const updatedBatches = batches.map(batch => {
        if (batch.id === medication.id) {
          return {
            ...batch,
            quantity: Math.max(0, parseInt(batch.quantity) - quantity)
          };
        }
        return batch;
      });
      setBatches(updatedBatches);
      
      // Log activity
      addActivityLog('DISPENSED_MEDICATION', {
        drugName: medication.drugName,
        quantity,
        patient,
        reason,
        transactionHash: txHash
      });
      
      closeDispensingModal();
      
      alert(`✅ Successfully dispensed ${quantity} units of ${medication.drugName} to patient ${patient.split(' ')[0]}`);
      
    } catch (error) {
      console.error('❌ Error dispensing medication to patient:', error);
      alert('Error dispensing medication: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle acceptance of QR stock arrival
  const acceptQRStock = async (qrArrival) => {
    // Use demo account if no wallet connected
    const currentAccountAddress = account?.address || demoAccount.address;
    
    try {
      setLoading(true);
      
      // Simulate blockchain confirmation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update QR arrival status
      setQrArrivals(prev => prev.map(item => 
        item.id === qrArrival.id 
          ? { 
              ...item, 
              status: 'accepted', 
              acceptedAt: Date.now() 
            }
          : item
      ));
      
      // Add to hospital inventory
      const newBatch = {
        id: `batch-${Date.now()}`,
        drugName: qrArrival.drugName,
        quantity: qrArrival.quantity,
        manufacturer: qrArrival.distributor,
        manufacturerAddress: qrArrival.distributorAddress,
        status: 2, // Received
        expiryDate: Math.floor(qrArrival.expiryDate / 1000)
      };
      
      setBatches(prev => [...prev, newBatch]);
      
      // Store accepted QR arrivals for persistence
      const acceptedArrivals = JSON.parse(localStorage.getItem('acceptedHospitalQRArrivals') || '[]');
      acceptedArrivals.unshift({
        ...qrArrival,
        acceptedAt: Date.now(),
        hospitalAddress: currentAccountAddress
      });
      localStorage.setItem('acceptedHospitalQRArrivals', JSON.stringify(acceptedArrivals));
      
      // Log activity
      addActivityLog('ACCEPTED_STOCK', {
        drugName: qrArrival.drugName,
        quantity: qrArrival.quantity,
        distributor: qrArrival.distributor,
        batchNumber: qrArrival.batchNumber
      });
      
      alert(`✅ Successfully accepted ${qrArrival.quantity} units of ${qrArrival.drugName} from ${qrArrival.distributor}`);
      
    } catch (error) {
      console.error('❌ Error accepting QR stock:', error);
      alert('Error accepting stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle rejection of QR stock arrival
  const rejectQRStock = async (qrArrival) => {
    try {
      setLoading(true);
      
      // Update QR arrival status
      setQrArrivals(prev => prev.map(item => 
        item.id === qrArrival.id 
          ? { 
              ...item, 
              status: 'rejected', 
              rejectedAt: Date.now() 
            }
          : item
      ));
      
      // Log activity
      addActivityLog('REJECTED_STOCK', {
        drugName: qrArrival.drugName,
        quantity: qrArrival.quantity,
        distributor: qrArrival.distributor,
        reason: 'Quality concerns or incorrect delivery'
      });
      
      alert(`❌ Rejected ${qrArrival.quantity} units of ${qrArrival.drugName} from ${qrArrival.distributor}`);
      
    } catch (error) {
      console.error('❌ Error rejecting QR stock:', error);
      alert('Error rejecting stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle placing request to distributor
  const requestFromDistributor = async (item, distributor) => {
    // Use demo account if no wallet connected
    const currentAccountAddress = account?.address || SAMPLE_ACCOUNTS.hospital.address;
    
    if (!currentAccountAddress) {
      alert('Unable to process request. System error.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate transaction hash for demo
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Create request record
      const requestRecord = {
        id: `req-${Date.now()}`,
        drugName: item.drugName,
        quantity: item.recommendedOrder,
        hospitalAddress: currentAccountAddress,
        distributorName: distributor.name,
        distributorAddress: distributor.address,
        status: 'pending',
        priority: item.priority,
        timestamp: Date.now(),
        transactionHash: txHash
      };
      
      // Store request record
      const existingRequests = JSON.parse(localStorage.getItem('hospitalDistributorRequests') || '[]');
      existingRequests.unshift(requestRecord);
      localStorage.setItem('hospitalDistributorRequests', JSON.stringify(existingRequests));
      
      // Log activity
      addActivityLog('REQUESTED_STOCK', {
        drugName: item.drugName,
        quantity: item.recommendedOrder,
        distributor: distributor.name,
        priority: item.priority,
        transactionHash: txHash
      });
      
      // Update low stock requests (remove the one that was just ordered)
      setLowStockRequests(prev => prev.filter(i => i.id !== item.id));
      
      alert(`✅ Successfully requested ${item.recommendedOrder} units of ${item.drugName} from ${distributor.name}`);
      
    } catch (error) {
      console.error('❌ Error requesting from distributor:', error);
      alert('Error requesting from distributor: ' + error.message);
    } finally {
      setLoading(false);
      setSelectedDistributor(null);
    }
  };

  const handleDispense = async () => {
    if (!dispenseModal.selectedPatient) {
      alert('Please select a patient');
      return;
    }

    try {
      setLoading(true);
      await dispenseToPatient(dispenseModal.batch.id, dispenseModal.selectedPatient);
      closeDispenseModal();
      await loadHospitalBatches();
      
      // Log activity
      addActivityLog('DISPENSED_MEDICATION', {
        batchId: dispenseModal.batch.id,
        drugName: dispenseModal.batch.drugName,
        patient: dispenseModal.selectedPatient,
        quantity: dispenseModal.batch.quantity
      });
      
      alert('Medication dispensed successfully!');
    } catch (error) {
      console.error('❌ Error dispensing medication:', error);
      alert('Error dispensing medication: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Available';
      case 1: return 'In Transit';
      case 2: return 'Received';
      case 3: return 'Dispensed';
      default: return 'Unknown';
    }
  };

  // Calculate inventory statistics
  const getInventoryStats = () => {
    const totalItems = batches.reduce((sum, batch) => sum + parseInt(batch.quantity || 0), 0);
    const lowStockCount = lowStockRequests.length;
    const availableBatches = batches.filter(batch => batch.status === 2).length;
    const pendingArrivals = qrArrivals.filter(qr => qr.status === 'pending').length;
    
    return {
      totalItems,
      lowStockCount,
      availableBatches,
      pendingArrivals
    };
  };
  
  const stats = getInventoryStats();

  // Check if account is available - temporarily bypass for demo
  const isDemo = true; // Set to true to bypass wallet connection
  const demoAccount = {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
  };
  
  if (!isDemo && (!account || !account.address)) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 object-cover w-full h-full z-0 opacity-30"
          src="/assets/videos/background.mp4"
        ></video>
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <div className="relative z-20 flex flex-col items-center">
          <MagicLoader size={60} particleCount={3} speed={0.8} />
          <p className="mt-4 text-lg font-bold text-white">Please connect your wallet to view the Hospital Dashboard...</p>
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-sm text-gray-300 mb-2">For demo purposes, you can:</p>
            <a 
              href="/wallet-help" 
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Get Wallet Setup Help →
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Use demo account if wallet not connected
  const currentAccount = account || demoAccount;

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
                  <h1 className="text-4xl font-bold text-white mb-2">🏥 Hospital Dashboard</h1>
                  <p className="text-lg text-white/80 mb-4">
                    Dispense drugs, manage patients, track inventory
                  </p>
                  {account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                      <RoleStatus />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <BackButton />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">Apollo Hospital</div>
                    <div className="text-white/70">Hyderabad, Telangana</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white/80">Total Inventory</h3>
                <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">{stats.totalItems}</span>
                <span className="text-white/60 ml-2 text-sm">units</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white/80">Low Stock Items</h3>
                <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">{stats.lowStockCount}</span>
                <span className="text-white/60 ml-2 text-sm">items</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white/80">Available Batches</h3>
                <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">{stats.availableBatches}</span>
                <span className="text-white/60 ml-2 text-sm">batches</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white/80">Pending Arrivals</h3>
                <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">{stats.pendingArrivals}</span>
                <span className="text-white/60 ml-2 text-sm">deliveries</span>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-8">
            <div className="flex overflow-x-auto space-x-2 bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20">
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-white/10'}`}
                onClick={() => setActiveTab('inventory')}
              >
                📦 Inventory
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${activeTab === 'dispense' ? 'bg-purple-600' : 'hover:bg-white/10'}`}
                onClick={() => setActiveTab('dispense')}
              >
                💊 Dispense to Patients
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${activeTab === 'qrarrivals' ? 'bg-green-600' : 'hover:bg-white/10'}`}
                onClick={() => setActiveTab('qrarrivals')}
              >
                📱 QR Stock Arrivals
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${activeTab === 'requests' ? 'bg-yellow-600' : 'hover:bg-white/10'}`}
                onClick={() => setActiveTab('requests')}
              >
                🛒 Request Medicines
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${activeTab === 'activity' ? 'bg-red-600' : 'hover:bg-white/10'}`}
                onClick={() => setActiveTab('activity')}
              >
                📝 Activity Log
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-xl p-6 mb-8">
            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                  <button
                    onClick={loadHospitalBatches}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                        Refreshing...
                      </div>
                    ) : (
                      '🔄 Refresh Inventory'
                    )}
                  </button>
                </div>
                
                {loading && batches.length === 0 ? (
                  <div className="text-center py-8">
                    <MagicLoader size={48} particleCount={3} speed={0.8} className="mb-4" />
                    <p className="text-white/60">Loading inventory...</p>
                  </div>
                ) : (batches.length > 0 || availableMedications.length > 0) ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {[...batches, ...availableMedications].map((batch) => (
                      <div key={batch.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-white">#{batch.id} - {batch.drugName}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </div>
                        <div className="text-white/80 text-sm mb-3">
                          <p>Quantity: {batch.quantity} units</p>
                          <p>Manufacturer: {batch.manufacturer?.slice ? `${batch.manufacturer?.slice(0, 6)}...${batch.manufacturer?.slice(-4)}` : batch.manufacturer}</p>
                          <p>Expiry: {new Date(parseInt(batch.expiryDate) * 1000).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          {(batch.status === 2 || batch.status === '2' || Number(batch.status) === 2) && (
                            <button 
                              onClick={() => openDispensingModal(batch)}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                            >
                              💊 Dispense to Patient
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-6xl mb-4">🏥</div>
                    <h3 className="text-lg font-medium text-white mb-2">No inventory</h3>
                    <p className="text-white/60">No batches have been transferred to this hospital yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Dispense Tab */}
            {activeTab === 'dispense' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Dispense Medications to Patients</h2>
                  <div className="flex items-center space-x-3">
                    <div className="text-white/80 text-sm">
                      Total Available: {availableMedications.reduce((sum, med) => sum + med.quantity, 0)} units
                    </div>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all duration-300 flex items-center"
                    >
                      📝 View Activity Log
                    </button>
                  </div>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <MagicLoader size={48} particleCount={3} speed={0.8} className="mb-4" />
                      <p className="text-white/60">Loading available medications...</p>
                    </div>
                  ) : availableMedications.length > 0 ? (
                    availableMedications.map((med) => (
                      <div key={med.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-xl font-bold text-white">{med.drugName}</h3>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                med.quantity > 100 ? 'bg-green-600 text-white' :
                                med.quantity > 50 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {med.quantity > 100 ? '✅ Well Stocked' :
                                 med.quantity > 50 ? '⚠️ Medium Stock' : '🚨 Low Stock'}
                              </span>
                              {med.requiresColdChain && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                                  ❄️ Cold Chain
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{med.quantity}</div>
                                <div className="text-white/60 text-sm">Available Units</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-blue-400">{med.batchNumber}</div>
                                <div className="text-white/60 text-sm">Batch Number</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-purple-400">{med.manufacturer}</div>
                                <div className="text-white/60 text-sm">Manufacturer</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-orange-400">
                                  {Math.ceil((med.expiryDate - Date.now()) / (86400000 * 30))} months
                                </div>
                                <div className="text-white/60 text-sm">Until Expiry</div>
                              </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">📅 Expiry Date:</span>
                                  <span className={`${
                                    med.expiryDate - Date.now() < 90 * 86400000 ? 'text-red-400' : 'text-white'
                                  }`}>
                                    {new Date(med.expiryDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">🌡️ Storage:</span>
                                  <span>{med.storageTemp}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Patient Selection */}
                        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                          <h4 className="text-white font-semibold mb-3 flex items-center">
                            👥 Quick Dispense to Regular Patients
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {patients.slice(0, 3).map((patient, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setDispensingToPatient({
                                    isOpen: true,
                                    medication: med,
                                    patient: `${patient.name} (${patient.patientId})`,
                                    quantity: 1,
                                    reason: 'Regular prescription'
                                  });
                                }}
                                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-left transition-all duration-300"
                              >
                                <div className="text-white font-medium text-sm">{patient.name}</div>
                                <div className="text-white/60 text-xs">
                                  ID: {patient.patientId} • Age: {patient.age}
                                </div>
                                <div className="text-white/60 text-xs">{patient.condition}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-3 mt-4">
                          <button
                            onClick={() => openDispensingModal(med)}
                            disabled={med.quantity === 0}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center"
                          >
                            💊 Dispense Medication
                          </button>
                          <button
                            onClick={() => {
                              // Generate QR code for this medication
                              const qrData = {
                                medicationId: med.id,
                                drugName: med.drugName,
                                batchNumber: med.batchNumber,
                                hospital: 'Current Hospital',
                                timestamp: Date.now()
                              };
                              alert(`QR Code Data: ${JSON.stringify(qrData, null, 2)}`);
                            }}
                            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center"
                          >
                            📱 QR Code
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-white/40 text-6xl mb-4">💊</div>
                      <h3 className="text-lg font-medium text-white mb-2">No medications available</h3>
                      <p className="text-white/60">No medications are currently available for dispensing.</p>
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="mt-4 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 font-medium transition-all duration-300"
                      >
                        🛒 Request New Stock
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Arrivals Tab */}
            {activeTab === 'qrarrivals' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">QR Stock Arrivals</h2>
                  <button
                    onClick={loadQrArrivals}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-all duration-300 flex items-center"
                  >
                    {loading ? 'Refreshing...' : '🔄 Refresh Arrivals'}
                  </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {qrArrivals.length > 0 ? (
                    qrArrivals.map((arrival) => (
                      <div key={arrival.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="flex justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-bold text-white">{arrival.drugName}</h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                arrival.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                arrival.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {arrival.status.charAt(0).toUpperCase() + arrival.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-white/80 text-sm space-y-1">
                              <p>Quantity: {arrival.quantity} units</p>
                              <p>Distributor: {arrival.distributor}</p>
                              <p>Batch: {arrival.batchNumber}</p>
                              <p>Expiry: {new Date(arrival.expiryDate).toLocaleDateString()}</p>
                              {arrival.requiresColdChain && (
                                <p className="text-blue-400">❄️ Requires Cold Chain Storage</p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-4">
                            {/* QR Code for Stock Arrival */}
                            <div className="flex-shrink-0">
                              <QRCodeGenerator 
                                data={{
                                  type: 'stock_arrival',
                                  id: arrival.id,
                                  drugName: arrival.drugName,
                                  quantity: arrival.quantity,
                                  batchNumber: arrival.batchNumber,
                                  distributor: arrival.distributor,
                                  timestamp: arrival.timestamp,
                                  hospitalAddress: currentAccountAddress
                                }}
                                size={100}
                                title="Stock Arrival QR"
                              />
                            </div>
                            <div className="flex flex-col justify-between">
                              <div className="text-right text-white/60 text-sm">
                                {new Date(arrival.timestamp).toLocaleString()}
                              </div>
                              {arrival.status === 'pending' && (
                                <div className="flex flex-col space-y-2 mt-2">
                                  <button
                                    onClick={() => acceptQRStock(arrival)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                  >
                                    ✅ Accept
                                  </button>
                                  <button
                                    onClick={() => rejectQRStock(arrival)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                  >
                                    ❌ Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-white/40 text-6xl mb-4">📱</div>
                      <h3 className="text-lg font-medium text-white mb-2">No QR arrivals</h3>
                      <p className="text-white/60">No pending stock arrivals at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Request Medicines - Low Stock Alert</h2>
                  <button
                    onClick={loadLowStockRequests}
                    disabled={loading}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium transition-all duration-300 flex items-center"
                  >
                    {loading ? 'Refreshing...' : '🔄 Check Stock Levels'}
                  </button>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {lowStockRequests.length > 0 ? (
                    lowStockRequests.map((item) => (
                      <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                item.priority === 'critical' ? 'bg-red-600 text-white animate-pulse' :
                                item.priority === 'high' ? 'bg-orange-600 text-white' :
                                item.priority === 'medium' ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'
                              }`}>
                                {item.priority === 'critical' ? '🚨 CRITICAL' :
                                 item.priority === 'high' ? '⚠️ HIGH' :
                                 item.priority === 'medium' ? '📝 MEDIUM' : '✅ LOW'}
                              </span>
                              <h3 className="text-xl font-bold text-white">{item.drugName}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-400">{item.currentStock}</div>
                                <div className="text-white/60 text-sm">Current Stock</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">{item.minimumRequired}</div>
                                <div className="text-white/60 text-sm">Minimum Required</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{item.recommendedOrder}</div>
                                <div className="text-white/60 text-sm">Recommended Order</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">{item.monthlyUsage}</div>
                                <div className="text-white/60 text-sm">Monthly Usage</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openDistributorMap(item)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all duration-300 flex items-center"
                            >
                              🗺️ View Map
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-white/80 mb-1">
                            <span>Stock Level</span>
                            <span>{Math.round((item.currentStock / item.minimumRequired) * 100)}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                item.currentStock < item.criticalLevel ? 'bg-red-500' :
                                item.currentStock < item.minimumRequired ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((item.currentStock / item.minimumRequired) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Distributors List */}
                        <div className="mt-4">
                          <h4 className="text-white font-semibold mb-3 flex items-center">
                            🏪 Available Distributors in Hyderabad
                            <span className="ml-2 text-sm text-white/60">({item.nearbyDistributors.length} options available)</span>
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {item.nearbyDistributors
                              .sort((a, b) => b.score - a.score)
                              .map((dist) => (
                              <div key={dist.id} className={`bg-white/5 rounded-lg p-4 border transition-all duration-300 hover:bg-white/10 ${
                                dist.optimized ? 'border-green-400 bg-green-500/10' : 'border-white/20'
                              }`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <div className="text-white font-medium">{dist.name}</div>
                                      {dist.optimized && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                                          ⭐ OPTIMIZED
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-white/70 text-sm space-y-1">
                                      <div className="flex items-center space-x-4">
                                        <span>📍 {dist.location}</span>
                                        <span>🕒 {dist.estimatedDelivery}</span>
                                      </div>
                                      <div className="flex items-center space-x-4">
                                        <span>📦 {dist.inventory[item.drugName]?.toLocaleString() || 'N/A'} units</span>
                                        <span>💰 ₹{dist.pricing[item.drugName]?.toFixed(2) || 'N/A'}/unit</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span>⭐ {dist.rating}/5</span>
                                        <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">{dist.specialization}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold mb-1 ${
                                      dist.score >= 95 ? 'text-green-400' :
                                      dist.score >= 90 ? 'text-blue-400' :
                                      dist.score >= 85 ? 'text-yellow-400' : 'text-white'
                                    }`}>
                                      {dist.score}%
                                    </div>
                                    <div className="text-xs text-white/60">Match Score</div>
                                  </div>
                                </div>
                                
                                {/* Total Cost Calculation */}
                                <div className="bg-black/30 rounded p-2 mb-3">
                                  <div className="text-white/80 text-sm">
                                    <div className="flex justify-between">
                                      <span>Total Cost:</span>
                                      <span className="font-semibold">
                                        ₹{((dist.pricing[item.drugName] || 0) * item.recommendedOrder).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => requestFromDistributor(item, dist)}
                                  disabled={loading}
                                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    dist.optimized
                                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                                      : 'bg-white/10 text-white hover:bg-white/20'
                                  } disabled:opacity-50 flex items-center justify-center`}
                                >
                                  {loading ? (
                                    <div className="flex items-center">
                                      <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                                      Requesting...
                                    </div>
                                  ) : (
                                    <>
                                      {dist.optimized ? '✨ Select Best Option' : '📞 Request Stock'}
                                    </>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-white/40 text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-medium text-white mb-2">Stock levels good</h3>
                      <p className="text-white/60">No items require restocking at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Activity Log</h2>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activityLogs.length > 0 ? (
                    activityLogs.map((log) => (
                      <div key={log.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-white font-semibold">
                                {log.action === 'ACCEPTED_STOCK' && '✅ Stock Accepted'}
                                {log.action === 'REJECTED_STOCK' && '❌ Stock Rejected'}
                                {log.action === 'DISPENSED_MEDICATION' && '💊 Medication Dispensed'}
                                {log.action === 'REQUESTED_STOCK' && '📦 Stock Requested'}
                              </span>
                            </div>
                            <div className="text-white/80 text-sm space-y-1">
                              {log.details.drugName && <p>Drug: {log.details.drugName}</p>}
                              {log.details.quantity && <p>Quantity: {log.details.quantity} units</p>}
                              {log.details.distributor && <p>Distributor: {log.details.distributor}</p>}
                              {log.details.patient && <p>Patient: {log.details.patient}</p>}
                              {log.details.reason && <p>Reason: {log.details.reason}</p>}
                              {log.details.priority && <p>Priority: {log.details.priority}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white/60 text-sm">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                            {log.details.transactionHash && (
                              <div className="text-blue-400 text-xs mt-1">
                                Tx: {log.details.transactionHash.slice(0, 6)}...{log.details.transactionHash.slice(-4)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-white/40 text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-white mb-2">No activity</h3>
                      <p className="text-white/60">No activity has been logged yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Enhanced Dispensing to Patient Modal */}
          {dispensingToPatient.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full mx-4 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  💊 Dispense Medication to Patient
                </h3>
                
                {dispensingToPatient.medication && (
                  <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/20">
                    <h4 className="text-white font-semibold mb-2">Medication Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                      <div>
                        <span className="font-medium">Drug:</span> {dispensingToPatient.medication.drugName}
                      </div>
                      <div>
                        <span className="font-medium">Available:</span> {dispensingToPatient.medication.quantity} units
                      </div>
                      <div>
                        <span className="font-medium">Batch:</span> {dispensingToPatient.medication.batchNumber}
                      </div>
                      <div>
                        <span className="font-medium">Expiry:</span> {new Date(dispensingToPatient.medication.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Select Patient *
                    </label>
                    <select
                      value={dispensingToPatient.patient}
                      onChange={(e) => setDispensingToPatient({...dispensingToPatient, patient: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white backdrop-blur-sm"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map((patient, index) => (
                        <option key={index} value={`${patient.name} (${patient.patientId})`} className="bg-gray-800">
                          {patient.name} (ID: {patient.patientId}) - Age: {patient.age}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Quantity to Dispense *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={dispensingToPatient.medication?.quantity || 100}
                      value={dispensingToPatient.quantity}
                      onChange={(e) => setDispensingToPatient({...dispensingToPatient, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white backdrop-blur-sm"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Reason for Dispensing *
                    </label>
                    <select
                      value={dispensingToPatient.reason}
                      onChange={(e) => setDispensingToPatient({...dispensingToPatient, reason: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white backdrop-blur-sm"
                    >
                      <option value="Regular prescription">Regular prescription</option>
                      <option value="Emergency treatment">Emergency treatment</option>
                      <option value="Chronic condition management">Chronic condition management</option>
                      <option value="Post-surgery care">Post-surgery care</option>
                      <option value="Preventive care">Preventive care</option>
                      <option value="Specialist referral">Specialist referral</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleDispenseToPatient}
                      disabled={loading || !dispensingToPatient.patient || !dispensingToPatient.quantity}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-semibold transition-all duration-300"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                          Dispensing...
                        </div>
                      ) : (
                        `💊 Dispense ${dispensingToPatient.quantity} Unit${dispensingToPatient.quantity > 1 ? 's' : ''}`
                      )}
                    </button>
                    <button
                      onClick={closeDispensingModal}
                      className="flex-1 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Distributor Map Modal */}
          {showDistributorMap && selectedLowStockItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    🗺️ Hyderabad Distributor Network
                  </h3>
                  <button
                    onClick={closeDistributorMap}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <GoogleMapsLike 
                  distributors={selectedLowStockItem.nearbyDistributors}
                  selectedItem={selectedLowStockItem}
                  onDistributorSelect={(dist) => {
                    requestFromDistributor(selectedLowStockItem, dist);
                    closeDistributorMap();
                  }}
                />

                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/20">
                  <h4 className="text-white font-semibold mb-3">Quick Request Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLowStockItem.nearbyDistributors
                      .filter(d => d.optimized)
                      .map((dist) => (
                      <button
                        key={dist.id}
                        onClick={() => {
                          requestFromDistributor(selectedLowStockItem, dist);
                          closeDistributorMap();
                        }}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 text-left"
                      >
                        <div className="font-semibold">⭐ {dist.name}</div>
                        <div className="text-sm text-green-100">
                          {dist.distance}km • ₹{((dist.pricing[selectedLowStockItem.drugName] || 0) * selectedLowStockItem.recommendedOrder).toLocaleString()} total
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Dispense Modal */}
          {dispenseModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Dispense Batch #{dispenseModal.batch?.id}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Select Patient
                    </label>
                    <select
                      value={dispenseModal.selectedPatient}
                      onChange={(e) => setDispenseModal({...dispenseModal, selectedPatient: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white backdrop-blur-sm"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map((patient, index) => (
                        <option key={index} value={patient.address}>
                          {patient.name} ({patient.address.slice(0, 6)}...{patient.address.slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDispense}
                      disabled={loading || !dispenseModal.selectedPatient}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-semibold transition-all duration-300"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <MagicLoader size={16} particleCount={2} speed={0.8} className="mr-2" />
                          Dispensing...
                        </div>
                      ) : (
                        'Dispense'
                      )}
                    </button>
                    <button
                      onClick={closeDispenseModal}
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
    </div>
  );
};

export default HospitalDashboard;
