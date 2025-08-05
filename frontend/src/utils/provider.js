import { ethers } from 'ethers';

// Create a provider configuration that disables ENS resolution
export const createProvider = (ethereumProvider) => {
  // Create a custom provider that doesn't support ENS
  const provider = new ethers.BrowserProvider(ethereumProvider);
  
  // Completely disable ENS resolution
  provider.resolveName = async (name) => {
    // Always return the name as-is, never try to resolve ENS
    console.log('🔧 ENS resolution disabled, returning name as-is:', name);
    return name;
  };
  
  // Override any ENS-related methods
  provider.getResolver = async (name) => {
    console.log('🔧 ENS resolver disabled for:', name);
    return null;
  };
  
  return provider;
};

// Create a signer with ENS disabled
export const createSigner = (provider) => {
  return provider.getSigner();
}; 