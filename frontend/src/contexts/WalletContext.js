import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createProvider, createSigner } from '../utils/provider';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);

  const initializeWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('🔧 Initializing wallet...');
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
        
        console.log('✅ Wallet initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing wallet:', error);
      }
    }
  };

  useEffect(() => {
    initializeWallet();
    // Auto-check for existing connection on load
    const autoConnect = async () => {
      try {
        await checkConnection();
        // If no connection found, don't auto-connect (user should click button)
      } catch (error) {
        console.log('Auto-connection check failed:', error);
      }
    };
    setTimeout(autoConnect, 500);
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) {
      console.log('❌ MetaMask not installed');
      return;
    }

    try {
      console.log('🔍 Checking existing connection...');
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        console.log('✅ Found existing connection:', accounts[0]);
        
        const provider = createProvider(window.ethereum);
        const signer = await createSigner(provider);
        const network = await provider.getNetwork();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
        setNetwork(network);
        setIsConnected(true);
        
        console.log('✅ Connection restored successfully');
      } else {
        console.log('❌ No existing connection found');
      }
    } catch (error) {
      console.log('❌ Error checking connection:', error.message);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      setIsConnecting(true);
      console.log('🔗 Starting wallet connection...');
      
      // Step 1: Request account access
      console.log('📋 Requesting account access...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }
      console.log('✅ Account access granted:', accounts[0]);
      
      // Step 2: Create provider and get network info
      console.log('🌐 Creating provider...');
      const provider = createProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log('🌐 Current network:', network);
      
      // Step 3: Check if we're on the correct network
      if (network.chainId !== 31337n) {
        console.log('🔄 Not on localhost, attempting to switch...');
        try {
          await switchNetwork(31337);
          console.log('✅ Successfully switched to localhost network');
        } catch (switchError) {
          console.log('⚠️ Switch failed, trying to add network...', switchError);
          
          if (switchError.code === 4902) {
            try {
              await addNetwork({
                chainId: '0x7A69',
                chainName: 'Hardhat Localhost',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18
                },
                blockExplorerUrls: []
              });
              console.log('✅ Successfully added localhost network');
            } catch (addError) {
              console.error('❌ Failed to add network:', addError);
              throw new Error('Failed to add localhost network. Please add it manually in MetaMask.');
            }
          } else {
            throw new Error('Please switch to Hardhat Localhost network in MetaMask.');
          }
        }
      } else {
        console.log('✅ Already on localhost network');
      }
      
      // Step 4: Get signer and finalize connection
      console.log('🔐 Getting signer...');
      const signer = await createSigner(provider);
      const address = await signer.getAddress();
      const updatedNetwork = await provider.getNetwork();
      
      // Step 5: Update state
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setNetwork(updatedNetwork);
      setIsConnected(true);
      
      console.log('🎉 Wallet connected successfully:', address);
      console.log('🌐 Connected to network:', updatedNetwork);
      return address;
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setNetwork(null);
    setBalance(null);
    console.log('🔌 Wallet disconnected');
  };

  const updateBalance = async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(balance);
        return balance;
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      console.log('Account changed to:', accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const switchNetwork = async (chainId) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Convert chainId to hex if it's a number
    const hexChainId = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId;

    try {
      console.log(`🔄 Switching to network with chainId: ${chainId}`);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      
      console.log(`✅ Successfully switched to network: ${chainId}`);
      
      // Update the provider and network state
      const provider = createProvider(window.ethereum);
      const network = await provider.getNetwork();
      setProvider(provider);
      setNetwork(network);
      
      return true;
    } catch (error) {
      console.error(`❌ Error switching network to ${chainId}:`, error);
      
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        console.log(`➕ Network ${chainId} not found, attempting to add it...`);
        return await addNetwork({
          chainId: hexChainId,
          chainName: 'Hardhat Localhost',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          blockExplorerUrls: []
        });
      }
      
      throw error;
    }
  };

  const addNetwork = async (networkParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      console.log('➕ Adding network to MetaMask:', networkParams);
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams],
      });
      
      console.log('✅ Successfully added network to MetaMask');
      
      // Update the provider and network state
      const provider = createProvider(window.ethereum);
      const network = await provider.getNetwork();
      setProvider(provider);
      setNetwork(network);
      
      return true;
    } catch (error) {
      console.error('❌ Error adding network:', error);
      throw error;
    }
  };

  const getShortAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isConnecting,
    network,
    balance,
    connectWallet,
    disconnectWallet,
    updateBalance,
    switchNetwork,
    addNetwork,
    getShortAddress
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
