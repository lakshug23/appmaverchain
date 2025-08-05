// WHO Approved Drugs List with Auto-fill Suggestions
export const WHO_APPROVED_DRUGS = [
  // Pain Relief & Fever
  'Paracetamol', 'Acetaminophen', 'Aspirin', 'Ibuprofen', 'Naproxen', 'Diclofenac',
  'Ketorolac', 'Tramadol', 'Codeine', 'Morphine', 'Oxycodone', 'Fentanyl',
  
  // Antibiotics
  'Amoxicillin', 'Penicillin', 'Cephalexin', 'Azithromycin', 'Clarithromycin',
  'Doxycycline', 'Ciprofloxacin', 'Levofloxacin', 'Metronidazole', 'Clindamycin',
  'Vancomycin', 'Gentamicin', 'Tobramycin', 'Erythromycin', 'Tetracycline',
  
  // Diabetes & Cardiovascular
  'Metformin', 'Insulin', 'Glipizide', 'Gliclazide', 'Atorvastatin', 'Simvastatin',
  'Losartan', 'Amlodipine', 'Metoprolol', 'Propranolol', 'Furosemide',
  'Hydrochlorothiazide', 'Lisinopril', 'Enalapril', 'Captopril', 'Valsartan',
  'Irbesartan', 'Olmesartan', 'Carvedilol', 'Bisoprolol', 'Atenolol',
  
  // Gastrointestinal
  'Omeprazole', 'Pantoprazole', 'Esomeprazole', 'Lansoprazole', 'Ranitidine',
  'Famotidine', 'Cimetidine', 'Sucralfate', 'Bismuth', 'Loperamide',
  
  // Respiratory
  'Salbutamol', 'Albuterol', 'Budesonide', 'Fluticasone', 'Montelukast',
  'Theophylline', 'Ipratropium', 'Tiotropium', 'Formoterol', 'Salmeterol',
  
  // Mental Health
  'Sertraline', 'Fluoxetine', 'Citalopram', 'Escitalopram', 'Paroxetine',
  'Venlafaxine', 'Duloxetine', 'Bupropion', 'Mirtazapine', 'Trazodone',
  'Alprazolam', 'Diazepam', 'Lorazepam', 'Clonazepam', 'Zolpidem',
  
  // Anti-inflammatory & Immunosuppressants
  'Prednisone', 'Methylprednisolone', 'Hydrocortisone', 'Dexamethasone',
  'Methotrexate', 'Cyclosporine', 'Tacrolimus', 'Azathioprine', 'Mycophenolate',
  
  // Antiviral & Antifungal
  'Acyclovir', 'Valacyclovir', 'Oseltamivir', 'Zanamivir', 'Ritonavir',
  'Lopinavir', 'Remdesivir', 'Fluconazole', 'Itraconazole', 'Voriconazole',
  'Amphotericin B', 'Caspofungin', 'Micafungin',
  
  // Common Brand Names
  'Crocin', 'Dolo', 'Combiflam', 'Vicks', 'Strepsils', 'Betadine',
  'Augmentin', 'Zithromax', 'Cipro', 'Flagyl', 'Bactrim', 'Keflex',
  'Lipitor', 'Zocor', 'Cozaar', 'Norvasc', 'Lopressor', 'Lasix',
  'Prilosec', 'Nexium', 'Prevacid', 'Zantac', 'Ventolin', 'Advair',
  'Zoloft', 'Prozac', 'Celexa', 'Lexapro', 'Paxil', 'Effexor',
  'Xanax', 'Valium', 'Ativan', 'Klonopin', 'Ambien'
];

// Search function for auto-fill suggestions
export const searchWHODrugs = (query) => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  return WHO_APPROVED_DRUGS.filter(drug => 
    drug.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit to 10 suggestions
};

// Check if drug is WHO approved
export const isWHOApproved = (drugName) => {
  if (!drugName) return false;
  return WHO_APPROVED_DRUGS.some(drug => 
    drug.toLowerCase() === drugName.toLowerCase()
  );
};

// Get drug verification status
export const getDrugVerificationStatus = (drugName) => {
  const isApproved = isWHOApproved(drugName);
  return {
    isApproved,
    message: isApproved 
      ? `✅ ${drugName} is WHO approved` 
      : `❌ ${drugName} is not in WHO approved list`,
    color: isApproved ? 'green' : 'red'
  };
}; 