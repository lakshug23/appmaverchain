import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

const DashboardTest = () => {
  const { user, authType, isAuthenticated } = useAuth();
  const { account, network } = useWallet();
  const { userRole } = useContract();

  const testRedirect = () => {
    console.log('🧪 Test redirect clicked');
    console.log('🧪 Auth type:', authType);
    console.log('🧪 Is authenticated:', isAuthenticated());
    console.log('🧪 User:', user);
    console.log('🧪 Account:', account);
    console.log('🧪 Network:', network);
    console.log('🧪 User role (contract):', userRole);
    
    // Test navigation
    window.location.href = '/admin';
  };

  return (
    <div className="fixed top-20 right-4 z-50 bg-red-500 text-white p-4 rounded-lg">
      <h3 className="font-bold mb-2">Dashboard Test</h3>
      <div className="text-xs space-y-1 mb-3">
        <div>Auth: {authType || 'None'}</div>
        <div>User Role: {user?.role || 'None'}</div>
        <div>Contract Role: {userRole || 'None'}</div>
        <div>Account: {account?.slice(0, 10)}...</div>
      </div>
      <button 
        onClick={testRedirect}
        className="bg-white text-red-500 px-3 py-1 rounded text-sm font-bold"
      >
        Test Admin Redirect
      </button>
    </div>
  );
};

export default DashboardTest; 