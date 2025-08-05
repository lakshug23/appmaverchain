/**
 * Mock Blockchain Service for Development
 * This module provides mock implementations of blockchain functions
 * that are not yet available in the deployed contract
 */

import { ethers } from 'ethers';

// Mock storage for simulation
const mockStorage = {
  distributorRequests: {},
  nextRequestId: 1,
  requests: []
};

/**
 * Simulate a blockchain transaction 
 * @returns {Object} A mock transaction object
 */
const createMockTransaction = () => {
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  return {
    hash: txHash,
    wait: () => Promise.resolve({ 
      status: 1,
      events: [{
        event: 'DistributorRequestCreated',
        args: {
          requestId: mockStorage.nextRequestId,
          distributor: ethers.ZeroAddress,
          manufacturer: ethers.ZeroAddress,
          drugName: 'Mock Drug',
          quantity: 100
        }
      }]
    })
  };
};

/**
 * Mock implementation of requestFromManufacturer function
 * @param {string} manufacturerAddress - Address of manufacturer
 * @param {string} drugName - Name of drug
 * @param {number} quantity - Quantity requested
 * @param {string} reason - Reason for request
 * @param {string} urgencyLevel - Urgency level
 * @param {number} proposedPrice - Proposed price
 * @returns {Promise<Object>} A mock transaction
 */
export const mockRequestFromManufacturer = async (
  manufacturerAddress,
  drugName,
  quantity,
  reason,
  urgencyLevel,
  proposedPrice = 0
) => {
  console.log('📱 Using mock blockchain for requestFromManufacturer');
  console.log('Parameters:', { manufacturerAddress, drugName, quantity, reason, urgencyLevel, proposedPrice });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create mock request
  const requestId = mockStorage.nextRequestId++;
  const timestamp = Math.floor(Date.now() / 1000);
  
  const request = {
    requestId,
    distributor: window.ethereum?.selectedAddress || ethers.ZeroAddress,
    manufacturer: manufacturerAddress,
    drugName,
    quantity,
    status: 0, // Pending
    timestamp,
    reason,
    urgencyLevel,
    proposedPrice
  };
  
  // Store in mock storage
  mockStorage.requests.push(request);
  
  if (!mockStorage.distributorRequests[request.distributor]) {
    mockStorage.distributorRequests[request.distributor] = [];
  }
  mockStorage.distributorRequests[request.distributor].push(requestId);
  
  return createMockTransaction();
};

/**
 * Mock implementation of getDistributorRequests function
 * @param {string} distributorAddress - Address of distributor
 * @returns {Promise<Array>} Array of request IDs
 */
export const mockGetDistributorRequests = async (distributorAddress) => {
  console.log('📱 Using mock blockchain for getDistributorRequests');
  console.log('Distributor:', distributorAddress);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock requests for this distributor or empty array
  return mockStorage.distributorRequests[distributorAddress] || [];
};

/**
 * Mock implementation of getDistributorRequest function
 * @param {number} requestId - Request ID to get
 * @returns {Promise<Object>} Request details
 */
export const mockGetDistributorRequest = async (requestId) => {
  console.log('📱 Using mock blockchain for getDistributorRequest');
  console.log('Request ID:', requestId);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find request by ID
  const request = mockStorage.requests.find(r => r.requestId === requestId);
  if (!request) {
    throw new Error(`Request with ID ${requestId} not found`);
  }
  
  return request;
};

/**
 * Apply mock implementations to a contract instance
 * @param {Object} contract - The ethers.js contract instance
 * @returns {Object} Enhanced contract with mock methods
 */
export const enhanceContractWithMocks = (contract) => {
  if (!contract) return null;
  
  // Create a proxy to the original contract
  const enhancedContract = new Proxy(contract, {
    get: function(target, prop) {
      // If the property exists on the contract, return it
      if (prop in target) {
        return target[prop];
      }
      
      // Otherwise, return appropriate mock implementation
      switch (prop) {
        case 'requestFromManufacturer':
          return mockRequestFromManufacturer;
        case 'getDistributorRequests':
          return mockGetDistributorRequests;
        case 'getDistributorRequest':
          return mockGetDistributorRequest;
        default:
          return undefined;
      }
    }
  });
  
  return enhancedContract;
};

export default {
  enhanceContractWithMocks,
  mockRequestFromManufacturer,
  mockGetDistributorRequests,
  mockGetDistributorRequest
};
