import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const WalletConnectHelper = () => {
  const { connectWallet, account } = useWallet();
  const [connecting, setConnecting] = useState(false);

  const hospitalAccount = {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    name: 'City General Hospital'
  };

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error('Connection error:', error);
      alert('Connection failed: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          🏥 Hospital Wallet Connection Helper
        </h1>
        
        {account ? (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
              <h2 className="text-green-400 font-semibold mb-2">✅ Wallet Connected!</h2>
              <p className="text-white">
                Connected as: <code className="bg-black/30 px-2 py-1 rounded">{account.address}</code>
              </p>
            </div>
            <a 
              href="/hospital" 
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Go to Hospital Dashboard →
            </a>
          </div>
        ) : (
          <div>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <h2 className="text-yellow-400 font-semibold mb-2">⚠️ Wallet Not Connected</h2>
              <p className="text-white text-sm">
                You need to import the hospital account into MetaMask first.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Step 1: Import Hospital Account</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Copy this private key and import it into MetaMask:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="bg-black/30 text-green-400 px-3 py-2 rounded flex-1 text-sm break-all">
                    {hospitalAccount.privateKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(hospitalAccount.privateKey)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Step 2: Add Hardhat Network</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Add this network to MetaMask:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Network Name:</span>
                    <div className="bg-black/30 text-white px-2 py-1 rounded">Hardhat Local</div>
                  </div>
                  <div>
                    <span className="text-gray-400">RPC URL:</span>
                    <div className="bg-black/30 text-white px-2 py-1 rounded">http://127.0.0.1:8545</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Chain ID:</span>
                    <div className="bg-black/30 text-white px-2 py-1 rounded">31337</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Currency:</span>
                    <div className="bg-black/30 text-white px-2 py-1 rounded">ETH</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Step 3: Connect Wallet</h3>
                <p className="text-gray-300 text-sm mb-3">
                  After importing the account and adding the network, click connect:
                </p>
                <button
                  onClick={handleConnectWallet}
                  disabled={connecting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-300"
                >
                  {connecting ? 'Connecting...' : 'Connect Hospital Wallet'}
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Expected Hospital Address: <br />
                <code className="text-green-400">{hospitalAccount.address}</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectHelper;
