// Initialize localStorage with proper data structure
const initializeActivityLogs = () => {
  const sampleLogs = [
    {
      type: 'batch_created',
      drugName: 'Paracetamol 500mg',
      quantity: 1000,
      manufacturer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      timestamp: Date.now() - 3600000
    },
    {
      type: 'stock_accepted',
      drugName: 'Aspirin 100mg',
      quantity: 500,
      manufacturer: 'Pharma Corp',
      distributor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      timestamp: Date.now() - 1800000
    },
    {
      type: 'qr_scan',
      batchId: 'B001',
      scanner: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      timestamp: Date.now() - 900000
    }
  ];

  localStorage.setItem('adminActivityLogs', JSON.stringify(sampleLogs));
  console.log('Activity logs initialized successfully');
};

// Clear corrupted data and initialize fresh
localStorage.removeItem('adminActivityLogs');
initializeActivityLogs();
