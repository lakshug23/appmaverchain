export const fr = {
  // Navigation
  nav: {
    verifyDrugs: "Vérifier les médicaments",
    forecasting: "Prévision",
    healthRecords: "Dossiers de santé",
    signOut: "Se déconnecter",
    admin: "Administrateur"
  },

  // Home Page
  home: {
    hero: {
      title: "Révolutionner la chaîne d'approvisionnement en santé",
      subtitle: "Propulsé par l'équipe Mavericks.",
      connectWallet: "Connecter le portefeuille",
      quickVerification: "Vérification rapide des médicaments",
      signIn: "Se connecter pour un accès complet"
    },
    timeline: {
      title: "Qu'avons-nous construit ?",
      subtitle: "Un processus simple, sécurisé et transparent qui assure l'authenticité des médicaments du fabricant au patient.",
      step1: {
        title: "Fabrication",
        description: "Le fabricant crée des lots de médicaments avec vérification de l'arbre Merkle et les télécharge sur IPFS."
      },
      step2: {
        title: "Distribution",
        description: "Les distributeurs reçoivent et vérifient les lots de médicaments, gèrent l'inventaire et répondent aux demandes des hôpitaux."
      },
      step3: {
        title: "Soins hospitaliers",
        description: "Les hôpitaux vérifient l'authenticité des médicaments, gèrent les stocks et dispensent aux patients."
      },
      step4: {
        title: "Accès patient",
        description: "Les patients accèdent en toute sécurité à leurs dossiers de santé et à leur historique médicamenteux."
      }
    },
    features: {
      title: "Fonctionnalités clés",
      blockchain: {
        title: "Traçabilité blockchain",
        description: "Suivez les médicaments du fabricant au patient avec des enregistrements blockchain immuables."
      },
      verification: {
        title: "Vérification des médicaments",
        description: "Vérifiez l'authenticité des médicaments en utilisant des preuves Merkle et des signatures cryptographiques."
      },
      hospital: {
        title: "Gestion hospitalière",
        description: "Gestion d'inventaire rationalisée avec surveillance intelligente des seuils."
      },
      records: {
        title: "Dossiers de santé",
        description: "Dossiers de santé sécurisés et contrôlés par les patients stockés sur IPFS."
      },
      who: {
        title: "Intégration OMS",
        description: "Intégration avec les bases de données de médicaments approuvées par l'OMS pour la conformité."
      },
      realtime: {
        title: "Mises à jour en temps réel",
        description: "Notifications instantanées pour les événements critiques et les alertes de seuil."
      }
    },
    cta: {
      title: "Prêt à transformer les soins de santé ?",
      subtitle: "Rejoignez l'avenir de la gestion de la chaîne d'approvisionnement pharmaceutique avec la plateforme alimentée par blockchain de MaverChain.",
      getStarted: "Commencer maintenant",
      startVerifying: "Commencer à vérifier les médicaments"
    }
  },

  // Dashboard Titles
  dashboard: {
    manufacturer: "Tableau de bord fabricant",
    distributor: "Tableau de bord distributeur",
    hospital: "Tableau de bord hôpital",
    patient: "Tableau de bord patient",
    admin: "Tableau de bord administrateur"
  },

  // Admin Dashboard
  admin: {
    title: "🏥 Tableau de bord MaverChain",
    subtitle: "Administration système et gestion des rôles",
    systemAdmin: "Administrateur système",
    fullAccess: "Contrôle d'accès complet",
    connected: "Connecté",
    quickSetup: {
      title: "🚀 Configuration rapide",
      subtitle: "Configurer tous les comptes d'exemple",
      description: "Cela accordera des rôles appropriés à tous les comptes d'exemple pour tester le flux de travail complet de la chaîne d'approvisionnement.",
      button: "Configurer tous les rôles d'exemple",
      loading: "Configuration des rôles..."
    },
    sampleAccounts: {
      title: "👥 Comptes d'exemple",
      name: "Nom",
      address: "Adresse",
      requiredRole: "Rôle requis",
      patientId: "ID patient"
    },
    grantRoles: {
      title: "Accorder les rôles utilisateur",
      userAddress: "Adresse utilisateur",
      role: "Rôle",
      manufacturer: "Fabricant",
      distributor: "Distributeur",
      hospital: "Hôpital",
      patient: "Patient",
      button: "Accorder le rôle",
      loading: "Accord en cours...",
      success: "Rôle accordé avec succès!",
      error: "Erreur lors de l'octroi du rôle"
    },
    registerHospital: {
      title: "Enregistrer l'hôpital",
      hospitalAddress: "Adresse de l'hôpital",
      hospitalName: "Nom de l'hôpital",
      hospitalType: "Type d'hôpital",
      urban: "Urbain",
      rural: "Rural",
      stockThreshold: "Seuil de stock",
      button: "Enregistrer l'hôpital",
      loading: "Enregistrement en cours...",
      success: "Hôpital enregistré avec succès!",
      error: "Erreur lors de l'enregistrement de l'hôpital"
    },
    whoDrugs: {
      title: "Médicaments approuvés par l'OMS",
      drugName: "Nom du médicament",
      button: "Ajouter un médicament approuvé par l'OMS",
      loading: "Ajout en cours...",
      success: "Médicament approuvé par l'OMS ajouté avec succès!",
      error: "Erreur lors de l'ajout du médicament OMS",
      note: "Note: Cela créera un hash pour le nom du médicament avec le suffixe WHO-2024"
    },
    systemStats: {
      title: "Statistiques système",
      totalBatches: "Total des lots",
      activeHospitals: "Hôpitaux actifs",
      totalUsers: "Total des utilisateurs",
      whoDrugs: "Médicaments OMS"
    },
    recentActivity: {
      title: "📊 Activité système récente",
      noActivity: "Aucune activité récente",
      description: "Les événements système et transactions apparaîtront ici"
    }
  },

  // Manufacturer Dashboard
  manufacturer: {
    title: "🏭 Tableau de bord fabricant",
    subtitle: "Créer des lots, générer des codes QR, gérer la production",
    role: "Fabricant",
    roleDescription: "Gestion des lots",
    createBatch: {
      title: "Créer un nouveau lot",
      drugName: "Nom du médicament",
      quantity: "Quantité",
      expiryDate: "Date d'expiration",
      button: "Créer le lot",
      loading: "Création...",
      success: "Lot créé avec succès!",
      error: "Erreur lors de la création du lot"
    },
    batchManagement: {
      title: "Gestion des lots",
      refreshButton: "Actualiser les lots",
      loading: "Chargement...",
      loadingBatches: "Chargement des lots...",
      noBatches: "Aucun lot pour le moment",
      noBatchesDescription: "Créez votre premier lot de médicaments en utilisant le formulaire ci-dessus.",
      quantity: "Quantité",
      expiry: "Expiration",
      units: "unités",
      qrCode: "📱 Code QR",
      transfer: "🚚 Transfert"
    },
    transferModal: {
      title: "Transférer le lot",
      recipientAddress: "Adresse du destinataire",
      button: "Transférer le lot",
      loading: "Transfert...",
      success: "Lot transféré avec succès!",
      error: "Erreur lors du transfert du lot"
    },
    qrModal: {
      title: "Code QR pour le lot",
      close: "Fermer"
    }
  },
  actions: {
    back: "Retour",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    view: "Voir",
    add: "Ajouter",
    update: "Mettre à jour",
    submit: "Soumettre",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès"
  },

  // Form Labels
  forms: {
    drugName: "Nom du médicament",
    batchId: "ID du lot",
    quantity: "Quantité",
    manufacturer: "Fabricant",
    patientAddress: "Adresse du patient",
    hospitalAddress: "Adresse de l'hôpital",
    distributorAddress: "Adresse du distributeur",
    selectDrug: "Sélectionner un médicament",
    forecastPeriod: "Période de prévision (jours)",
    region: "Région"
  },

  // Status Messages
  status: {
    connected: "Connecté",
    disconnected: "Déconnecté",
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
    inTransit: "En transit",
    delivered: "Livré",
    dispensed: "Dispensé"
  },

  // Error Messages
  errors: {
    walletNotConnected: "Portefeuille non connecté. Veuillez connecter votre portefeuille.",
    unauthorizedWallet: "Adresse de portefeuille non autorisée.",
    networkError: "Une erreur réseau s'est produite.",
    invalidInput: "Entrée invalide fournie.",
    insufficientBalance: "Solde insuffisant."
  },

  // Success Messages
  success: {
    walletConnected: "Portefeuille connecté avec succès !",
    drugDispensed: "Médicament dispensé avec succès !",
    batchCreated: "Lot de médicaments créé avec succès !",
    transferCompleted: "Transfert terminé avec succès !"
  }
}; 