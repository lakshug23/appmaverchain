import React, { useState } from 'react';

const AnalyticsDashboard = () => {
  const [timeFrame, setTimeFrame] = useState('day');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [hoveredAnomaly, setHoveredAnomaly] = useState(null);

  // Anomalies data
  const anomalies = [
    {
      id: 1,
      title: 'Delivery Delay',
      current: '4.1 days',
      threshold: '3.5 days',
      status: 'critical',
      icon: '🚚'
    },
    {
      id: 2,
      title: 'Sync Delay',
      current: '120ms',
      threshold: '100ms',
      status: 'warning',
      icon: '⚡'
    },
    {
      id: 3,
      title: 'Scan Time',
      current: '220ms',
      threshold: '200ms',
      status: 'warning',
      icon: '🔍'
    }
  ];

  // Filter options
  const filterOptions = [
    { id: 'all', name: 'All Medicines', icon: '💊' },
    { id: 'paracetamol', name: 'Paracetamol', icon: '💊' },
    { id: 'insulin', name: 'Insulin', icon: '💉' },
    { id: 'aspirin', name: 'Aspirin', icon: '💊' },
    { id: 'metformin', name: 'Metformin', icon: '💊' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500/20 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30';
      default: return 'bg-green-500/20 border-green-500/30';
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
                  <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Inventory Metrics & Analytics Dashboard
                  </h1>
                  <p className="text-lg text-white/80 mb-4">
                    Real-time performance monitoring and predictive analytics
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    AI Predictions
                  </button>
                  <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                    {['day', 'week', 'month'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeFrame(period)}
                        className={`px-4 py-2 rounded-md transition-all duration-300 font-medium ${
                          timeFrame === period
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Filters */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Interactive Filters</h3>
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                    selectedFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <span className="text-lg">{filter.icon}</span>
                  <span>{filter.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detected Anomalies */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-orange-400 mr-2">▲</span>
              Detected Anomalies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`bg-white/5 rounded-lg p-6 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${getStatusBg(anomaly.status)}`}
                  onMouseEnter={() => setHoveredAnomaly(anomaly)}
                  onMouseLeave={() => setHoveredAnomaly(null)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{anomaly.icon}</span>
                      <h4 className="text-lg font-semibold text-white">{anomaly.title}</h4>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${anomaly.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Current:</span>
                      <span className={`font-semibold ${getStatusColor(anomaly.status)}`}>{anomaly.current}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Threshold:</span>
                      <span className="text-white font-semibold">{anomaly.threshold}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Batch Scan Confirmation Time */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Batch Scan Confirmation Time
                </h3>
                <span className="text-2xl font-bold text-blue-400">185ms</span>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center space-y-2 group cursor-pointer"
                    >
                      <div className="relative">
                        <div
                          className="bg-blue-500 rounded-t transition-all duration-300 group-hover:bg-blue-400"
                          style={{
                            height: `${Math.random() * 150 + 50}px`,
                            width: '20px'
                          }}
                        ></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {Math.floor(Math.random() * 100 + 150)}ms
                        </div>
                      </div>
                      <span className="text-white/70 text-xs">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Completion Duration */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Delivery Completion Duration
                </h3>
                <span className="text-2xl font-bold text-green-400">2.8 days</span>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center space-y-2 group cursor-pointer"
                    >
                      <div className="flex space-x-1">
                        <div
                          className="bg-teal-500 rounded-t transition-all duration-300 group-hover:bg-teal-400"
                          style={{
                            height: `${Math.random() * 150 + 50}px`,
                            width: '12px'
                          }}
                        ></div>
                        <div
                          className="bg-orange-500 rounded-t transition-all duration-300 group-hover:bg-orange-400"
                          style={{
                            height: `${Math.random() * 100 + 30}px`,
                            width: '12px'
                          }}
                        ></div>
                      </div>
                      <span className="text-white/70 text-xs">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 