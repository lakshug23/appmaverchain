export const la = {
  // Navigation
  nav: {
    verifyDrugs: "Verificare medicamenta",
    forecasting: "Praedicere",
    healthRecords: "Acta sanitatis",
    signOut: "Exire",
    admin: "Administrator"
  },

  // Home Page
  home: {
    hero: {
      title: "Revolutionem in catena sanitatis",
      subtitle: "A turma Mavericks propulsus.",
      connectWallet: "Connectere marsupium",
      quickVerification: "Celer medicamentorum verificatio",
      signIn: "Intrare pro pleno accessu"
    },
    timeline: {
      title: "Quid aedificavimus?",
      subtitle: "Processus simplex, tutus et perspicuus qui medicamentorum authenticitatem a fabricatore ad aegrotum praestat.",
      step1: {
        title: "Fabricatio",
        description: "Fabricator creas medicamentorum fasciculos cum Merkle arboris verificatione et in IPFS uploadat."
      },
      step2: {
        title: "Distributio",
        description: "Distributores recipiunt et verificas medicamentorum fasciculos, administras inventarium et complent petitiones nosocomiorum."
      },
      step3: {
        title: "Cura nosocomii",
        description: "Nosocomia verificas medicamentorum authenticitatem, administras copias et dispensas aegrotis."
      },
      step4: {
        title: "Accessus aegroti",
        description: "Aegroti secure accedas ad acta sanitatis et historiam medicamentorum."
      }
    },
    features: {
      title: "Claves proprietates",
      blockchain: {
        title: "Blockchain vestigatio",
        description: "Vestigas medicamenta a fabricatore ad aegrotum cum immutabilibus blockchain recordis."
      },
      verification: {
        title: "Medicamentorum verificatio",
        description: "Verificas medicamentorum authenticitatem utendo Merkle probationibus et cryptographicis subscriptionibus."
      },
      hospital: {
        title: "Administratio nosocomii",
        description: "Streamlined inventarii administratio cum intelligenti limine vigilantia."
      },
      records: {
        title: "Acta sanitatis",
        description: "Tuta, aegroti-controllata acta sanitatis in IPFS reposita."
      },
      who: {
        title: "WHO integratio",
        description: "Integratio cum WHO approbatis medicamentorum databasibus pro conformitate."
      },
      realtime: {
        title: "Real-tempus updates",
        description: "Instantaneae notificationes pro criticis eventibus et limine alertis."
      }
    },
    cta: {
      title: "Paratus ad transformandas curas sanitatis?",
      subtitle: "Iunge futurum pharmacae catenae administrationis cum MaverChain blockchain-propulsa platea.",
      getStarted: "Incipere nunc",
      startVerifying: "Incipere verificare medicamenta"
    }
  },

  // Dashboard Titles
  dashboard: {
    manufacturer: "Fabricator Dashboard",
    distributor: "Distributor Dashboard",
    hospital: "Nosocomium Dashboard",
    patient: "Aegrotus Dashboard",
    admin: "Administrator Dashboard"
  },

  // Admin Dashboard
  admin: {
    title: "🏥 MaverChain Dashboard",
    subtitle: "System administration et role management",
    systemAdmin: "System Administrator",
    fullAccess: "Full Access Control",
    connected: "Connectus",
    quickSetup: {
      title: "🚀 Quick Setup",
      subtitle: "Set up all sample accounts",
      description: "This will grant appropriate roles to all sample accounts for testing the complete supply chain workflow.",
      button: "Setup All Sample Roles",
      loading: "Setting up roles..."
    },
    sampleAccounts: {
      title: "👥 Sample Accounts",
      name: "Nomen",
      address: "Address",
      requiredRole: "Required Role",
      patientId: "Patient ID"
    },
    grantRoles: {
      title: "Grant User Roles",
      userAddress: "User Address",
      role: "Role",
      manufacturer: "Fabricator",
      distributor: "Distributor",
      hospital: "Nosocomium",
      patient: "Aegrotus",
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

  // Manufacturer Dashboard
  manufacturer: {
    title: "🏭 Fabricator Dashboard",
    subtitle: "Create batches, generate QR codes, manage production",
    role: "Fabricator",
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
  actions: {
    back: "Retro",
    save: "Servare",
    cancel: "Cancellare",
    delete: "Delere",
    edit: "Emendare",
    view: "Videre",
    add: "Addere",
    update: "Renovare",
    submit: "Submittere",
    loading: "Loading...",
    error: "Error",
    success: "Successus"
  },

  // Form Labels
  forms: {
    drugName: "Nomen medicamenti",
    batchId: "Batch ID",
    quantity: "Quantitas",
    manufacturer: "Fabricator",
    patientAddress: "Aegroti address",
    hospitalAddress: "Nosocomii address",
    distributorAddress: "Distributoris address",
    selectDrug: "Selige medicamentum",
    forecastPeriod: "Praedictionis periodus (dies)",
    region: "Regio"
  },

  // Status Messages
  status: {
    connected: "Connectus",
    disconnected: "Disconnectus",
    pending: "Pendens",
    approved: "Approbatus",
    rejected: "Reiectus",
    inTransit: "In transitu",
    delivered: "Traditus",
    dispensed: "Dispensatus"
  },

  // Error Messages
  errors: {
    walletNotConnected: "Marsupium non connectum. Quaeso connectas tuum marsupium.",
    unauthorizedWallet: "Non auctorizata marsupii address.",
    networkError: "Network error accidit.",
    invalidInput: "Invalid input praebitus.",
    insufficientBalance: "Insufficiens balance."
  },

  // Success Messages
  success: {
    walletConnected: "Marsupium feliciter connectum!",
    drugDispensed: "Medicamentum feliciter dispensatum!",
    batchCreated: "Medicamentorum fasciculus feliciter creatus!",
    transferCompleted: "Translatio feliciter completa!"
  }
}; 