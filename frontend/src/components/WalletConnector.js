import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const WalletConnector = () => {
  const { connectWallet, isConnected, account, isConnecting } = useWallet();
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setError('');
      await connectWallet();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isConnected && account) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        ✅ Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <div className="mb-2">
        ⚠️ Please connect your wallet to use admin functions
      </div>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
      </button>
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          ❌ {error}
        </div>
      )}
      <div className="mt-2 text-sm">
        <strong>Setup Instructions:</strong>
        <ol className="list-decimal list-inside mt-1">
          <li>Install MetaMask browser extension</li>
          <li>Add Hardhat network: RPC URL: http://127.0.0.1:8545, Chain ID: 31337</li>
          <li>Import admin account with private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</li>
          <li>Click "Connect MetaMask" above</li>
        </ol>
      </div>
    </div>
  );
};

export default WalletConnector;
