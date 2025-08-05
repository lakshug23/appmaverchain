// Quick diagnostic script for the frontend
// Add this temporarily to check what's happening

console.log('🔍 DIAGNOSTIC: Starting wallet and contract checks...');

// Check if window.ethereum exists
if (typeof window !== 'undefined') {
  console.log('🔍 DIAGNOSTIC: window.ethereum exists:', !!window.ethereum);
  
  if (window.ethereum) {
    console.log('🔍 DIAGNOSTIC: ethereum.isMetaMask:', window.ethereum.isMetaMask);
    console.log('🔍 DIAGNOSTIC: ethereum.selectedAddress:', window.ethereum.selectedAddress);
    console.log('🔍 DIAGNOSTIC: ethereum.chainId:', window.ethereum.chainId);
  }
} else {
  console.log('🔍 DIAGNOSTIC: Running in Node.js environment');
}

// Export for debugging
export const runDiagnostic = async () => {
  console.log('🔍 DIAGNOSTIC: Running manual diagnostic...');
  
  try {
    if (!window.ethereum) {
      console.error('❌ DIAGNOSTIC: MetaMask not found!');
      return;
    }
    
    // Check connection
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log('🔍 DIAGNOSTIC: Connected accounts:', accounts);
    
    // Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('🔍 DIAGNOSTIC: Current chain ID:', chainId);
    
    // Test if we can connect to localhost:8545
    const response = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'net_version',
        params: [],
        id: 1
      })
    });
    
    const result = await response.json();
    console.log('🔍 DIAGNOSTIC: Direct RPC call result:', result);
    
  } catch (error) {
    console.error('❌ DIAGNOSTIC: Error during diagnostic:', error);
  }
};
