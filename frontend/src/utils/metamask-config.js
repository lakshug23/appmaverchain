export const HARDHAT_NETWORK_CONFIG = {
  chainId: '0x7A69', // 31337 in hex
  chainName: 'Hardhat Localhost',
  rpcUrls: ['http://localhost:8545'],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  blockExplorerUrls: ['http://localhost:8545']
};

export const addHardhatNetwork = async (ethereum) => {
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [HARDHAT_NETWORK_CONFIG]
    });
    return true;
  } catch (error) {
    console.error('Error adding Hardhat network:', error);
    return false;
  }
};

export const switchToHardhatNetwork = async (ethereum) => {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_NETWORK_CONFIG.chainId }]
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      // Network doesn't exist, add it
      return await addHardhatNetwork(ethereum);
    }
    console.error('Error switching to Hardhat network:', error);
    return false;
  }
}; 