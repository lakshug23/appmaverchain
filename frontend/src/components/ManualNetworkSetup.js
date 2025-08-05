import React, { useState } from 'react';

const ManualNetworkSetup = ({ onClose }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const networkConfig = {
    networkName: 'Hardhat Localhost',
    rpcUrl: 'http://localhost:8545',
    chainId: '31337',
    currencySymbol: 'ETH',
    blockExplorerUrl: 'http://localhost:8545'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4">Manual Network Setup</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            If automatic network switching fails, please add the network manually in MetaMask:
          </p>
          
          <div className="bg-gray-100 p-3 rounded">
            <div className="space-y-2 text-sm">
              <div><strong>Network Name:</strong> {networkConfig.networkName}</div>
              <div><strong>RPC URL:</strong> {networkConfig.rpcUrl}</div>
              <div><strong>Chain ID:</strong> {networkConfig.chainId}</div>
              <div><strong>Currency Symbol:</strong> {networkConfig.currencySymbol}</div>
              <div><strong>Block Explorer URL:</strong> {networkConfig.blockExplorerUrl}</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Steps:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Open MetaMask</li>
              <li>Click the network dropdown</li>
              <li>Select "Add Network"</li>
              <li>Enter the details above</li>
              <li>Click "Save"</li>
            </ol>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualNetworkSetup; 