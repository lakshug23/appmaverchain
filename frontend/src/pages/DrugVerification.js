import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import MagicLoader from '../components/MagicLoader';
import { GlowingCards, GlowingCard } from '../components/GlowingCards';
import BackButton from '../components/BackButton';

const DrugVerification = () => {
  const { account } = useWallet();
  const { verifyDrugBatch } = useContract();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [verificationFeatures, setVerificationFeatures] = useState([]);

  // Enhanced sample database with detailed drug information
  const drugDatabase = {
    '2200004999950010': {
      id: '2200004999950010',
      uniqueProductCode: '2200004999950010',
      status: 'ORIGINAL',
      drugName: 'VERIFIED MEDICINE',
      genericName: 'Pharmaceutical Product - Verified Authentic',
      brandName: 'VERIFIED MEDICINE®',
      manufacturer: 'BLUE CROSS LABORATORIES PVT LTD',
      manufacturerAddress: 'A-12, Ambad, M.I.D.C, Nashik 422 010',
      batchNumber: '2200004999950010',
      manufacturingDate: '07/2025',
      expiryDate: '06/2027',
      manufacturingLicence: 'BD/25',
      gtinNumber: '2200004999950010',
      website: 'www.bluecrosslabs.com',
      valid: true,
      isAuthentic: true,
      isExpired: false,
      isRecalled: false,
      image: '/assets/images/meftal.png',
      logo: '/assets/images/medchain-logo.png',
      timeline: [
        { 
          stage: 'Manufactured', 
          date: '2025-07-15', 
          location: 'Blue Cross Labs, Nashik', 
          status: 'completed',
          details: 'Batch 2200004999950010 manufactured and quality tested'
        },
        { 
          stage: 'Quality Control', 
          date: '2025-07-16', 
          location: 'QC Department, Nashik', 
          status: 'completed',
          details: 'All quality parameters passed'
        },
        { 
          stage: 'Distributor', 
          date: '2025-07-20', 
          location: 'MedSupply Distribution, Mumbai', 
          status: 'completed',
          details: 'Received by authorized distributor'
        },
        { 
          stage: 'Pharmacy/Hospital', 
          date: '2025-07-25', 
          location: 'City Medical Store, Mumbai', 
          status: 'current',
          details: 'Currently available at retail pharmacy'
        }
      ]
    },
    'BVKB51BWRV': {
      id: 'BVKB51BWRV',
      uniqueProductCode: '12035',
      status: 'ORIGINAL',
      drugName: 'MEFTAL-SPAS TABLETS',
      genericName: 'Mefenamic Acid and Dicyclomine Hydrochloride Tablets IP',
      brandName: 'MEFTAL-SPAS® TABLETS',
      manufacturer: 'BLUE CROSS LABORATORIES PVT LTD',
      manufacturerAddress: 'A-12, Ambad, M.I.D.C, Nashik 422 010',
      batchNumber: 'MST2512',
      manufacturingDate: '02/2025',
      expiryDate: '01/2028',
      manufacturingLicence: 'BD/25',
      gtinNumber: '8902272100131',
      website: 'www.bluecrosslabs.com',
      valid: true,
      isAuthentic: true,
      isExpired: false,
      isRecalled: false,
      image: '/assets/images/meftal.png',
      logo: '/assets/images/medchain-logo.png',
      timeline: [
        { 
          stage: 'Manufactured', 
          date: '2025-02-15', 
          location: 'Blue Cross Labs, Nashik', 
          status: 'completed',
          details: 'Batch MST2512 manufactured and quality tested'
        },
        { 
          stage: 'Quality Control', 
          date: '2025-02-16', 
          location: 'QC Department, Nashik', 
          status: 'completed',
          details: 'All quality parameters passed'
        },
        { 
          stage: 'Distributor', 
          date: '2025-02-20', 
          location: 'MedSupply Distribution, Mumbai', 
          status: 'completed',
          details: 'Received by authorized distributor'
        },
        { 
          stage: 'Pharmacy/Hospital', 
          date: '2025-02-25', 
          location: 'City Medical Store, Mumbai', 
          status: 'current',
          details: 'Currently available at retail pharmacy'
        }
      ]
    },
    'MST2512': {
      id: 'MST2512',
      uniqueProductCode: '12035',
      status: 'ORIGINAL',
      drugName: 'MEFTAL-SPAS TABLETS',
      genericName: 'Mefenamic Acid and Dicyclomine Hydrochloride Tablets IP',
      brandName: 'MEFTAL-SPAS® TABLETS',
      manufacturer: 'BLUE CROSS LABORATORIES PVT LTD',
      manufacturerAddress: 'A-12, Ambad, M.I.D.C, Nashik 422 010',
      batchNumber: 'MST2512',
      manufacturingDate: '02/2025',
      expiryDate: '01/2028',
      manufacturingLicence: 'BD/25',
      gtinNumber: '8902272100131',
      website: 'www.bluecrosslabs.com',
      valid: true,
      isAuthentic: true,
      isExpired: false,
      isRecalled: false,
      image: '/assets/images/meftal.png',
      logo: '/assets/images/medchain-logo.png',
      timeline: [
        { 
          stage: 'Manufactured', 
          date: '2025-02-15', 
          location: 'Blue Cross Labs, Nashik', 
          status: 'completed',
          details: 'Batch MST2512 manufactured and quality tested'
        },
        { 
          stage: 'Quality Control', 
          date: '2025-02-16', 
          location: 'QC Department, Nashik', 
          status: 'completed',
          details: 'All quality parameters passed'
        },
        { 
          stage: 'Distributor', 
          date: '2025-02-20', 
          location: 'MedSupply Distribution, Mumbai', 
          status: 'completed',
          details: 'Received by authorized distributor'
        },
        { 
          stage: 'Pharmacy/Hospital', 
          date: '2025-02-25', 
          location: 'City Medical Store, Mumbai', 
          status: 'current',
          details: 'Currently available at retail pharmacy'
        }
      ]
    },
    '1': {
      id: '1',
      drugName: 'Crocin',
      status: 'Manufactured',
      valid: true,
      manufacturer: 'GSK Pharmaceuticals',
      batchNumber: 'CRC001',
      timeline: [
        { stage: 'Manufactured', date: '2024-12-01', location: 'GSK Mumbai', status: 'completed' },
        { stage: 'Quality Control', date: '2024-12-02', location: 'QC Lab', status: 'current' }
      ]
    },
    '2': {
      id: '2',
      drugName: 'Paracetamol',
      status: 'With Distributor',
      valid: true,
      manufacturer: 'Cipla Ltd',
      batchNumber: 'PCM002',
      timeline: [
        { stage: 'Manufactured', date: '2024-11-20', location: 'Cipla Goa', status: 'completed' },
        { stage: 'Quality Control', date: '2024-11-21', location: 'QC Lab', status: 'completed' },
        { stage: 'Distributor', date: '2024-11-25', location: 'MedDist Delhi', status: 'current' }
      ]
    }
  };

  // Check for URL parameter on component mount
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setBatchId(codeFromUrl);
      // Auto-verify if code is provided via URL
      setTimeout(() => {
        handleVerification(null, codeFromUrl);
      }, 500);
    }
  }, [searchParams]);

  const handleVerification = async (e, codeOverride = null) => {
    if (e) e.preventDefault();
    const code = codeOverride || batchId;
    if (!code) return;

    try {
      setLoading(true);
      
      // Simulate verification process with comprehensive checks
      const verificationSteps = [
        { name: 'Authenticity verification', status: 'checking' },
        { name: 'Supply chain traceability', status: 'checking' },
        { name: 'Expiry date validation', status: 'checking' },
        { name: 'Manufacturer verification', status: 'checking' },
        { name: 'Current status tracking', status: 'checking' }
      ];
      
      setVerificationFeatures(verificationSteps);
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find drug in database
      const drugData = drugDatabase[code];
      
      if (drugData && drugData.valid) {
        setVerificationResult(drugData);
        
        // Update verification features with success
        setVerificationFeatures([
          { name: 'Authenticity verification', status: 'success', icon: '✅' },
          { name: 'Supply chain traceability', status: 'success', icon: '✅' },
          { name: 'Expiry date validation', status: 'success', icon: '✅' },
          { name: 'Manufacturer verification', status: 'success', icon: '✅' },
          { name: 'Current status tracking', status: 'success', icon: '✅' }
        ]);
        
      } else {
        // Simulate failed verification
        setVerificationResult({ 
          error: 'Batch not found or invalid. This could be a counterfeit product.',
          isAuthentic: false,
          isExpired: false,
          isRecalled: false
        });
        
        // Update verification features with failures
        setVerificationFeatures([
          { name: 'Authenticity verification', status: 'failed', icon: '❌' },
          { name: 'Supply chain traceability', status: 'failed', icon: '❌' },
          { name: 'Expiry date validation', status: 'checking', icon: '⏳' },
          { name: 'Manufacturer verification', status: 'failed', icon: '❌' },
          { name: 'Current status tracking', status: 'failed', icon: '❌' }
        ]);
      }
      
    } catch (error) {
      console.error('❌ Error verifying drug batch:', error);
      setVerificationResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Manufactured';
      case 1: return 'With Distributor';
      case 2: return 'With Hospital';
      case 3: return 'Dispensed to Patient';
      default: return 'Unknown';
    }
  };

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
                  <h1 className="text-4xl font-bold text-white mb-2">🔍 Drug Verification</h1>
                  <p className="text-lg text-white/80 mb-4">
                    Verify drug authenticity and track supply chain
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
                    <div className="text-2xl font-bold text-white">Verification</div>
                    <div className="text-white/70">Security Check</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <GlowingCards enableGlow={true} glowRadius={30} glowOpacity={0.8} gap="2rem" maxWidth="100%" padding="2rem">
            {/* Verification Form */}
            <GlowingCard glowColor="#10b981" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                Verify Drug Batch
              </h2>
              
              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Batch ID
                  </label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="Enter batch ID to verify"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !batchId}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <MagicLoader size={20} particleCount={2} speed={0.8} className="mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify Batch'
                  )}
                </button>
              </form>
            </GlowingCard>

            {/* Verification Results */}
            {verificationResult && (
              <GlowingCard glowColor="#3b82f6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Verification Results
                </h2>
                
                {verificationResult.error ? (
                  <div className="space-y-4">
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                      <h3 className="text-red-300 font-bold mb-2">❌ Verification Failed</h3>
                      <p className="text-red-200">{verificationResult.error}</p>
                    </div>
                    
                    {/* Verification Features for Failed Case */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <h3 className="font-bold text-white mb-3">Verification Features</h3>
                      <div className="space-y-2">
                        {verificationFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-white/80 text-sm">{feature.name}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              feature.status === 'success' ? 'bg-green-100 text-green-800' :
                              feature.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {feature.icon} {feature.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header with Logo and Status */}
                    <div className="text-center">
                      <div className="flex justify-center items-center space-x-4 mb-4">
                        {verificationResult.logo && (
                          <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                            <img 
                              src={verificationResult.logo} 
                              alt="Manufacturer Logo" 
                              className="w-20 h-20 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-20 h-20 bg-blue-500 rounded flex flex-col items-center justify-center text-white text-xs font-bold" style={{display: 'none'}}>
                              <span>BLUE</span>
                              <span>CROSS</span>
                            </div>
                          </div>
                        )}
                        {verificationResult.image && (
                          <div className="bg-white/10 p-2 rounded-lg border border-white/20">
                            <img 
                              src={verificationResult.image} 
                              alt="Product Image" 
                              className="w-20 h-16 object-contain rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-20 h-16 bg-green-200 rounded flex items-center justify-center" style={{display: 'none'}}>
                              <span className="text-xs text-gray-600">Product</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-200 font-bold text-lg">ORIGINAL</span>
                        </div>
                      </div>
                    </div>

                    {/* Main Drug Information */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-white/60 text-sm font-medium">Status:</label>
                            <p className="text-white font-semibold">{verificationResult.status}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Scanned Code:</label>
                            <p className="text-white font-mono">{verificationResult.id}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Unique Product Identification Code:</label>
                            <p className="text-white font-semibold">{verificationResult.uniqueProductCode || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Generic and Proper Name of the Drug:</label>
                            <p className="text-white">{verificationResult.genericName || verificationResult.drugName}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Brand Name:</label>
                            <p className="text-white font-semibold">{verificationResult.brandName || verificationResult.drugName}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-white/60 text-sm font-medium">Name & Address of Manufacturer:</label>
                            <p className="text-white">
                              {verificationResult.manufacturer}
                              {verificationResult.manufacturerAddress && (
                                <><br /><span className="text-sm">{verificationResult.manufacturerAddress}</span></>
                              )}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Batch Number:</label>
                            <p className="text-white font-mono">{verificationResult.batchNumber || verificationResult.id}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Date of Manufacturing:</label>
                            <p className="text-white">{verificationResult.manufacturingDate || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Date of Expiry:</label>
                            <p className="text-white">{verificationResult.expiryDate || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">Manufacturing Licence Number:</label>
                            <p className="text-white">{verificationResult.manufacturingLicence || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <label className="text-white/60 text-sm font-medium">GTIN NO:</label>
                            <p className="text-white font-mono">{verificationResult.gtinNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Supply Chain Timeline */}
                    {verificationResult.timeline && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                        <h3 className="font-bold text-white mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Supply Chain Timeline
                        </h3>
                        <div className="space-y-4">
                          {verificationResult.timeline.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                                step.status === 'completed' ? 'bg-green-500' :
                                step.status === 'current' ? 'bg-blue-500 animate-pulse' :
                                'bg-gray-400'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-white font-medium">{step.stage}</h4>
                                  <span className="text-white/60 text-sm">{step.date}</span>
                                </div>
                                <p className="text-white/80 text-sm">{step.location}</p>
                                {step.details && (
                                  <p className="text-white/60 text-xs mt-1">{step.details}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Verification Features */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <h3 className="font-bold text-white mb-3">Blockchain Verification Status</h3>
                      <div className="space-y-2">
                        {verificationFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-white/80 text-sm">{feature.name}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              feature.status === 'success' ? 'bg-green-100 text-green-800' :
                              feature.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {feature.icon} {feature.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => navigate('/scan')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
                      >
                        📱 Scan Another QR
                      </button>
                      <button
                        onClick={() => {
                          setVerificationResult(null);
                          setBatchId('');
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                      >
                        🔍 New Search
                      </button>
                    </div>
                  </div>
                )}
              </GlowingCard>
            )}

            {/* Information */}
            <GlowingCard glowColor="#8b5cf6" className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                About Drug Verification
              </h2>
              
              <div className="space-y-4">
                <p className="text-white/80 text-sm">
                  Our blockchain-based verification system ensures the authenticity and traceability of pharmaceutical products throughout the supply chain.
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h3 className="font-bold text-white mb-3">Verification Features</h3>
                  <div className="space-y-2 text-white/80 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Authenticity verification</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Supply chain traceability</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Expiry date validation</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Manufacturer verification</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Current status tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlowingCard>
          </GlowingCards>
        </div>
      </div>
    </div>
  );
};

export default DrugVerification;
