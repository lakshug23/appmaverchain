import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { switchToHardhatNetwork } from '../utils/metamask-config';
import ManualNetworkSetup from './ManualNetworkSetup';

const NetworkSwitch = () => {
  const { network, switchNetwork, addNetwork } = useWallet();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showManualSetup, setShowManualSetup] = useState(false);

  // Auto-hide when network is correct
  useEffect(() => {
    if (network && (network.chainId === 31337n || network.chainId === '0x7A69')) {
      // Network is correct, component will be hidden
    }
  }, [network]);

  const switchToLocalhost = async () => {
    setIsSwitching(true);
    try {
      console.log('🔄 Switching to localhost network...');
      const success = await switchToHardhatNetwork(window.ethereum);
      if (success) {
        console.log('✅ Successfully switched to localhost network');
        // Force a page refresh to update the network state
        window.location.reload();
      } else {
        alert('Failed to switch network. Please add it manually in MetaMask:\n\nNetwork Name: Hardhat Localhost\nRPC URL: http://localhost:8545\nChain ID: 31337\nCurrency Symbol: ETH');
      }
    } catch (error) {
      console.error('❌ Error switching network:', error);
      alert('Failed to switch network. Please switch to Hardhat Localhost manually in MetaMask.');
    } finally {
      setIsSwitching(false);
    }
  };

  // Don't show if already on localhost or if network is not available
  if (!network || network.chainId === 31337n || network.chainId === '0x7A69') {
    return null;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Please switch to Localhost network
              </p>
              <p className="text-xs mt-1">
                This application requires the localhost network (Chain ID: 31337)
              </p>
            </div>
            <div className="ml-auto pl-3 flex space-x-2">
              <button
                onClick={switchToLocalhost}
                disabled={isSwitching}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white text-xs font-medium px-3 py-1 rounded transition-colors"
              >
                {isSwitching ? 'Switching...' : 'Auto Switch'}
              </button>
              <button
                onClick={() => setShowManualSetup(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded transition-colors"
              >
                Manual
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showManualSetup && (
        <ManualNetworkSetup onClose={() => setShowManualSetup(false)} />
      )}
    </>
  );
};

export default NetworkSwitch; 