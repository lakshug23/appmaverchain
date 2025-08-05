import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import MagicLoader from '../components/MagicLoader';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import BackButton from '../components/BackButton';

const SmartRedistribution = () => {
  const { account } = useWallet();
  const { getRedistributionData, triggerRedistribution } = useContract();
  const [redistributionData, setRedistributionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    if (account) {
      loadRedistributionData();
    }
  }, [account]);

  const loadRedistributionData = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const data = await getRedistributionData(account);
      setRedistributionData(data);
    } catch (error) {
      console.error('❌ Error loading redistribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRedistribution = async () => {
    if (!selectedRegion) return;

    try {
      setLoading(true);
      await triggerRedistribution(selectedRegion);
      await loadRedistributionData();
      alert('Redistribution triggered successfully!');
    } catch (error) {
      console.error('❌ Error triggering redistribution:', error);
      alert('Error triggering redistribution: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const regions = [
    'North Region',
    'South Region',
    'East Region',
    'West Region',
    'Central Region'
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl mb-8 border border-white/20">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">🚚 Smart Redistribution</h1>
                  <p className="text-lg text-white/80 mb-4">
                    Automated stockout detection and route optimization
                  </p>
                  {account && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <BackButton />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">Redistribution</div>
                    <div className="text-white/70">Logistics AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem" maxWidth="100%" padding="2rem">
            {/* Redistribution Control */}
            <GlowingCard glowColor="#f59e0b" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                Trigger Redistribution
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Select Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white backdrop-blur-sm"
                  >
                    <option value="">Choose a region...</option>
                    {regions.map((region, index) => (
                      <option key={index} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleTriggerRedistribution}
                  disabled={loading || !selectedRegion}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Trigger Redistribution'
                  )}
                </button>
              </div>
            </GlowingCard>

            {/* Redistribution Status */}
            <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Redistribution Status
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={loadRedistributionData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      Loading...
                    </div>
                  ) : (
                    'Refresh Status'
                  )}
                </button>
                
                {loading && !redistributionData ? (
                  <div className="text-center py-8">
                    <MagicLoader size={48} particleCount={3} speed={0.8} className="mb-4" />
                    <p className="text-white/60">Loading redistribution data...</p>
                  </div>
                ) : redistributionData ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                      <h3 className="text-green-300 font-bold mb-2">✅ System Active</h3>
                      <p className="text-green-200">Smart redistribution system is monitoring supply chain</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-white">{redistributionData.activeRoutes || 'N/A'}</div>
                        <div className="text-white/60 text-sm">Active Routes</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-white">{redistributionData.optimizedDeliveries || 'N/A'}</div>
                        <div className="text-white/60 text-sm">Optimized Deliveries</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-white">{redistributionData.stockoutsPrevented || 'N/A'}</div>
                        <div className="text-white/60 text-sm">Stockouts Prevented</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-white">{redistributionData.efficiencyGain || 'N/A'}%</div>
                        <div className="text-white/60 text-sm">Efficiency Gain</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 text-6xl mb-4">🚚</div>
                    <h3 className="text-lg font-medium text-white mb-2">No redistribution data</h3>
                    <p className="text-white/60">Redistribution data will appear here once available.</p>
                  </div>
                )}
              </div>
            </GlowingCard>

            {/* Route Optimization */}
            <GlowingCard glowColor="#3b82f6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                Route Optimization
              </h2>
              
              <div className="space-y-4">
                <p className="text-white/80 text-sm">
                  AI-powered route optimization for efficient drug distribution.
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h3 className="font-bold text-white mb-3">Optimization Features</h3>
                  <div className="space-y-2 text-white/80 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Real-time traffic analysis</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Weather impact assessment</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Fuel efficiency optimization</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Delivery time prediction</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Dynamic route adjustment</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlowingCard>

            {/* Analytics */}
            <GlowingCard glowColor="#8b5cf6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Analytics Dashboard
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-white/60 text-sm">Delivery Success</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-white">23%</div>
                  <div className="text-white/60 text-sm">Cost Reduction</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-white">2.4h</div>
                  <div className="text-white/60 text-sm">Avg Delivery Time</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <div className="text-white/60 text-sm">Routes Optimized</div>
                </div>
              </div>
            </GlowingCard>
          </GlowingCards>
        </div>
      </div>
    </div>
  );
};

export default SmartRedistribution; 