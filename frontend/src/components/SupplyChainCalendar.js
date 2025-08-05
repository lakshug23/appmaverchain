import React, { useState } from 'react';
import { generateSupplyChainPDF, downloadPDF } from '../utils/pdfGenerator';

const SupplyChainCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Generate calendar data for the current month with consistent performance
  const generateCalendarData = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= lastDay || calendar.length < 42) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPastOrToday = currentDate <= today;
      
      calendar.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        isPastOrToday,
        performance: isCurrentMonth && isPastOrToday ? getConsistentPerformance(currentDate) : null
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  };

  const getConsistentPerformance = (date) => {
    // Use date as seed for consistent performance
    const seed = date.getDate() + date.getMonth() * 100;
    const rand = (seed * 9301 + 49297) % 233280 / 233280;
    
    if (rand > 0.8) return 'critical'; // Red
    if (rand > 0.6) return 'warning'; // Orange/Yellow
    return 'normal'; // Green
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-600';
    }
  };

  const getPerformanceText = (performance) => {
    switch (performance) {
      case 'normal': return 'All operations normal';
      case 'warning': return 'Minor delays detected';
      case 'critical': return 'Critical issues';
      default: return 'No data';
    }
  };

  const getHoverMessage = (date, performance) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const uptime = performance === 'normal' ? '100%' : 
                   performance === 'warning' ? '85%' : '60%';

    return `${dateStr}\nUptime: ${uptime}\n• ${getPerformanceText(performance)}\n• All medicine batches delivered on time\n• Cold chain requirements fully met`;
  };

  const calendarData = generateCalendarData(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          Supply Chain Performance Calendar
        </h2>
        <button 
          onClick={() => {
            const doc = generateSupplyChainPDF(calendarData);
            downloadPDF(doc, `supply-chain-report-${new Date().toISOString().split('T')[0]}.pdf`);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
          <option>All Facilities</option>
          <option>Apollo Hospitals</option>
          <option>City General Hospital</option>
          <option>Rural Health Center</option>
        </select>
        <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
          <option>All Medicines</option>
          <option>Paracetamol 500mg</option>
          <option>Insulin Glargine</option>
          <option>Amoxicillin 250mg</option>
        </select>
        <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
          <option>All Stages</option>
          <option>Manufacturing</option>
          <option>Distribution</option>
          <option>Delivery</option>
        </select>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigateMonth(-1)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">{monthName}</h3>
          <p className="text-blue-400 text-sm">94% Uptime</p>
        </div>
        <button 
          onClick={() => navigateMonth(1)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-white/70 text-sm font-medium py-2">
            {day}
          </div>
        ))}

                 {/* Calendar Days */}
         {calendarData.map((day, index) => (
           <div
             key={index}
             className={`relative p-2 text-center cursor-pointer transition-all duration-200 ${
               day.isCurrentMonth ? 'text-white' : 'text-white/30'
             } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
             onMouseEnter={() => setHoveredDate(day)}
             onMouseLeave={() => setHoveredDate(null)}
             onClick={() => setSelectedDate(day)}
           >
             <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
             {day.isCurrentMonth && day.isPastOrToday && day.performance && (
               <div className={`w-2 h-2 mx-auto rounded-full ${getPerformanceColor(day.performance)}`}></div>
             )}
             {day.isCurrentMonth && !day.isPastOrToday && (
               <div className="w-2 h-2 mx-auto rounded-full bg-gray-600"></div>
             )}
           </div>
         ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-white">Normal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-white">Warning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-white">Critical</span>
        </div>
      </div>

             {/* Hover Tooltip */}
       {hoveredDate && hoveredDate.isCurrentMonth && hoveredDate.isPastOrToday && hoveredDate.performance && (
         <div 
           className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg text-white text-sm max-w-xs"
           style={{
             left: hoveredDate.clientX + 10,
             top: hoveredDate.clientY - 10,
             pointerEvents: 'none'
           }}
         >
           <div className="whitespace-pre-line">
             {getHoverMessage(hoveredDate.date, hoveredDate.performance)}
           </div>
         </div>
       )}
    </div>
  );
};

export default SupplyChainCalendar; 