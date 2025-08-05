import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import { Header } from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import DrugVerification from './pages/DrugVerification';
import AdminDashboard from './pages/AdminDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import PatientDashboard from './pages/PatientDashboard';
import HealthRecords from './pages/HealthRecords';
import DemandForecastingPage from './pages/DemandForecastingPage';
import LoginPage from './pages/LoginPage';
import DashboardSelector from './pages/DashboardSelector';
import DispenseManagement from './pages/DispenseManagement';
import SmartRedistribution from './pages/SmartRedistribution';
import QRScannerPage from './pages/QRScannerPage';
import WalletConnectHelper from './components/WalletConnectHelper';
import NetworkSwitch from './components/NetworkSwitch';
import ErrorBoundary from './components/ErrorBoundary';
// Removed unused imports to fix warnings

function App() {
  return (
    <ErrorBoundary>
      <div className="App min-h-screen bg-surface-50 relative">
        <Router>
          <LanguageProvider>
            <AuthProvider>
              <WalletProvider>
                <ContractProvider>
                  <div className="flex flex-col min-h-screen relative z-10">
                    <Header />
                    <NetworkSwitch />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/verify" element={<DrugVerification />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/manufacturer" element={<ManufacturerDashboard />} />
                        <Route path="/distributor" element={<DistributorDashboard />} />
                        <Route path="/hospital" element={<HospitalDashboard />} />
                        <Route path="/patient" element={<PatientDashboard />} />
                        <Route path="/health-records" element={<HealthRecords />} />
                        <Route path="/forecasting" element={<DemandForecastingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={<DashboardSelector />} />
                        <Route path="/dispense" element={<DispenseManagement />} />
                        <Route path="/smart-redistribution" element={<SmartRedistribution />} />
                        <Route path="/scan" element={<QRScannerPage />} />
                        <Route path="/wallet-help" element={<WalletConnectHelper />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </ContractProvider>
              </WalletProvider>
            </AuthProvider>
          </LanguageProvider>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;
