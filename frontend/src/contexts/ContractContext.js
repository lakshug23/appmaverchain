import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { CONTRACTS } from '../config/contracts';
import { enhanceContractWithMocks } from '../utils/mockBlockchain';

// Use the actual compiled ABI from the contracts
const MedChainABI = CONTRACTS.MedChain.abi;
const contractAddress = CONTRACTS.MedChain.address;

const ContractContext = createContext();

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const { provider, signer, account } = useWallet();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Contract initialization
  useEffect(() => {
    if (provider) {
      initializeContract();
    }
  }, [provider]);

  // Force reinitialize contract when needed
  const forceReinitialize = async () => {
    console.log('🔄 Force reinitializing contract...');
    setContract(null);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await initializeContract();
  };

  // Check user role when account changes
  useEffect(() => {
    if (contract && account) {
      checkUserRole();
    }
  }, [contract, account]);

  const initializeContract = async () => {
    try {
      setLoading(true);
      console.log('🔍 Initializing contract...');
      console.log('🔍 Provider:', provider);
      console.log('🔍 Signer:', signer);
      console.log('🔍 Account:', account);
      console.log('🔍 Contract address:', contractAddress);
      
      // Force clear any cached contract instance
      setContract(null);
      
      // Check if user has connected wallet
      if (!account) {
        console.warn('⚠️ No account connected. Please connect your wallet first.');
        return;
      }
      
      if (!provider) {
        console.error('❌ No provider available. Please connect MetaMask.');
        return;
      }

      if (!contractAddress) {
        console.error('❌ No contract address configured');
        return;
      }

      if (!MedChainABI) {
        console.error('❌ No contract ABI available');
        return;
      }

      try {
        const network = await provider.getNetwork();
        console.log('🔍 Network:', network);
        
        // Check if we're on the right network (hardhat local = chainId 31337)
        if (network.chainId !== 31337n) {
          console.error('❌ Wrong network! Please switch to Hardhat local network (Chain ID: 31337)');
          console.error('Current network chain ID:', network.chainId.toString());
          return;
        }
      } catch (networkError) {
        console.error('❌ Error getting network:', networkError);
        return;
      }
      
      const contractInstance = new ethers.Contract(contractAddress, MedChainABI, signer || provider);
      
      // Test if contract is accessible with more detailed error handling
      try {
        console.log('🔍 Testing contract accessibility...');
        const manufacturerRole = await contractInstance.MANUFACTURER_ROLE();
        console.log('✅ Contract is accessible, MANUFACTURER_ROLE:', manufacturerRole);
        
        // Enhance contract with mock implementations for missing functions
        const enhancedContract = enhanceContractWithMocks(contractInstance);
        console.log('✅ Contract enhanced with mock implementations');
        
        setContract(enhancedContract);
      } catch (error) {
        console.error('❌ Contract not accessible:', error);
        console.error('❌ Error details:', error.message);
        if (error.code === 'CALL_EXCEPTION') {
          console.error('❌ This usually means the contract is not deployed at this address');
        }
        setContract(null);
        return;
      }
      
      console.log('✅ Contract initialized:', contractAddress);
      console.log('✅ Contract instance:', contractInstance);
    } catch (error) {
      console.error('❌ Error initializing contract:', error);
      console.error('❌ Error stack:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    if (!contract || !account) {
      console.log('🔍 Cannot check role - contract or account missing');
      console.log('🔍 Contract:', contract);
      console.log('🔍 Account:', account);
      return;
    }

    try {
      console.log('🔍 Checking user role for account:', account);
      
      const roles = {
        MANUFACTURER: await contract.MANUFACTURER_ROLE(),
        DISTRIBUTOR: await contract.DISTRIBUTOR_ROLE(),
        HOSPITAL: await contract.HOSPITAL_ROLE(),
        PATIENT: await contract.PATIENT_ROLE(),
        ADMIN: await contract.ADMIN_ROLE()
      };

      console.log('🔍 Role hashes:', roles);

      let userRole = null;
      for (const [roleName, roleHash] of Object.entries(roles)) {
        const hasRole = await contract.hasRole(roleHash, account);
        console.log(`🔍 ${roleName}: ${hasRole}`);
        if (hasRole) {
          userRole = roleName;
          break;
        }
      }

      setUserRole(userRole);
      console.log('✅ User role set to:', userRole);
    } catch (error) {
      console.error('❌ Error checking user role:', error);
    }
  };

  // Role management functions
  const grantRole = async (role, address) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      let tx;
      switch (role) {
        case 'MANUFACTURER':
          tx = await contract.grantManufacturerRole(address);
          break;
        case 'DISTRIBUTOR':
          tx = await contract.grantDistributorRole(address);
          break;
        case 'HOSPITAL':
          tx = await contract.grantHospitalRole(address);
          break;
        case 'PATIENT':
          tx = await contract.grantPatientRole(address);
          break;
        default:
          throw new Error('Invalid role');
      }
      
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error granting role:', error);
      throw error;
    }
  };

  // Setup function to grant patient roles to sample accounts
  const setupPatientRoles = async () => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    try {
      console.log('🔧 Setting up patient roles for sample accounts...');
      const { patients } = require('../config/contracts').SAMPLE_ACCOUNTS;
      
      for (const patient of patients) {
        try {
          console.log(`👤 Granting patient role to ${patient.name} (${patient.address})...`);
          const tx = await contract.connect(signer).grantPatientRole(patient.address);
          await tx.wait();
          console.log(`✅ Patient role granted to ${patient.name}`);
        } catch (error) {
          console.error(`❌ Error granting role to ${patient.name}:`, error.message);
        }
      }
      
      console.log('✅ Patient role setup completed');
    } catch (error) {
      console.error('❌ Error setting up patient roles:', error);
      throw error;
    }
  };

  // Comprehensive role setup for all sample accounts
  const setupAllRoles = async () => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    try {
      console.log('🔧 Setting up all roles for sample accounts...');
      const { manufacturer, distributor, hospital, patients } = require('../config/contracts').SAMPLE_ACCOUNTS;
      
      // Grant manufacturer role
      try {
        console.log(`🏭 Granting manufacturer role to ${manufacturer.name} (${manufacturer.address})...`);
        const mfgTx = await contract.connect(signer).grantManufacturerRole(manufacturer.address);
        await mfgTx.wait();
        console.log(`✅ Manufacturer role granted to ${manufacturer.name}`);
      } catch (error) {
        console.error(`❌ Error granting manufacturer role:`, error.message);
      }

      // Grant distributor role
      try {
        console.log(`🚚 Granting distributor role to ${distributor.name} (${distributor.address})...`);
        const distTx = await contract.connect(signer).grantDistributorRole(distributor.address);
        await distTx.wait();
        console.log(`✅ Distributor role granted to ${distributor.name}`);
      } catch (error) {
        console.error(`❌ Error granting distributor role:`, error.message);
      }

      // Grant hospital role
      try {
        console.log(`🏥 Granting hospital role to ${hospital.name} (${hospital.address})...`);
        const hospTx = await contract.connect(signer).grantHospitalRole(hospital.address);
        await hospTx.wait();
        console.log(`✅ Hospital role granted to ${hospital.name}`);
      } catch (error) {
        console.error(`❌ Error granting hospital role:`, error.message);
      }

      // Grant patient roles
      for (const patient of patients) {
        try {
          console.log(`👤 Granting patient role to ${patient.name} (${patient.address})...`);
          const patientTx = await contract.connect(signer).grantPatientRole(patient.address);
          await patientTx.wait();
          console.log(`✅ Patient role granted to ${patient.name}`);
        } catch (error) {
          console.error(`❌ Error granting role to ${patient.name}:`, error.message);
        }
      }
      
      console.log('✅ All roles setup completed');
    } catch (error) {
      console.error('❌ Error setting up all roles:', error);
      throw error;
    }
  };

  // Drug lifecycle functions
  const createDrugBatch = async (drugName, drugCode, regulatoryApproval, merkleRoot, ipfsHash, quantity, expiryDate) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.createDrugBatch(drugName, drugCode, regulatoryApproval, merkleRoot, ipfsHash, quantity, expiryDate);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error creating drug batch:', error);
      throw error;
    }
  };

  // Compatibility wrapper for legacy frontend code
  const createBatch = async (drugName, quantity, expiryDate) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      // Default values for enhanced parameters
      const drugCode = drugName.toLowerCase().replace(/\s+/g, '_');
      const regulatoryApproval = 'AUTO_APPROVED';
      const merkleRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const ipfsHash = 'QmDefault123';
      
      const tx = await contract.createDrugBatch(drugName, drugCode, regulatoryApproval, merkleRoot, ipfsHash, quantity, expiryDate);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  };

  // Compatibility wrapper for transfer functions
  const transferBatch = async (batchId, recipientAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      // Try to determine if recipient is a distributor or hospital
      // For now, we'll default to transferToDistributor
      const tx = await contract.transferToDistributor(batchId, recipientAddress);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error transferring batch:', error);
      throw error;
    }
  };

  const transferToDistributor = async (batchId, distributorAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.transferToDistributor(batchId, distributorAddress);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error transferring to distributor:', error);
      throw error;
    }
  };

  const dispenseToPatient = async (batchId, patientAddress, quantity) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.dispenseToPatient(batchId, patientAddress, quantity);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error dispensing to patient:', error);
      throw error;
    }
  };
  
  // Distributor to Manufacturer Request Functions
  const requestFromManufacturer = async (manufacturerAddress, drugName, quantity, reason, urgencyLevel, proposedPrice = 0) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log('📤 Sending request to manufacturer...');
      
      // Check if the function exists directly on the contract
      if (typeof contract.requestFromManufacturer === 'function') {
        console.log('🔗 Using blockchain implementation of requestFromManufacturer');
        const tx = await contract.requestFromManufacturer(
          manufacturerAddress,
          drugName,
          quantity,
          reason || 'Inventory replenishment',
          urgencyLevel || 'Normal',
          proposedPrice
        );
        await tx.wait();
        console.log('✅ Request sent to manufacturer successfully!');
        return tx;
      } else {
        console.log('⚠️ Blockchain implementation not available, using mock');
        // The mock implementation is handled by the proxy in enhanceContractWithMocks
        const tx = await contract.requestFromManufacturer(
          manufacturerAddress,
          drugName,
          quantity,
          reason || 'Inventory replenishment',
          urgencyLevel || 'Normal',
          proposedPrice
        );
        await tx.wait();
        console.log('✅ Request sent to manufacturer successfully (simulated)!');
        return tx;
      }
    } catch (error) {
      console.error('❌ Error requesting from manufacturer:', error);
      throw error;
    }
  };
  
  const approveDistributorRequest = async (requestId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log(`📦 Approving distributor request #${requestId}...`);
      const tx = await contract.approveDistributorRequest(requestId);
      await tx.wait();
      console.log('✅ Distributor request approved successfully!');
      return tx;
    } catch (error) {
      console.error('❌ Error approving distributor request:', error);
      throw error;
    }
  };
  
  const rejectDistributorRequest = async (requestId, rejectionReason) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log(`❌ Rejecting distributor request #${requestId}...`);
      const tx = await contract.rejectDistributorRequest(requestId, rejectionReason || 'Request rejected by manufacturer');
      await tx.wait();
      console.log('✅ Distributor request rejected successfully!');
      return tx;
    } catch (error) {
      console.error('❌ Error rejecting distributor request:', error);
      throw error;
    }
  };
  
  const getDistributorRequest = async (requestId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const request = await contract.getDistributorRequest(requestId);
      return {
        requestId: Number(request.requestId),
        distributor: request.distributor,
        manufacturer: request.manufacturer,
        drugName: request.drugName,
        quantity: Number(request.quantity),
        status: Number(request.status),
        timestamp: Number(request.timestamp),
        reason: request.reason,
        urgencyLevel: request.urgencyLevel,
        proposedPrice: Number(request.proposedPrice)
      };
    } catch (error) {
      console.error('❌ Error getting distributor request:', error);
      throw error;
    }
  };
  
  const getDistributorRequests = async (distributorAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      // Check if the function exists directly on the contract
      let requestIds;
      
      try {
        console.log('🔗 Attempting to get distributor requests from blockchain...');
        requestIds = await contract.getDistributorRequests(distributorAddress);
      } catch (error) {
        console.log('⚠️ Blockchain implementation failed:', error.message);
        console.log('⚠️ Using mock implementation');
        return []; // Mock will return empty array through the proxy
      }
      
      const requests = [];
      
      for (const id of requestIds) {
        try {
          const request = await getDistributorRequest(Number(id));
          requests.push(request);
        } catch (error) {
          console.error(`Error getting request ${id}:`, error);
        }
      }
      
      return requests;
    } catch (error) {
      console.error('❌ Error getting distributor requests:', error);
      throw error;
    }
  };
  
  const getManufacturerRequests = async (manufacturerAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const requestIds = await contract.getManufacturerRequests(manufacturerAddress);
      const requests = [];
      
      for (const id of requestIds) {
        const request = await getDistributorRequest(Number(id));
        requests.push(request);
      }
      
      return requests;
    } catch (error) {
      console.error('❌ Error getting manufacturer requests:', error);
      throw error;
    }
  };

  // Drug verification functions
  const verifyDrug = async (batchId, leaf, proof) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.verifyDrug(batchId, leaf, proof);
      return result;
    } catch (error) {
      console.error('Error verifying drug:', error);
      throw error;
    }
  };

  const verifyAndLog = async (batchId, leaf, proof) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.verifyAndLog(batchId, leaf, proof);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error verifying and logging drug:', error);
      throw error;
    }
  };

  // Hospital management functions
  const registerHospital = async (hospitalAddress, name, registrationNumber, hospitalType, stockThreshold, capacity) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.registerHospital(hospitalAddress, name, registrationNumber, hospitalType, stockThreshold, capacity);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error registering hospital:', error);
      throw error;
    }
  };

  // Drug request functions
  const requestDrugs = async (distributorAddress, batchId, quantity, reason) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.requestDrugs(distributorAddress, batchId, quantity, reason);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error requesting drugs:', error);
      throw error;
    }
  };

  const approveRequest = async (requestId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.approveRequest(requestId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  };

  const rejectRequest = async (requestId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.rejectRequest(requestId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  };

  // WHO approved drug functions
  const addWHOApprovedDrug = async (drugHash) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.addWHOApprovedDrug(drugHash);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error adding WHO approved drug:', error);
      throw error;
    }
  };

  const removeWHOApprovedDrug = async (drugHash) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.removeWHOApprovedDrug(drugHash);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error removing WHO approved drug:', error);
      throw error;
    }
  };

  const isWHOApproved = async (drugHash) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.isWHOApproved(drugHash);
      return result;
    } catch (error) {
      console.error('Error checking WHO approval status:', error);
      throw error;
    }
  };

  const reportExpiredDrug = async (batchId, evidenceIpfsHash) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.reportExpiredDrug(batchId, evidenceIpfsHash);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error reporting expired drug:', error);
      throw error;
    }
  };

  // Health record functions
  const updateHealthRecord = async (patientAddress, ipfsHash) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.updateHealthRecord(patientAddress, ipfsHash);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  };

  const getHealthRecord = async (patientAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.getHealthRecord(patientAddress);
      return result;
    } catch (error) {
      console.error('Error getting health record:', error);
      throw error;
    }
  };

  // View functions
  const getDrugBatch = async (batchId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.getDrugBatch(batchId);
      return result;
    } catch (error) {
      console.error('Error getting drug batch:', error);
      throw error;
    }
  };

  const getHospital = async (hospitalAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.getHospital(hospitalAddress);
      return result;
    } catch (error) {
      console.error('Error getting hospital:', error);
      throw error;
    }
  };

  const getDrugRequest = async (requestId) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.getDrugRequest(requestId);
      return result;
    } catch (error) {
      console.error('Error getting drug request:', error);
      throw error;
    }
  };

  // Event listeners
  const listenToEvents = (eventName, callback) => {
    if (!contract) return;
    
    contract.on(eventName, callback);
    
    return () => {
      contract.off(eventName, callback);
    };
  };

  // Batch retrieval functions
  const getCurrentBatchId = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const result = await contract.getCurrentBatchId();
      return result;
    } catch (error) {
      console.error('Error getting current batch ID:', error);
      throw error;
    }
  };

  const getAllBatches = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log('🔍 Getting current batch ID...');
      console.log('🔍 Contract address:', contract.target || contract.address);
      const currentBatchId = await contract.getCurrentBatchId();
      console.log('✅ Current batch ID:', currentBatchId.toString());
      console.log('🔍 Current batch ID as number:', Number(currentBatchId));
      console.log(`🔍 Will fetch batches 1 to ${Number(currentBatchId)}...`);
      
      const batches = [];
      
      for (let i = 1; i <= currentBatchId; i++) {
        try {
          console.log(`🔍 Fetching batch #${i}...`);
          const batch = await contract.getDrugBatch(i);
          console.log(`✅ Batch #${i} fetched:`, batch);
          
          // Handle both named properties and array indices
          const batchData = {
            id: i,
            drugName: batch.drugName || batch[1],
            manufacturer: batch.manufacturer || batch[2],
            currentHolder: batch.currentHolder || batch[9],
            quantity: (batch.quantity || batch[5]).toString(),
            status: batch.status || batch[8],
            merkleRoot: batch.merkleRoot || batch[3],
            ipfsHash: batch.ipfsHash || batch[4],
            createdAt: (batch.createdAt || batch[6]).toString(),
            expiryDate: (batch.expiryDate || batch[7]).toString()
          };
          
          console.log(`✅ Processed batch #${i}:`, batchData);
          batches.push(batchData);
        } catch (error) {
          console.warn(`❌ Error fetching batch #${i}:`, error.message);
        }
      }
      
      console.log('✅ All batches fetched:', batches);
      return batches;
    } catch (error) {
      console.error('❌ Error getting all batches:', error);
      throw error;
    }
  };

  const getManufacturerBatches = async (manufacturerAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log('🔍 Getting batches for manufacturer:', manufacturerAddress);
      const allBatches = await getAllBatches();
      console.log('🔍 All batches received:', allBatches);
      
      const filtered = allBatches.filter(batch => 
        batch.manufacturer.toLowerCase() === manufacturerAddress.toLowerCase()
      );
      console.log('✅ Filtered manufacturer batches:', filtered);
      
      return filtered;
    } catch (error) {
      console.error('❌ Error getting manufacturer batches:', error);
      throw error;
    }
  };

  // Get batches for distributor
  const getDistributorBatches = async (distributorAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log('🔍 Getting batches for distributor:', distributorAddress);
      const allBatches = await getAllBatches();
      console.log('🔍 All batches received:', allBatches);
      
      const filtered = allBatches.filter(batch => {
        const holderMatches = batch.currentHolder.toLowerCase() === distributorAddress.toLowerCase();
        const statusMatches = (batch.status === 1 || batch.status === '1' || Number(batch.status) === 1);
        
        console.log(`🔍 Batch #${batch.id}:`, {
          holder: batch.currentHolder,
          holderMatches,
          status: batch.status,
          statusType: typeof batch.status,
          statusMatches,
          included: holderMatches && statusMatches
        });
        
        return holderMatches && statusMatches;
      });
      
      console.log('✅ Filtered distributor batches:', filtered);
      
      return filtered;
    } catch (error) {
      console.error('❌ Error getting distributor batches:', error);
      throw error;
    }
  };

  // Transfer batch to hospital
  const transferToHospital = async (batchId, hospitalAddress) => {
    if (!contract || !signer) throw new Error('Contract or signer not initialized');
    
    try {
      console.log(`🏥 Transferring batch #${batchId} to hospital ${hospitalAddress}...`);
      
      const tx = await contract.connect(signer).transferToHospital(batchId, hospitalAddress);
      console.log('📝 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transfer to hospital confirmed:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('❌ Error transferring to hospital:', error);
      throw error;
    }
  };

  // Get batches for hospital
  const getHospitalBatches = async (hospitalAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log('🔍 Getting batches for hospital:', hospitalAddress);
      const allBatches = await getAllBatches();
      console.log('🔍 All batches received:', allBatches);
      
      const filtered = allBatches.filter(batch => {
        const holderMatches = batch.currentHolder.toLowerCase() === hospitalAddress.toLowerCase();
        const statusMatches = (batch.status === 2 || batch.status === '2' || Number(batch.status) === 2);
        
        console.log(`🔍 Hospital batch #${batch.id}:`, {
          holder: batch.currentHolder,
          holderMatches,
          status: batch.status,
          statusType: typeof batch.status,
          statusMatches,
          included: holderMatches && statusMatches
        });
        
        return holderMatches && statusMatches;
      });
      
      console.log('✅ Filtered hospital batches:', filtered);
      
      return filtered;
    } catch (error) {
      console.error('❌ Error getting hospital batches:', error);
      throw error;
    }
  };

  // Get transfer history for a specific account
  const getTransferHistory = async (accountAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log('🔍 Getting transfer history for:', accountAddress);
      const allBatches = await getAllBatches();
      
      // Filter batches that were ever held by this account
      const history = allBatches.filter(batch => 
        batch.manufacturer.toLowerCase() === accountAddress.toLowerCase() ||
        batch.currentHolder.toLowerCase() === accountAddress.toLowerCase()
      ).map(batch => ({
        ...batch,
        transferType: batch.manufacturer.toLowerCase() === accountAddress.toLowerCase() ? 'created' : 'received'
      }));
      
      console.log('✅ Transfer history:', history);
      return history;
    } catch (error) {
      console.error('❌ Error getting transfer history:', error);
      throw error;
    }
  };

  // Get batches dispensed to a patient
  const getPatientBatches = async (patientAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      console.log('🔍 Getting batches for patient:', patientAddress);
      
      // Get the batch IDs that have been dispensed to this patient
      const patientBatchIds = await contract.getPatientBatches(patientAddress);
      console.log('🔍 Patient batch IDs from contract:', patientBatchIds);
      
      if (patientBatchIds.length === 0) {
        console.log('📝 No batches found for patient');
        return [];
      }
      
      // Get full batch details for each ID
      const patientBatches = [];
      for (const batchId of patientBatchIds) {
        try {
          const batch = await contract.getDrugBatch(batchId);
          const formattedBatch = {
            id: batch.batchId.toString(),
            drugName: batch.drugName,
            manufacturer: batch.manufacturer,
            quantity: batch.quantity.toString(),
            manufactureDate: batch.manufactureDate.toString(),
            expiryDate: batch.expiryDate.toString(),
            status: Number(batch.status),
            currentHolder: batch.currentHolder,
            ipfsHash: batch.ipfsHash,
            merkleRoot: batch.merkleRoot
          };
          
          console.log(`✅ Retrieved batch #${batchId} for patient:`, formattedBatch);
          patientBatches.push(formattedBatch);
        } catch (error) {
          console.error(`❌ Error getting batch #${batchId}:`, error);
        }
      }
      
      console.log('✅ All patient batches retrieved:', patientBatches);
      return patientBatches;
    } catch (error) {
      console.error('❌ Error getting patient batches:', error);
      throw error;
    }
  };

  const value = {
    contract,
    loading,
    userRole,
    checkUserRole,
    grantRole,
    registerHospital,
    createDrugBatch,
    createBatch, // Compatibility wrapper
    getAllBatches,
    getManufacturerBatches,
    getDistributorBatches,
    getHospitalBatches,
    getCurrentBatchId,
    transferToDistributor,
    transferToHospital,
    transferBatch, // Compatibility wrapper
    getTransferHistory,
    getPatientBatches,
    dispenseToPatient,
    setupPatientRoles,
    setupAllRoles,
    verifyDrug,
    verifyAndLog,
    requestDrugs,
    // New distributor-manufacturer request functions
    requestFromManufacturer,
    approveDistributorRequest,
    rejectDistributorRequest,
    getDistributorRequest,
    getDistributorRequests,
    getManufacturerRequests,
    approveRequest,
    rejectRequest,
    addWHOApprovedDrug,
    removeWHOApprovedDrug,
    isWHOApproved,
    reportExpiredDrug,
    updateHealthRecord,
    getHealthRecord,
    getDrugBatch,
    getHospital,
    getDrugRequest,
    listenToEvents,
    forceReinitialize
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
