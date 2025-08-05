import React, { useState } from 'react';

const GoogleMapsLike = ({ distributors, selectedItem, onDistributorSelect }) => {
  const [mapStyle, setMapStyle] = useState('satellite');
  const [zoomLevel, setZoomLevel] = useState(12);
  const [selectedDistributor, setSelectedDistributor] = useState(null);

  // Hyderabad center coordinates
  const centerLat = 17.4065;
  const centerLng = 78.4691;

  const mapStyles = {
    satellite: {
      background: `
        radial-gradient(circle at 30% 20%, rgba(34, 47, 62, 0.8) 0%, transparent 50%),
        radial-gradient(circle at 70% 60%, rgba(45, 55, 72, 0.6) 0%, transparent 40%),
        radial-gradient(circle at 20% 80%, rgba(26, 32, 44, 0.4) 0%, transparent 30%),
        linear-gradient(135deg, #1a202c 0%, #2d3748 30%, #4a5568 70%, #2d3748 100%)
      `,
      filter: 'contrast(1.2) brightness(0.9) saturate(1.1)',
      backgroundSize: '400px 400px, 300px 300px, 200px 200px, 100% 100%'
    },
    roadmap: {
      background: `
        radial-gradient(circle at 40% 30%, rgba(203, 213, 224, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(237, 242, 247, 0.4) 0%, transparent 40%),
        linear-gradient(135deg, #f7fafc 0%, #edf2f7 50%, #e2e8f0 100%)
      `,
      filter: 'contrast(1.1) brightness(1.05)',
      backgroundSize: '350px 350px, 250px 250px, 100% 100%'
    },
    hybrid: {
      background: `
        radial-gradient(circle at 25% 25%, rgba(68, 90, 120, 0.4) 0%, transparent 60%),
        radial-gradient(circle at 75% 50%, rgba(45, 55, 72, 0.5) 0%, transparent 50%),
        radial-gradient(circle at 50% 80%, rgba(26, 32, 44, 0.3) 0%, transparent 40%),
        linear-gradient(45deg, #1a202c 0%, #2d3748 25%, #4a5568 50%, #2d3748 75%, #1a202c 100%)
      `,
      filter: 'contrast(1.3) brightness(0.95) saturate(1.2)',
      backgroundSize: '300px 300px, 400px 400px, 250px 250px, 100% 100%'
    }
  };

  const getDistributorPosition = (distributor, index) => {
    // Calculate position based on coordinates relative to Hyderabad center
    const latDiff = (distributor.coordinates.lat - centerLat) * 100;
    const lngDiff = (distributor.coordinates.lng - centerLng) * 100;
    
    return {
      top: `${50 - latDiff * 2}%`,
      left: `${50 + lngDiff * 2}%`
    };
  };

  const handleDistributorClick = (distributor) => {
    setSelectedDistributor(distributor);
  };

  const handleSelectDistributor = (distributor) => {
    if (onDistributorSelect) {
      onDistributorSelect(distributor);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold flex items-center">
          🗺️ Distributor Locations in Hyderabad
        </h4>
        
        {/* Map Controls */}
        <div className="flex items-center space-x-2">
          {/* Map Style Selector */}
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="bg-black/50 text-white text-xs px-2 py-1 rounded border border-white/20"
          >
            <option value="satellite">Satellite</option>
            <option value="roadmap">Roadmap</option>
            <option value="hybrid">Hybrid</option>
          </select>
          
          {/* Zoom Controls */}
          <div className="flex flex-col">
            <button
              onClick={() => setZoomLevel(Math.min(18, zoomLevel + 1))}
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-t border border-white/20"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(8, zoomLevel - 1))}
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-b border border-white/20 border-t-0"
            >
              −
            </button>
          </div>
        </div>
      </div>

      <div 
        className="relative rounded-lg min-h-[400px] border border-white/10 overflow-hidden"
        style={{
          ...mapStyles[mapStyle],
          backgroundBlendMode: 'multiply',
          position: 'relative'
        }}
      >
        {/* Geographical Features and Landmarks */}
        {mapStyle !== 'roadmap' && (
          <>
            {/* Hussain Sagar Lake */}
            <div className="absolute" style={{ top: '35%', left: '45%', width: '60px', height: '40px' }}>
              <div className="w-full h-full bg-blue-400/30 rounded-full border border-blue-500/50 shadow-inner"></div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-300 whitespace-nowrap">
                Hussain Sagar
              </div>
            </div>
            
            {/* Hyderabad Metro Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Red Line */}
              <div className="absolute bg-red-500/40 h-0.5" style={{ 
                top: '45%', 
                left: '10%', 
                width: '80%',
                transform: 'rotate(-2deg)' 
              }}></div>
              {/* Blue Line */}
              <div className="absolute bg-blue-500/40 w-0.5" style={{ 
                left: '60%', 
                top: '20%', 
                height: '60%',
                transform: 'rotate(5deg)' 
              }}></div>
              {/* Green Line */}
              <div className="absolute bg-green-500/40 h-0.5" style={{ 
                top: '65%', 
                left: '20%', 
                width: '60%',
                transform: 'rotate(3deg)' 
              }}></div>
            </div>
            
            {/* Major Roads/Highways */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bg-yellow-400/30 h-1" style={{ 
                top: '30%', 
                left: '0%', 
                width: '100%',
                transform: 'rotate(-1deg)' 
              }}></div>
              <div className="absolute bg-yellow-400/30 h-1" style={{ 
                top: '70%', 
                left: '0%', 
                width: '100%',
                transform: 'rotate(1deg)' 
              }}></div>
            </div>
            
            {/* IT Corridor */}
            <div className="absolute bg-purple-400/20 rounded-lg" style={{ 
              top: '60%', 
              right: '15%', 
              width: '80px', 
              height: '100px' 
            }}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-300 whitespace-nowrap">
                HITEC City
              </div>
            </div>
            
            {/* Airport */}
            <div className="absolute" style={{ top: '20%', right: '10%' }}>
              <div className="w-8 h-8 bg-gray-500/30 rounded border border-gray-400/50 flex items-center justify-center">
                <span className="text-xs">✈️</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 whitespace-nowrap">
                Airport
              </div>
            </div>
            
            {/* Railway Station */}
            <div className="absolute" style={{ top: '55%', left: '35%' }}>
              <div className="w-6 h-6 bg-orange-500/30 rounded border border-orange-400/50 flex items-center justify-center">
                <span className="text-xs">🚂</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-orange-300 whitespace-nowrap">
                Railway
              </div>
            </div>
          </>
        )}
        
        {mapStyle === 'roadmap' && (
          <>
            {/* City Blocks for Roadmap */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute bg-green-400/40" style={{ top: '25%', left: '20%', width: '40px', height: '40px' }}></div>
              <div className="absolute bg-blue-400/40" style={{ top: '40%', left: '70%', width: '50px', height: '30px' }}></div>
              <div className="absolute bg-yellow-400/40" style={{ top: '60%', left: '30%', width: '60px', height: '35px' }}></div>
              <div className="absolute bg-purple-400/40" style={{ top: '70%', right: '15%', width: '70px', height: '45px' }}></div>
            </div>
            
            {/* Major Intersections */}
            <div className="absolute w-3 h-3 bg-red-500/60 rounded-full" style={{ top: '45%', left: '45%' }}></div>
            <div className="absolute w-3 h-3 bg-red-500/60 rounded-full" style={{ top: '35%', left: '60%' }}></div>
            <div className="absolute w-3 h-3 bg-red-500/60 rounded-full" style={{ top: '65%', left: '55%' }}></div>
          </>
        )}

        {/* Hospital Location (Center) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="bg-red-500 w-6 h-6 rounded-full animate-pulse shadow-lg border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">🏥</span>
            </div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
              <div className="font-semibold text-red-300">Your Hospital</div>
              <div className="text-gray-300">Gandhi Nagar, Hyderabad</div>
            </div>
          </div>
        </div>

        {/* Distributor Locations */}
        {distributors && distributors.map((distributor, index) => {
          const position = getDistributorPosition(distributor, index);
          const isOptimized = distributor.optimized;
          const isSelected = selectedDistributor?.id === distributor.id;
          
          return (
            <div
              key={distributor.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-all duration-300 ${
                isOptimized ? 'scale-110' : 'hover:scale-105'
              } ${isSelected ? 'z-30' : ''}`}
              style={position}
              onClick={() => handleDistributorClick(distributor)}
              title={`${distributor.name} - ${distributor.distance}km away`}
            >
              <div className="relative">
                {/* Distributor Marker */}
                <div
                  className={`w-5 h-5 rounded-full shadow-lg border-2 border-white ${
                    isOptimized
                      ? 'bg-green-500 animate-bounce'
                      : 'bg-blue-500 hover:bg-blue-400'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                    📦
                  </div>
                </div>
                
                {/* Optimized Star */}
                {isOptimized && (
                  <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse text-sm">
                    ⭐
                  </div>
                )}
                
                {/* Distributor Info Popup */}
                {isSelected && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs rounded-lg shadow-xl p-4 min-w-[280px] z-40">
                    <div className="font-semibold text-green-300 mb-2">
                      {distributor.name}
                    </div>
                    <div className="space-y-1 text-gray-300">
                      <div>📍 {distributor.location}</div>
                      <div>📏 {distributor.distance}km away</div>
                      <div>⏱️ {distributor.estimatedDelivery}</div>
                      <div>⭐ {distributor.rating}/5.0</div>
                      <div>🏷️ Specialization: {distributor.specialization}</div>
                    </div>
                    
                    {selectedItem && distributor.pricing[selectedItem.drugName] && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="text-yellow-300 font-semibold">
                          {selectedItem.drugName}
                        </div>
                        <div className="text-sm">
                          Stock: {distributor.inventory[selectedItem.drugName]?.toLocaleString()} units
                        </div>
                        <div className="text-sm">
                          Price: ₹{distributor.pricing[selectedItem.drugName]?.toFixed(2)}/unit
                        </div>
                        <div className="text-sm font-semibold text-green-300">
                          Total: ₹{(distributor.pricing[selectedItem.drugName] * selectedItem.recommendedOrder).toLocaleString()}
                        </div>
                      </div>
                    )}
                    
                    {/* Advantages */}
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-xs text-blue-300 mb-1">Advantages:</div>
                      <div className="flex flex-wrap gap-1">
                        {distributor.advantages?.map((advantage, idx) => (
                          <span key={idx} className="bg-blue-600/50 text-xs px-2 py-1 rounded">
                            {advantage}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleSelectDistributor(distributor)}
                        className={`flex-1 text-xs px-3 py-2 rounded transition-colors ${
                          isOptimized
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isOptimized ? '⭐ Select Best Option' : '📋 Request Stock'}
                      </button>
                      <button
                        onClick={() => setSelectedDistributor(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Distance Label */}
                {!isSelected && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    <div className="font-medium">{distributor.name.split(' ')[0]}</div>
                    <div className="text-green-300">{distributor.distance}km</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-xs text-white shadow-xl">
          <div className="font-semibold mb-3 text-yellow-300">🗺️ Map Legend</div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3 border-2 border-white animate-pulse"></div>
              <span>🏥 Your Hospital</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3 border-2 border-white"></div>
              <span>⭐ Optimized Distributor</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 border-2 border-white"></div>
              <span>📦 Available Distributor</span>
            </div>
            {mapStyle !== 'roadmap' && (
              <>
                <div className="flex items-center">
                  <div className="w-4 h-2 bg-blue-400/50 mr-3 rounded"></div>
                  <span>💧 Water Bodies</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-red-500/50 mr-3"></div>
                  <span>🚇 Metro Lines</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-yellow-400/50 mr-3"></div>
                  <span>🛣️ Major Roads</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Map Info */}
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-xs text-white shadow-xl">
          <div className="font-semibold text-yellow-300 mb-2 flex items-center">
            📍 {selectedItem ? `Requesting: ${selectedItem.drugName}` : 'Hyderabad Medical District'}
          </div>
          {selectedItem && (
            <div className="space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Quantity:</span>
                <span className="font-semibold text-blue-300">{selectedItem.recommendedOrder} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Current Stock:</span>
                <span className="font-semibold text-orange-300">{selectedItem.currentStock} units</span>
              </div>
              <div className={`font-semibold text-center px-2 py-1 rounded ${
                selectedItem.priority === 'critical' ? 'bg-red-500/30 text-red-300 animate-pulse' :
                selectedItem.priority === 'high' ? 'bg-orange-500/30 text-orange-300' :
                selectedItem.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'
              }`}>
                {selectedItem.priority === 'critical' ? '🚨 CRITICAL' :
                 selectedItem.priority === 'high' ? '⚠️ HIGH' :
                 selectedItem.priority === 'medium' ? '📝 MEDIUM' : '✅ LOW'} PRIORITY
              </div>
            </div>
          )}
          <div className="text-gray-400 border-t border-white/20 pt-2">
            <div className="flex justify-between">
              <span>View:</span>
              <span className="capitalize font-semibold">{mapStyle}</span>
            </div>
            <div className="flex justify-between">
              <span>Zoom:</span>
              <span className="font-semibold">{zoomLevel}x</span>
            </div>
            <div className="flex justify-between">
              <span>Distributors:</span>
              <span className="font-semibold text-green-300">{distributors?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Compass */}
        <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm p-3 rounded-full border border-white/20 shadow-xl">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 flex items-center justify-center text-red-400 font-bold text-sm">
              N
            </div>
            <div className="absolute inset-0 border-2 border-white/40 rounded-full"></div>
            <div className="absolute inset-1 border border-red-400/50 rounded-full"></div>
            {/* Compass needle */}
            <div className="absolute top-1 left-1/2 w-0.5 h-4 bg-red-400 transform -translate-x-1/2 origin-bottom"></div>
            <div className="absolute bottom-1 left-1/2 w-0.5 h-4 bg-gray-400 transform -translate-x-1/2 origin-top"></div>
            {/* Cardinal directions */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-white/60">•</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white/60">•</div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs text-white/60">•</div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-white/60">•</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsLike;
