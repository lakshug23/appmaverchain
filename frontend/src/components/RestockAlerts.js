import React, { useState } from 'react';
import { generateRestockAlertsPDF, downloadPDF } from '../utils/pdfGenerator';

const RestockAlerts = () => {
  const [fulfillingRequest, setFulfillingRequest] = useState(null);

  // Sample restock requests data
  const restockRequests = [
    {
      id: 1,
      hospitalName: 'Apollo Hospitals',
      type: 'urban',
      drugName: 'Paracetamol 500mg',
      quantity: 500,
      location: 'Chennai, TN (100 km away)',
      requestTime: '01/08/2025, 19:29:30',
      status: 'pending'
    },
    {
      id: 2,
      hospitalName: 'Apollo Hospitals',
      type: 'urban',
      drugName: 'Insulin Glargine',
      quantity: 300,
      location: 'Chennai, TN (100 km away)',
      requestTime: '01/08/2025, 19:25:15',
      status: 'pending'
    },
    {
      id: 3,
      hospitalName: 'Apollo Hospitals',
      type: 'urban',
      drugName: 'Insulin Glargine',
      quantity: 200,
      location: 'Chennai, TN (100 km away)',
      requestTime: '01/08/2025, 19:20:45',
      status: 'pending'
    },
    {
      id: 4,
      hospitalName: 'Apollo Hospitals',
      type: 'urban',
      drugName: 'Paracetamol 500mg',
      quantity: 400,
      location: 'Chennai, TN (100 km away)',
      requestTime: '01/08/2025, 19:15:30',
      status: 'pending'
    },
    {
      id: 5,
      hospitalName: 'Apollo Hospitals',
      type: 'urban',
      drugName: 'Insulin Glargine',
      quantity: 250,
      location: 'Chennai, TN (100 km away)',
      requestTime: '01/08/2025, 19:10:20',
      status: 'pending'
    },
    {
      id: 6,
      hospitalName: 'Apollo Hospitals',
      type: 'urban',
      drugName: 'Amoxicillin 250mg',
      quantity: 350,
      location: 'Chennai, TN (100 km away)',
      requestTime: '01/08/2025, 19:05:10',
      status: 'pending'
    }
  ];

  const handleFulfillRequest = async (requestId) => {
    setFulfillingRequest(requestId);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate transaction hash
      const transactionHash = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      // Log to blockchain (simulated)
      const blockchainLog = {
        type: 'restock_request_fulfilled',
        requestId,
        timestamp: Date.now(),
        transactionHash,
        status: 'completed'
      };
      
      // Store in localStorage for demo (in real app, this would be on blockchain)
      const existingLogs = JSON.parse(localStorage.getItem('blockchainLogs') || '[]');
      existingLogs.unshift(blockchainLog);
      localStorage.setItem('blockchainLogs', JSON.stringify(existingLogs));
      
      // Update activity log
      const activityLog = {
        type: 'request_fulfilled',
        hospital: restockRequests.find(r => r.id === requestId)?.hospitalName,
        drug: restockRequests.find(r => r.id === requestId)?.drugName,
        quantity: restockRequests.find(r => r.id === requestId)?.quantity,
        timestamp: Date.now(),
        transactionHash
      };
      
      const existingActivities = JSON.parse(localStorage.getItem('activityLogs') || '[]');
      existingActivities.unshift(activityLog);
      localStorage.setItem('activityLogs', JSON.stringify(existingActivities));
      
      // Update request status
      const updatedRequests = restockRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'fulfilled', fulfilledAt: Date.now() }
          : request
      );
      
      // In a real app, this would update the backend
      console.log(`Fulfilled request ${requestId} with transaction ${transactionHash}`);
      
      // Trigger activity update (this would be handled by a real-time system)
      window.dispatchEvent(new CustomEvent('activityUpdate', {
        detail: {
          action: `Restock request fulfilled for ${restockRequests.find(r => r.id === requestId)?.drugName}`,
          time: 'Just now',
          icon: '✅',
          transactionHash
        }
      }));

      // Simulate manufacturer request notification
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('activityUpdate', {
          detail: {
            action: `Request sent to manufacturer for ${restockRequests.find(r => r.id === requestId)?.drugName}`,
            time: 'Just now',
            icon: '🏭',
            transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`
          }
        }));
      }, 1000);
      
    } catch (error) {
      console.error('Error fulfilling request:', error);
      alert('Error fulfilling request. Please try again.');
    } finally {
      setFulfillingRequest(null);
    }
  };

  const getDrugIcon = (drugName) => {
    if (drugName.includes('Insulin')) return '💉';
    if (drugName.includes('Paracetamol')) return '💊';
    if (drugName.includes('Amoxicillin')) return '🦠';
    return '💊';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Smart Restock Alert System (Incoming Requests)</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const doc = generateRestockAlertsPDF(restockRequests);
              downloadPDF(doc, `restock-alerts-report-${new Date().toISOString().split('T')[0]}.pdf`);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restockRequests.map((request) => (
          <div key={request.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white">{request.hospitalName}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  request.type === 'urban' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {request.type === 'urban' ? 'Urban' : 'Rural'}
                </span>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                ADVISORY
              </span>
            </div>

            {/* Drug Details */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getDrugIcon(request.drugName)}</span>
                <span className="text-white font-medium">{request.drugName}</span>
              </div>
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{request.location}</span>
              </div>
            </div>

            {/* Request Information */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Requested Quantity:</span>
                <span className="text-white font-semibold">{request.quantity} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Request Time:</span>
                <span className="text-white text-sm">{request.requestTime}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleFulfillRequest(request.id)}
              disabled={fulfillingRequest === request.id}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold transition-all duration-300 flex items-center justify-center"
            >
              {fulfillingRequest === request.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Fulfilling...
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Fulfill Request
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {restockRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-white/40 text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-white mb-2">No Restock Alerts</h3>
          <p className="text-white/60">All inventory levels are optimal. No restock requests at this time.</p>
        </div>
      )}
    </div>
  );
};

export default RestockAlerts; 