import React, { useState, useEffect } from 'react';
import SupplyChainCalendar from './SupplyChainCalendar';
import RestockAlerts from './RestockAlerts';
import { generateInventoryPDF, downloadPDF } from '../utils/pdfGenerator';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activityFeed, setActivityFeed] = useState([
    { action: "Insulin Glargine supply request submitted", time: "Just now", icon: "🔄" },
    { action: "Paracetamol 500mg stock level updated: 0 units remaining", time: "Just now", icon: "📊" },
    { action: "Restock initiated for Insulin Glargine - 200 units ordered", time: "2m ago", icon: "📦" },
    { action: "Amoxicillin 250mg delivery confirmed - 300 units received", time: "15m ago", icon: "✅" },
    { action: "Quality verification completed for Metformin 500mg batch #MT2024", time: "20m ago", icon: "🔍" }
  ]);

  // Sample inventory data with stock levels for the last 90 days
  const sampleInventoryData = [
    {
      id: 1,
      name: 'Covishield Vaccine',
      stockLevels: generateStockLevels(90, 0.8, 0.15, 0.05), // 80% green, 15% yellow, 5% red
      totalStock: 850,
      expiredStock: 120,
      outOfStock: 30
    },
    {
      id: 2,
      name: 'Azithromycin 500mg',
      stockLevels: generateStockLevels(90, 0.7, 0.2, 0.1), // 70% green, 20% yellow, 10% red
      totalStock: 720,
      expiredStock: 180,
      outOfStock: 100
    },
    {
      id: 3,
      name: 'ORS Powder',
      stockLevels: generateStockLevels(90, 0.75, 0.2, 0.05), // 75% green, 20% yellow, 5% red
      totalStock: 680,
      expiredStock: 180,
      outOfStock: 40
    },
    {
      id: 4,
      name: 'Rabies Vaccine',
      stockLevels: generateStockLevels(90, 0.8, 0.1, 0.1), // 80% green, 10% yellow, 10% red
      totalStock: 720,
      expiredStock: 90,
      outOfStock: 90
    },
    {
      id: 5,
      name: 'Metformin 500mg',
      stockLevels: generateStockLevels(90, 0.85, 0.1, 0.05), // 85% green, 10% yellow, 5% red
      totalStock: 765,
      expiredStock: 90,
      outOfStock: 45
    },
    {
      id: 6,
      name: 'DPT Vaccine',
      stockLevels: generateStockLevels(90, 0.75, 0.15, 0.1), // 75% green, 15% yellow, 10% red
      totalStock: 675,
      expiredStock: 135,
      outOfStock: 90
    },
    {
      id: 7,
      name: 'Vitamin B12 Injection',
      stockLevels: generateStockLevels(90, 0.8, 0.2, 0), // 80% green, 20% yellow, 0% red
      totalStock: 720,
      expiredStock: 180,
      outOfStock: 0
    }
  ];

  // Generate stock levels for 90 days with specified ratios
  function generateStockLevels(days, greenRatio, yellowRatio, redRatio) {
    const levels = [];
    const greenCount = Math.floor(days * greenRatio);
    const yellowCount = Math.floor(days * yellowRatio);
    const redCount = days - greenCount - yellowCount;

    // Create arrays for each status
    const greenDays = Array(greenCount).fill('green');
    const yellowDays = Array(yellowCount).fill('yellow');
    const redDays = Array(redCount).fill('red');

    // Combine and shuffle
    const allDays = [...greenDays, ...yellowDays, ...redDays];
    shuffleArray(allDays);

    // Create stock level objects with dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 89); // 90 days ago

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      levels.push({
        day: i + 1,
        date: currentDate,
        status: allDays[i],
        stock: allDays[i] === 'green' ? Math.floor(Math.random() * 200) + 800 : 
               allDays[i] === 'yellow' ? Math.floor(Math.random() * 300) + 100 : 0
      });
    }

    return levels;
  }

  // Fisher-Yates shuffle algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  useEffect(() => {
    setInventory(sampleInventoryData);
    setFilteredInventory(sampleInventoryData);
  }, []);

  // Listen for activity updates
  useEffect(() => {
    const handleActivityUpdate = (event) => {
      const { action, time, icon, transactionHash } = event.detail;
      setActivityFeed(prev => [{
        action: `${action} (TX: ${transactionHash.slice(0, 8)}...)`,
        time,
        icon
      }, ...prev.slice(0, 4)]); // Keep only 5 most recent activities
    };

    window.addEventListener('activityUpdate', handleActivityUpdate);
    return () => window.removeEventListener('activityUpdate', handleActivityUpdate);
  }, []);

  useEffect(() => {
    let filtered = inventory;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalStock':
          aValue = a.totalStock;
          bValue = b.totalStock;
          break;
        case 'expiredStock':
          aValue = a.expiredStock;
          bValue = b.expiredStock;
          break;
        case 'outOfStock':
          aValue = a.outOfStock;
          bValue = b.outOfStock;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'green': return 'Stock Available';
      case 'yellow': return 'Expired Stock';
      case 'red': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const getHoverMessage = (segment, item) => {
    if (!segment) return null;

    const isExpired = segment.status === 'yellow';
    const isOutOfStock = segment.status === 'red';
    
    let message = `Date: ${segment.date.toLocaleDateString()}\n`;
    
    if (isExpired) {
      message += `Stock expired\nInitiate new stock due to expiry\nWaste management alert`;
    } else if (isOutOfStock) {
      message += `Out of stock\nUrgent restock required\nSupply chain alert`;
    } else {
      message += `Stock available\n${segment.stock} units in stock`;
    }

    return message;
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
                  <h1 className="text-4xl font-bold text-white mb-2">📦 Inventory Management</h1>
                  <p className="text-lg text-white/80 mb-4">
                    Monitor stock levels and manage inventory with real-time blockchain tracking
                  </p>
                </div>
              </div>
            </div>
          </div>

                 {/* Search and Sort Controls */}
           <div className="mb-6 flex flex-wrap gap-4">
             <div className="flex-1 min-w-64">
               <input
                 type="text"
                 placeholder="Search drug, manufacturer, or distributor..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
               />
             </div>
             <div className="flex gap-2">
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
               >
                 <option value="name">Sort by Name</option>
                 <option value="totalStock">Sort by Total Stock</option>
                 <option value="expiredStock">Sort by Expired Stock</option>
                 <option value="outOfStock">Sort by Out of Stock</option>
               </select>
               <button
                 onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                 className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
               >
                 {sortOrder === 'asc' ? '↑' : '↓'}
               </button>
               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                 Filters
               </button>
             </div>
           </div>

                 {/* Main Content */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Left Panel - Inventory Stock Levels */}
             <div className="lg:col-span-2">
               <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 shadow-2xl">
                                   <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Distributor Inventory Status - Last 90 Days</h2>
                    <button 
                      onClick={() => {
                        const doc = generateInventoryPDF(filteredInventory);
                        downloadPDF(doc, `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF Report
                    </button>
                  </div>

                 <div className="space-y-6">
                   {filteredInventory.map((item) => (
                     <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                       <div className="flex justify-between items-center mb-3">
                         <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                         <div className="text-sm text-white/60">
                           Total: {item.totalStock} | Expired: {item.expiredStock} | Out: {item.outOfStock}
                         </div>
                       </div>
                       
                       {/* Stock Level Bar */}
                       <div className="relative">
                         <div className="flex h-8 bg-gray-700 rounded-lg overflow-hidden gap-px">
                           {item.stockLevels.map((segment, index) => (
                             <div
                               key={index}
                               className={`flex-1 ${getStatusColor(segment.status)} hover:opacity-80 transition-opacity cursor-pointer`}
                               onMouseEnter={(e) => {
                                 setMousePosition({ x: e.clientX, y: e.clientY });
                                 setHoveredSegment({ ...segment, itemName: item.name });
                               }}
                               onMouseLeave={() => setHoveredSegment(null)}
                             />
                           ))}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>

                 {/* Legend */}
                 <div className="mt-6 flex items-center space-x-6 text-sm">
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 bg-green-500 rounded"></div>
                     <span className="text-white">Stock Available</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                     <span className="text-white">Expired Stock</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 bg-red-500 rounded"></div>
                     <span className="text-white">Out of Stock</span>
                   </div>
                 </div>
               </div>
             </div>

             {/* Right Panel - Activity Log */}
             <div className="lg:col-span-1">
               <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 shadow-2xl">
                 <h2 className="text-xl font-bold text-white mb-4">Live Blockchain Feed</h2>
                 
                                   <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activityFeed.map((feed, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-lg mt-1">{feed.icon}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm">{feed.action}</p>
                          <span className="text-white/50 text-xs">{feed.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
           </div>

                       {/* Hover Message Tooltip */}
            {hoveredSegment && (
              <div 
                className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg text-white text-sm max-w-xs"
                style={{
                  left: mousePosition.x + 10,
                  top: mousePosition.y - 10,
                  pointerEvents: 'none'
                }}
              >
                <div className="whitespace-pre-line">
                  {getHoverMessage(hoveredSegment, hoveredSegment.itemName)}
                </div>
              </div>
            )}

            {/* Supply Chain Calendar Section */}
            <div className="mt-8">
              <SupplyChainCalendar />
            </div>

            {/* Restock Alerts Section */}
            <div className="mt-8">
              <RestockAlerts />
            </div>
          </div>
        </div>
      </div>
    );
  };

export default InventoryManagement; 