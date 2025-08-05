import React, { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';
import MagicLoader from '../components/MagicLoader';
import BackButton from '../components/BackButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DemandForecastingPage = () => {
  const { account } = useWallet();
  const { getForecastData } = useContract();
  const [loading, setLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState('Insulin Glargine');
  const [selectedRegion, setSelectedRegion] = useState('Kochi, KL');
  const [selectedPeriod, setSelectedPeriod] = useState('Annual (12 months)');
  const [activeTab, setActiveTab] = useState('forecast');
  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [databaseData, setDatabaseData] = useState([]);

  // Sample medicines from the screenshot
  const medicines = [
    'Paracetamol 500mg',
    'Amoxicillin 250mg',
    'Insulin Glargine',
    'Covishield Vaccine',
    'Azithromycin 500mg',
    'ORS Powder',
    'Rabies Vaccine',
    'Metformin 500mg',
    'DPT Vaccine',
    'Vitamin B12 Injection',
    'Diclofenac Gel'
  ];

  // Sample regions from the screenshot
  const regions = [
    { name: 'Chennai, TN', type: 'urban' },
    { name: 'Bangalore, KA', type: 'urban' },
    { name: 'Hyderabad, TS', type: 'urban' },
    { name: 'Kochi, KL', type: 'urban' },
    { name: 'Coimbatore, TN', type: 'urban' },
    { name: 'Vijayawada, AP', type: 'urban' },
    { name: 'Trichy, TN', type: 'urban' },
    { name: 'Guntur, AP', type: 'urban' },
    { name: 'Madurai, TN', type: 'urban' },
    { name: 'Rural Tamil Nadu', type: 'rural' }
  ];

  // Sample historical data with chart data
  const sampleHistoricalData = [
    { medicine: 'Insulin Glargine', region: 'Bangalore, KA', period: '12 Months', riskLevel: 'high', created: '4/8/2025', data: [1200, 1350, 1100, 1400, 1194, 1948, 1800, 1600, 900, 800, 750, 1000] },
    { medicine: 'Vitamin B12 Injection', region: 'Rural Tamil Nadu', period: '3 Months', riskLevel: 'medium', created: '3/8/2025', data: [800, 950, 1200] },
    { medicine: 'DPT Vaccine', region: 'Rural Tamil Nadu', period: '12 Months', riskLevel: 'medium', created: '3/8/2025', data: [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700] },
    { medicine: 'Salbutamol Inhaler', region: 'Kochi, KL', period: '12 Months', riskLevel: 'high', created: '3/8/2025', data: [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600] },
    { medicine: 'Covishield Vaccine', region: 'Rural Telangana', period: '3 Months', riskLevel: 'low', created: '3/8/2025', data: [500, 600, 700] },
    { medicine: 'Vitamin B12 Injection', region: 'Rural Andhra Pradesh', period: '3 Months', riskLevel: 'low', created: '3/8/2025', data: [400, 500, 600] },
    { medicine: 'Rabies Vaccine', region: 'Chennai, TN', period: '3 Months', riskLevel: 'high', created: '3/8/2025', data: [300, 400, 500] },
    { medicine: 'Insulin Glargine', region: 'Coimbatore, TN', period: '12 Months', riskLevel: 'high', created: '3/8/2025', data: [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100] },
    { medicine: 'ORS Powder', region: 'Rural Karnataka', period: '3 Months', riskLevel: 'medium', created: '3/8/2025', data: [200, 300, 400] },
    { medicine: 'Azithromycin 500mg', region: 'Madurai, TN', period: '12 Months', riskLevel: 'high', created: '3/8/2025', data: [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900] }
  ];

  // Sample database data
  const sampleDatabaseData = [
    { id: 1, medicine: 'Paracetamol 500mg', region: 'Chennai, TN', stock: 1500, demand: 1200, status: 'optimal' },
    { id: 2, medicine: 'Amoxicillin 250mg', region: 'Bangalore, KA', stock: 800, demand: 1000, status: 'low' },
    { id: 3, medicine: 'Insulin Glargine', region: 'Kochi, KL', stock: 2000, demand: 1800, status: 'optimal' },
    { id: 4, medicine: 'Covishield Vaccine', region: 'Hyderabad, TS', stock: 500, demand: 800, status: 'critical' },
    { id: 5, medicine: 'Azithromycin 500mg', region: 'Coimbatore, TN', stock: 1200, demand: 1100, status: 'optimal' },
    { id: 6, medicine: 'ORS Powder', region: 'Vijayawada, AP', stock: 300, demand: 600, status: 'low' },
    { id: 7, medicine: 'Rabies Vaccine', region: 'Trichy, TN', stock: 400, demand: 300, status: 'optimal' },
    { id: 8, medicine: 'Metformin 500mg', region: 'Guntur, AP', stock: 900, demand: 1200, status: 'low' },
    { id: 9, medicine: 'DPT Vaccine', region: 'Madurai, TN', stock: 600, demand: 500, status: 'optimal' },
    { id: 10, medicine: 'Vitamin B12 Injection', region: 'Rural Tamil Nadu', stock: 200, demand: 400, status: 'critical' }
  ];

  useEffect(() => {
    setHistoricalData(sampleHistoricalData);
    setDatabaseData(sampleDatabaseData);
  }, []);

  const generateForecast = async (e) => {
    e.preventDefault();
    if (!selectedMedicine || !selectedRegion) return;

    try {
      setLoading(true);
      
      // Simulate AI forecasting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample forecast data
      const monthlyData = [
        { month: 'Aug', demand: 1200 },
        { month: 'Sept', demand: 1350 },
        { month: 'Oct', demand: 1100 },
        { month: 'Nov', demand: 1400 },
        { month: 'Dec', demand: 1194 },
        { month: 'Jan', demand: 1948 },
        { month: 'Feb', demand: 1800 },
        { month: 'Mar', demand: 1600 },
        { month: 'Apr', demand: 900 },
        { month: 'May', demand: 800 },
        { month: 'Jun', demand: 750 },
        { month: 'Jul', demand: 1000 }
      ];

      const seasonalData = [
        { name: 'Winter', value: 158, color: '#3b82f6' },
        { name: 'Summer', value: 120, color: '#f97316' },
        { name: 'Monsoon', value: 166, color: '#22c55e' },
        { name: 'Post-Monsoon', value: 108, color: '#a855f7' }
      ];

      const forecastResult = {
        medicine: selectedMedicine,
        region: selectedRegion,
        regionType: regions.find(r => r.name === selectedRegion)?.type || 'urban',
        monthlyData,
        seasonalData,
        summary: {
          peakDemand: 1948,
          averageDemand: 1184,
          totalAnnualDemand: 552
        },
        recommendations: [
          'Maintain 20% higher safety stock for urban areas',
          'Peak demand expected in Jan',
          'Consider pre-positioning inventory 1 week before peak season',
          'Optimize urban distribution routes'
        ]
      };

      setForecastData(forecastResult);
      setActiveTab('forecast');
      
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoricalForecast = (index) => {
    setHistoricalData(prev => prev.filter((_, i) => i !== index));
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-gray-100 text-gray-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegionTypeColor = (type) => {
    return type === 'urban' ? 'bg-gray-800 text-gray-300' : 'bg-gray-300 text-gray-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate line chart data for historical forecasts
  const getHistoricalLineData = (data) => {
    return data.map((value, index) => ({
      month: `Month ${index + 1}`,
      demand: value
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background with glowing shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2">MedChain AI Forecasting</h1>
          <p className="text-lg text-gray-300 mb-2">Intelligent medicine demand prediction for optimized inventory distribution</p>
          <p className="text-sm text-gray-400">Secure • Transparent • Traceable</p>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - AI Demand Forecasting */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">AI Demand Forecasting</h2>
                </div>
                
                <p className="text-gray-300 text-sm mb-6">
                  Generate intelligent medicine demand predictions with region-aware analysis.
                </p>

                <form onSubmit={generateForecast} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Medicine Name</label>
                    <select
                      value={selectedMedicine}
                      onChange={(e) => setSelectedMedicine(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {medicines.map((medicine) => (
                        <option key={medicine} value={medicine}>
                          {medicine === selectedMedicine ? `✓ ${medicine}` : medicine}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Region</option>
                      {regions.map((region) => (
                        <option key={region.name} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Region Type</label>
                    <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {regions.find(r => r.name === selectedRegion)?.type || 'urban'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Forecasting Period</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Annual (12 months)">Annual (12 months)</option>
                      <option value="Quarterly (3 months)">Quarterly (3 months)</option>
                      <option value="Monthly (1 month)">Monthly (1 month)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedMedicine || !selectedRegion}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <MagicLoader size={20} particleCount={3} speed={0.8} className="mr-2" />
                        Generating AI Forecast...
                      </div>
                    ) : (
                      'Generate AI Forecast'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                {/* Tabs */}
                <div className="flex space-x-1 mb-6">
                  <button
                    onClick={() => setActiveTab('forecast')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'forecast' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Forecast Results
                  </button>
                  <button
                    onClick={() => setActiveTab('historical')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'historical' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Historical Data
                  </button>
                  <button
                    onClick={() => setActiveTab('seasonal')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'seasonal' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Seasonal Demand
                  </button>
                  <button
                    onClick={() => setActiveTab('database')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'database' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Database
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'forecast' && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Forecast Results</h3>
                    {!forecastData ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 mt-4">No forecast data available. Please generate a forecast first.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* 12-Month Demand Forecast Chart */}
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-white mb-2">12-Month Demand Forecast</h4>
                          <p className="text-gray-300 text-sm mb-4">
                            Monthly predicted demand for {forecastData.medicine} in {forecastData.region} {forecastData.regionType} Areas
                          </p>
                          
                          {/* Animated Bar Chart */}
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={forecastData.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                  }}
                                />
                                <Bar 
                                  dataKey="demand" 
                                  fill="#3B82F6" 
                                  radius={[4, 4, 0, 0]}
                                  animationDuration={2000}
                                  animationBegin={0}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Demand Summary and AI Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-3">Demand Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="text-gray-400">Medicine:</span> <span className="text-white">{forecastData.medicine}</span></div>
                              <div><span className="text-gray-400">Region:</span> <span className="text-white">{forecastData.region}</span></div>
                              <div><span className="text-gray-400">Peak Demand:</span> <span className="text-white">{forecastData.summary.peakDemand} units</span></div>
                              <div><span className="text-gray-400">Average Demand:</span> <span className="text-white">{forecastData.summary.averageDemand} units</span></div>
                              <div><span className="text-gray-400">Region Type:</span> <span className="text-white">{forecastData.regionType} area</span></div>
                            </div>
                          </div>

                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-3">AI Recommendations</h4>
                            <div className="space-y-2">
                              {forecastData.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="text-green-400 mt-1">✓</span>
                                  <span className="text-sm text-gray-300">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'historical' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Historical Forecasts</h3>
                      <button className="text-sm text-gray-400 hover:text-white">Refresh</button>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Previously generated forecasts stored in the database.</p>
                    <p className="text-gray-400 text-sm mb-4">Total forecasts: {historicalData.length}</p>
                    
                    {/* Animated Line Chart for Historical Data */}
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Historical Demand Trends</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getHistoricalLineData(historicalData[0]?.data || [])}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="demand" 
                              stroke="#3B82F6" 
                              strokeWidth={3}
                              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                              animationDuration={2000}
                              animationBegin={0}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 text-gray-400">Medicine</th>
                            <th className="text-left py-2 text-gray-400">Region</th>
                            <th className="text-left py-2 text-gray-400">Period</th>
                            <th className="text-left py-2 text-gray-400">Risk Level</th>
                            <th className="text-left py-2 text-gray-400">Created</th>
                            <th className="text-left py-2 text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historicalData.map((item, index) => (
                            <tr key={index} className="border-b border-gray-700">
                              <td className="py-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400">💊</span>
                                  <span className="text-white">{item.medicine}</span>
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400">📍</span>
                                  <span className="text-white">{item.region}</span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getRegionTypeColor(item.region.includes('Rural') ? 'rural' : 'urban')}`}>
                                    {item.region.includes('Rural') ? 'rural' : 'urban'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400">📅</span>
                                  <span className="text-white">{item.period}</span>
                                </div>
                              </td>
                              <td className="py-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(item.riskLevel)}`}>
                                  {item.riskLevel}
                                </span>
                              </td>
                              <td className="py-2 text-white">{item.created}</td>
                              <td className="py-2">
                                <button
                                  onClick={() => deleteHistoricalForecast(index)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'seasonal' && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Seasonal Demand Pattern</h3>
                    {!forecastData ? (
                      <div className="text-center py-12">
                        <p className="text-gray-400">Generate a forecast first to view seasonal patterns.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                            <span className="text-blue-400 mr-2">📅</span>
                            Seasonal Demand Pattern - {forecastData.medicine}
                          </h4>
                          <p className="text-gray-300 text-sm mb-4">
                            {forecastData.region} {forecastData.regionType} Area Seasonal distribution for {forecastData.medicine} in {forecastData.region}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Animated Pie Chart */}
                            <div className="flex justify-center">
                              <div className="w-64 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={forecastData.seasonalData}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                      animationDuration={2000}
                                      animationBegin={0}
                                    >
                                      {forecastData.seasonalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: '#1F2937', 
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            
                            {/* Seasonal Breakdown */}
                            <div className="space-y-3">
                              {forecastData.seasonalData.map((season, index) => (
                                <div key={season.name} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-white font-medium">{season.name}:</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-white font-semibold">{season.value} units</div>
                                    <div className="text-gray-400 text-sm">{((season.value / forecastData.seasonalData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}%</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Total Annual Demand */}
                          <div className="mt-6 bg-blue-600/20 rounded-lg p-4">
                            <h5 className="text-white font-semibold mb-1">Total Annual Demand</h5>
                            <div className="text-2xl font-bold text-white">{forecastData.summary.totalAnnualDemand} units</div>
                            <p className="text-gray-300 text-sm">For {forecastData.medicine} in {forecastData.region}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'database' && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Database Management</h3>
                    <p className="text-gray-400 text-sm mb-6">Real-time inventory and demand data across all regions.</p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 text-gray-400">ID</th>
                            <th className="text-left py-2 text-gray-400">Medicine</th>
                            <th className="text-left py-2 text-gray-400">Region</th>
                            <th className="text-left py-2 text-gray-400">Current Stock</th>
                            <th className="text-left py-2 text-gray-400">Demand</th>
                            <th className="text-left py-2 text-gray-400">Status</th>
                            <th className="text-left py-2 text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {databaseData.map((item) => (
                            <tr key={item.id} className="border-b border-gray-700">
                              <td className="py-2 text-white">#{item.id}</td>
                              <td className="py-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400">💊</span>
                                  <span className="text-white">{item.medicine}</span>
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400">📍</span>
                                  <span className="text-white">{item.region}</span>
                                </div>
                              </td>
                              <td className="py-2 text-white">{item.stock} units</td>
                              <td className="py-2 text-white">{item.demand} units</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-2">
                                <button className="text-blue-400 hover:text-blue-300 text-sm mr-2">
                                  Edit
                                </button>
                                <button className="text-red-400 hover:text-red-300 text-sm">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecastingPage;
