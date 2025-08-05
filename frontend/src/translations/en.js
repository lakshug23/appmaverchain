export const en = {
  // Navigation
  nav: {
    verifyDrugs: "Verify Drugs",
    forecasting: "Forecasting",
    healthRecords: "Health Records",
    signOut: "Sign Out",
    admin: "Admin"
  },

  // Home Page
  home: {
    hero: {
      title: "Revolutionizing Healthcare Supply Chain",
      subtitle: "Powered by team Mavericks.",
      connectWallet: "Connect Wallet",
      quickVerification: "Quick Drug Verification",
      signIn: "Sign In for Full Access"
    },
    timeline: {
      title: "What have we built?",
      subtitle: "A simple, secure, and transparent process that ensures drug authenticity from manufacturer to patient.",
      step1: {
        title: "Manufacturing",
        description: "Manufacturer creates drug batches with Merkle tree verification and uploads to IPFS."
      },
      step2: {
        title: "Distribution", 
        description: "Distributors receive and verify drug batches, manage inventory and fulfill hospital requests."
      },
      step3: {
        title: "Hospital Care",
        description: "Hospitals verify drug authenticity, manage stock, and dispense to patients."
      },
      step4: {
        title: "Patient Access",
        description: "Patients access their health records and medication history securely."
      }
    },
    features: {
      title: "Key Features",
      blockchain: {
        title: "Blockchain Traceability",
        description: "Track drugs from manufacturer to patient with immutable blockchain records."
      },
      verification: {
        title: "Drug Verification",
        description: "Verify drug authenticity using Merkle proofs and cryptographic signatures."
      },
      hospital: {
        title: "Hospital Management",
        description: "Streamlined inventory management with smart threshold monitoring."
      },
      records: {
        title: "Health Records",
        description: "Secure, patient-controlled health records stored on IPFS."
      },
      who: {
        title: "WHO Integration",
        description: "Integration with WHO approved drug databases for compliance."
      },
      realtime: {
        title: "Real-time Updates",
        description: "Instant notifications for critical events and threshold alerts."
      }
    },
    cta: {
      title: "Ready to Transform Healthcare?",
      subtitle: "Join the future of pharmaceutical supply chain management with MaverChain's blockchain-powered platform.",
      getStarted: "Get Started Now",
      startVerifying: "Start Verifying Drugs"
    }
  },

  // Dashboard Titles
  dashboard: {
    manufacturer: "Manufacturer Dashboard",
    distributor: "Distributor Dashboard", 
    hospital: "Hospital Dashboard",
    patient: "Patient Dashboard",
    admin: "Admin Dashboard"
  },

  // Admin Dashboard
  admin: {
    title: "🏥 MaverChain Dashboard",
    subtitle: "System administration and role management",
    systemAdmin: "System Administrator",
    fullAccess: "Full Access Control",
    connected: "Connected",
    quickSetup: {
      title: "🚀 Quick Setup",
      subtitle: "Set up all sample accounts",
      description: "This will grant appropriate roles to all sample accounts for testing the complete supply chain workflow.",
      button: "Setup All Sample Roles",
      loading: "Setting up roles..."
    },
    sampleAccounts: {
      title: "👥 Sample Accounts",
      name: "Name",
      address: "Address",
      requiredRole: "Required Role",
      patientId: "Patient ID"
    },
    grantRoles: {
      title: "Grant User Roles",
      userAddress: "User Address",
      role: "Role",
      manufacturer: "Manufacturer",
      distributor: "Distributor",
      hospital: "Hospital",
      patient: "Patient",
      button: "Grant Role",
      loading: "Granting...",
      success: "Role granted successfully!",
      error: "Error granting role"
    },
    registerHospital: {
      title: "Register Hospital",
      hospitalAddress: "Hospital Address",
      hospitalName: "Hospital Name",
      hospitalType: "Hospital Type",
      urban: "Urban",
      rural: "Rural",
      stockThreshold: "Stock Threshold",
      button: "Register Hospital",
      loading: "Registering...",
      success: "Hospital registered successfully!",
      error: "Error registering hospital"
    },
    whoDrugs: {
      title: "WHO Approved Drugs",
      drugName: "Drug Name",
      button: "Add WHO Approved Drug",
      loading: "Adding...",
      success: "WHO approved drug added successfully!",
      error: "Error adding WHO drug",
      note: "Note: This will create a hash for the drug name with WHO-2024 suffix"
    },
    systemStats: {
      title: "System Statistics",
      totalBatches: "Total Batches",
      activeHospitals: "Active Hospitals",
      totalUsers: "Total Users",
      whoDrugs: "WHO Drugs"
    },
    recentActivity: {
      title: "📊 Recent System Activity",
      noActivity: "No recent activity",
      description: "System events and transactions will appear here"
    }
  },

  // Common
  common: {
    connected: "Connected",
    disconnected: "Disconnected",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    add: "Add",
    update: "Update",
    submit: "Submit"
  },

  // Manufacturer Dashboard
  manufacturer: {
    title: "🏭 Manufacturer Dashboard",
    subtitle: "Create batches, generate QR codes, manage production",
    role: "Manufacturer",
    roleDescription: "Batch Management",
    createBatch: {
      title: "Create New Batch",
      drugName: "Drug Name",
      quantity: "Quantity",
      expiryDate: "Expiry Date",
      button: "Create Batch",
      loading: "Creating...",
      success: "Batch created successfully!",
      error: "Error creating batch"
    },
    batchManagement: {
      title: "Batch Management",
      refreshButton: "Refresh Batches",
      loading: "Loading...",
      loadingBatches: "Loading batches...",
      noBatches: "No batches yet",
      noBatchesDescription: "Create your first drug batch using the form above.",
      quantity: "Quantity",
      expiry: "Expiry",
      units: "units",
      qrCode: "📱 QR Code",
      transfer: "🚚 Transfer"
    },
    transferModal: {
      title: "Transfer Batch",
      recipientAddress: "Recipient Address",
      button: "Transfer Batch",
      loading: "Transferring...",
      success: "Batch transferred successfully!",
      error: "Error transferring batch"
    },
    qrModal: {
      title: "QR Code for Batch",
      close: "Close"
    }
  },

  // Distributor Dashboard
  distributor: {
    title: "🚚 Distributor Dashboard",
    subtitle: "Manage transfers, track inventory, handle logistics",
    role: "Distributor",
    roleDescription: "Logistics Management",
    inventory: "Inventory Management",
    qrArrivals: "QR Arrivals",
    hospitalRequests: "Hospital Requests",
    manufacturerRequests: "Manufacturer Requests",
    analytics: "Analytics",
    acceptStock: "Accept Stock",
    requestStock: "Request Stock",
    fulfillRequest: "Fulfill Request",
    stockAccepted: "Stock accepted and logged to blockchain!",
    requestSent: "Request sent to manufacturer!",
    requestFulfilled: "Hospital request fulfilled!",
    noInventory: "No inventory",
    noInventoryDescription: "No batches have been transferred to this distributor yet.",
    noQrArrivals: "No QR arrivals",
    noQrArrivalsDescription: "No QR codes received from manufacturers yet.",
    noHospitalRequests: "No hospital requests",
    noHospitalRequestsDescription: "No requests from hospitals yet.",
    noManufacturerRequests: "No manufacturer requests",
    noManufacturerRequestsDescription: "No requests sent to manufacturers yet.",
    quantity: "Quantity",
    manufacturer: "Manufacturer",
    hospital: "Hospital",
    urgency: "Urgency",
    distance: "Distance",
    status: "Status",
    timestamp: "Timestamp",
    transactionHash: "Transaction Hash",
    rural: "Rural",
    urban: "Urban",
    high: "High",
    medium: "Medium",
    low: "Low",
    optimal: "Optimal",
    critical: "Critical",
    pending: "Pending",
    accepted: "Accepted",
    fulfilled: "Fulfilled",
    inventoryStatus: "Inventory Status",
    last90Days: "Last 90 Days",
    downloadReport: "Download PDF Report",
    stock: "Stock",
    demand: "Demand",
    coldChain: "Cold Chain",
    temperature: "Temperature",
    humidity: "Humidity",
    compliance: "Compliance",
    regulatory: "Regulatory",
    auditScore: "Audit Score",
    lastCheck: "Last Check",
    deliveryNetwork: "Delivery Network",
    activeRoutes: "Active Routes",
    onTimeRate: "On-Time Rate",
    avgDelivery: "Avg Delivery",
    liveBlockchainFeed: "Live Blockchain Feed",
    priorityLogic: "Priority Logic (2:1 Rural:Urban)",
    priorityLogicDescription: "Requests are prioritized by urgency first, then by rural/urban ratio (2 rural for every 1 urban), then by distance (closer hospitals first)."
  },
  actions: {
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    add: "Add",
    update: "Update",
    submit: "Submit",
    loading: "Loading...",
    error: "Error",
    success: "Success"
  },

  // Form Labels
  forms: {
    drugName: "Drug Name",
    batchId: "Batch ID",
    quantity: "Quantity",
    manufacturer: "Manufacturer",
    patientAddress: "Patient Address",
    hospitalAddress: "Hospital Address",
    distributorAddress: "Distributor Address",
    selectDrug: "Select Drug",
    forecastPeriod: "Forecast Period (days)",
    region: "Region"
  },

  // Status Messages
  status: {
    connected: "Connected",
    disconnected: "Disconnected",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    inTransit: "In Transit",
    delivered: "Delivered",
    dispensed: "Dispensed"
  },

  // Error Messages
  errors: {
    walletNotConnected: "Wallet not connected. Please connect your wallet.",
    unauthorizedWallet: "Unauthorized wallet address.",
    networkError: "Network error occurred.",
    invalidInput: "Invalid input provided.",
    insufficientBalance: "Insufficient balance."
  },

  // Success Messages
  success: {
    walletConnected: "Wallet connected successfully!",
    drugDispensed: "Drug dispensed successfully!",
    batchCreated: "Drug batch created successfully!",
    transferCompleted: "Transfer completed successfully!"
  }
}; 