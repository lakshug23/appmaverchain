import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import MagicLoader from '../components/MagicLoader';
import PatientDashboard from './PatientDashboard';

const DashboardSelector = () => {
  const { user, authType, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardOptions = () => {
    if (authType === 'wallet') {
      switch (user?.role) {
        case 'manufacturer':
          return [
            {
              title: 'Manufacturer Dashboard',
              description: 'Create batches, generate QR codes, manage production',
              path: '/manufacturer',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'blue',
              glowColor: '#3b82f6'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
              color: 'green',
              glowColor: '#10b981'
            },
            {
              title: 'Demand Forecasting',
              description: 'AI-powered demand analytics and forecasting',
              path: '/forecasting',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              color: 'purple',
              glowColor: '#8b5cf6'
            },
            {
              title: 'Smart Redistribution',
              description: 'Automated stockout detection and route optimization',
              path: '/redistribution',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
              color: 'orange',
              glowColor: '#f59e0b'
            }
          ];
        case 'distributor':
          return [
            {
              title: 'Distributor Dashboard',
              description: 'Manage transfers, track inventory, handle logistics',
              path: '/distributor',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
              color: 'orange',
              glowColor: '#f59e0b'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: '🔍',
              color: 'green',
              glowColor: '#10b981'
            },
            {
              title: 'Demand Forecasting',
              description: 'AI-powered demand analytics and forecasting',
              path: '/forecasting',
              icon: '📊',
              color: 'purple',
              glowColor: '#8b5cf6'
            },
            {
              title: 'Smart Redistribution',
              description: 'Automated stockout detection and route optimization',
              path: '/redistribution',
              icon: '🚚',
              color: 'orange',
              glowColor: '#f59e0b'
            }
          ];
        case 'hospital':
          return [
            {
              title: 'Hospital Dashboard',
              description: 'Dispense drugs, manage patients, track usage',
              path: '/hospital',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'red',
              glowColor: '#ef4444'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: '🔍',
              color: 'green',
              glowColor: '#10b981'
            },
            {
              title: 'Demand Forecasting',
              description: 'View demand forecasts and analytics',
              path: '/forecasting',
              icon: '📊',
              color: 'purple',
              glowColor: '#8b5cf6'
            },
            {
              title: 'Smart Redistribution',
              description: 'View redistribution routes and network status',
              path: '/redistribution',
              icon: '🚚',
              color: 'orange',
              glowColor: '#f59e0b'
            }
          ];
        case 'admin':
          return [
            {
              title: 'Admin Dashboard',
              description: 'System administration and management',
              path: '/admin',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              color: 'purple',
              glowColor: '#8b5cf6'
            },
            {
              title: 'Manufacturer Dashboard',
              description: 'Create batches, generate QR codes, manage production',
              path: '/manufacturer',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'blue',
              glowColor: '#3b82f6'
            },
            {
              title: 'Distributor Dashboard',
              description: 'Manage transfers, track inventory, handle logistics',
              path: '/distributor',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
              color: 'orange',
              glowColor: '#f59e0b'
            },
            {
              title: 'Hospital Dashboard',
              description: 'Dispense drugs, manage patients, track usage',
              path: '/hospital',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              color: 'red',
              glowColor: '#ef4444'
            },
            {
              title: 'Patient Dashboard',
              description: 'Patient management and services',
              path: '/patient',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
              color: 'green',
              glowColor: '#10b981'
            },
            {
              title: 'Drug Verification',
              description: 'Verify and track drug batches',
              path: '/verify',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
              color: 'green',
              glowColor: '#10b981'
            },
            {
              title: 'Demand Forecasting',
              description: 'AI-powered demand analytics and forecasting',
              path: '/forecasting',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              color: 'purple',
              glowColor: '#8b5cf6'
            },
            {
              title: 'Smart Redistribution',
              description: 'Automated stockout detection and route optimization',
              path: '/redistribution',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
              color: 'orange',
              glowColor: '#f59e0b'
            },
            {
              title: 'Health Records',
              description: 'Manage patient health records and data',
              path: '/health-records',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
              color: 'blue',
              glowColor: '#3b82f6'
            }
          ];
        case 'patient':
          // Return null to indicate we want to render the PatientDashboard component instead
          return null;
        default:
          return [];
      }
    } else {
      // Public users (email/guest) only get verification access
      return [
        {
          title: 'Drug Verification',
          description: 'Scan QR codes and verify drug authenticity',
          path: '/verify',
          icon: '🔍',
          color: 'green',
          glowColor: '#10b981'
        }
      ];
    }
  };

  const dashboardOptions = getDashboardOptions();

  // If user is a patient, render the PatientDashboard directly
  if (authType === 'wallet' && user?.role === 'patient') {
    return <PatientDashboard />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        >
          <source src="/assets/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">MaverChain Dashboard</h1>
              <p className="text-xl text-white/80 mb-8">Welcome back!</p>
            </div>
            
            {/* User Info Card */}
            <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 p-6 max-w-md mx-auto mb-12">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="font-bold text-white text-lg">{user?.name || user?.email}</p>
                  <p className="text-white/80 capitalize">
                    {authType === 'wallet' ? `${user?.role} (Wallet)` : `${user?.role} (${authType})`}
                  </p>
                  {authType === 'wallet' && (
                    <p className="text-white/60 font-mono text-sm">
                      {user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}
                    </p>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Options */}
          <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem" maxWidth="100%" padding="2rem">
            {dashboardOptions.map((option, index) => (
              <GlowingCard 
                key={index}
                glowColor={option.glowColor}
                className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => navigate(option.path)}
              >
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                      {typeof option.icon === 'string' ? (
                        <span className="text-2xl">{option.icon}</span>
                      ) : (
                        <div className="text-white">{option.icon}</div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{option.title}</h3>
                  <p className="text-white/80 text-sm">{option.description}</p>
                </div>
              </GlowingCard>
            ))}
          </GlowingCards>

          {/* Additional Info for Supply Chain Users */}
          {authType === 'wallet' && (
            <div className="mt-12 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Your Permissions</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {user?.permissions?.map((permission, index) => (
                  <div key={index} className="flex items-center text-white/80">
                    <span className="text-green-400 mr-3 text-lg">✓</span>
                    <span className="capitalize">{permission.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions for Public Users */}
          {authType !== 'wallet' && (
            <div className="mt-12 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">What you can do</h3>
              <div className="space-y-4">
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3 text-lg">✓</span>
                  <span>Scan QR codes to verify drug authenticity</span>
                </div>
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3 text-lg">✓</span>
                  <span>View basic supply chain information</span>
                </div>
                <div className="flex items-center text-white/80">
                  <span className="text-green-400 mr-3 text-lg">✓</span>
                  <span>Check expiration dates and batch details</span>
                </div>
                {authType === 'guest' && (
                  <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      <strong>Tip:</strong> Create an account with email for enhanced features and tracking history.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector;
