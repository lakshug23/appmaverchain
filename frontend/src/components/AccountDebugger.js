import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { useContract } from '../contexts/ContractContext';

const AccountDebugger = () => {
  const { account, network } = useWallet();
  const { user, authType } = useAuth();
  const { userRole } = useContract();

  const adminAccount = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
  const manufacturerAccount = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
  const distributorAccount = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';
  const hospitalAccount = '0x90f79bf6eb2c4f870365e785982e1f101e93b906';
  const patientAccount = '0x15d34aaf54267db7d7c367839aa71a002c6a65';

  const isAdmin = account?.toLowerCase() === adminAccount.toLowerCase();
  const isManufacturer = account?.toLowerCase() === manufacturerAccount.toLowerCase();
  const isDistributor = account?.toLowerCase() === distributorAccount.toLowerCase();
  const isHospital = account?.toLowerCase() === hospitalAccount.toLowerCase();
  const isPatient = account?.toLowerCase() === patientAccount.toLowerCase();

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg max-w-md">
      <h3 className="font-bold mb-2">Account Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>Current Account:</strong> {account || 'Not connected'}</div>
        <div><strong>Network:</strong> {network?.chainId || 'Unknown'}</div>
        <div><strong>Auth Type:</strong> {authType || 'None'}</div>
        <div><strong>User Role (Auth):</strong> {user?.role || 'None'}</div>
        <div><strong>User Role (Contract):</strong> {userRole || 'None'}</div>
        <div><strong>Is Admin Account:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Is Manufacturer:</strong> {isManufacturer ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Is Distributor:</strong> {isDistributor ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Is Hospital:</strong> {isHospital ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Is Patient:</strong> {isPatient ? '✅ Yes' : '❌ No'}</div>
      </div>
      <div className="mt-2 text-xs">
        <div><strong>Admin Account:</strong> {adminAccount}</div>
        <div><strong>Manufacturer Account:</strong> {manufacturerAccount}</div>
        <div><strong>Distributor Account:</strong> {distributorAccount}</div>
        <div><strong>Hospital Account:</strong> {hospitalAccount}</div>
        <div><strong>Patient Account:</strong> {patientAccount}</div>
      </div>
    </div>
  );
};

export default AccountDebugger; 