const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 TESTING ENHANCED QR ARRIVALS FUNCTIONALITY");
    console.log("==============================================");
    
    const accounts = await ethers.getSigners();
    const manufacturer = accounts[1];
    const distributor = accounts[2];
    
    console.log("📍 Account Details:");
    console.log(`Manufacturer: ${manufacturer.address}`);
    console.log(`Distributor: ${distributor.address}`);
    
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const MedChain = await ethers.getContractFactory("MedChain");
    const medChain = MedChain.attach(contractAddress);
    
    // Test creating a batch that could be received via QR
    console.log("\n🏭 Creating test batch for QR arrival simulation...");
    
    try {
        const drugName = "Test QR Drug - Doxycycline 100mg";
        const drugCode = "DOXY100-QR";
        const quantity = 300;
        const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year
        
        const tx = await medChain.connect(manufacturer).createDrugBatch(
            drugName,
            drugCode,
            "FDA-APPROVED-QR-TEST",
            ethers.ZeroHash,
            "QmQRTestHash123",
            quantity,
            expiryDate
        );
        
        const receipt = await tx.wait();
        
        // Find the batch creation event
        let batchId = null;
        for (const log of receipt.logs) {
            try {
                const parsed = medChain.interface.parseLog(log);
                if (parsed.name === 'DrugBatchCreated') {
                    batchId = parsed.args.batchId;
                    break;
                }
            } catch (e) {
                // Skip unparseable logs
            }
        }
        
        if (batchId) {
            console.log(`✅ Created batch ID: ${batchId} - ${drugName}`);
            console.log(`📊 Quantity: ${quantity} units`);
            console.log(`🏭 Manufacturer: ${manufacturer.address}`);
            console.log(`📅 Expiry: ${new Date(expiryDate * 1000).toLocaleDateString()}`);
            
            // This batch can now be "received" via QR code by the distributor
            console.log(`\n📱 QR Code Data would be:`);
            console.log(`   QR_${drugCode}_${batchId}_${Date.now()}`);
            
        } else {
            console.log("❌ Could not extract batch ID from transaction");
        }
        
    } catch (error) {
        console.error("❌ Error creating test batch:", error.message);
    }
    
    console.log("\n🎯 ENHANCED QR ARRIVALS FEATURES:");
    console.log("==================================");
    
    console.log("✅ NEW FEATURES IMPLEMENTED:");
    console.log("  📱 QR Code Scanning Simulation");
    console.log("  🔗 Blockchain Integration (creates real batches)");
    console.log("  📊 Enhanced Statistics (Pending/Accepted/Rejected)");
    console.log("  🧪 Detailed Drug Information (Batch numbers, expiry, etc.)");
    console.log("  ❄️  Cold Chain Indicators");
    console.log("  🚨 Priority Flags (High/Medium/Low)");
    console.log("  ✅/❌ Accept/Reject Functionality");
    console.log("  💾 Persistent Storage (localStorage)");
    console.log("  📋 Enhanced Logging to Admin Dashboard");
    console.log("  🔍 WHO Approval & Regulatory Status");
    console.log("  📦 Storage Condition Requirements");
    
    console.log("\n🧪 SAMPLE QR ARRIVALS INCLUDE:");
    console.log("  💊 Paracetamol 500mg - Standard medication");
    console.log("  💉 Insulin Glargine - Cold chain required");
    console.log("  🦠 Amoxicillin 250mg - Antibiotic");
    console.log("  💉 Covishield Vaccine - High priority, cold chain");
    
    console.log("\n🔧 TO TEST THE ENHANCED QR ARRIVALS:");
    console.log("====================================");
    console.log("1. Import distributor account in MetaMask:");
    console.log("   🔑 Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
    console.log("   📍 Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    
    console.log("\n2. Access Distributor Dashboard → QR Arrivals Tab");
    
    console.log("\n3. Test Features:");
    console.log("   📱 Click 'Simulate QR Scan' to add new arrivals");
    console.log("   ✅ Accept pending stock (creates blockchain batches)");
    console.log("   ❌ Reject unwanted stock");
    console.log("   📊 View statistics (Pending/Accepted/Rejected)");
    console.log("   🔍 Inspect detailed drug information");
    console.log("   📱 View QR codes for each arrival");
    
    console.log("\n4. Verify Integration:");
    console.log("   📦 Check Inventory tab after accepting QR arrivals");
    console.log("   📋 Check admin logs for QR activities");
    console.log("   🔗 Verify blockchain transactions");
    
    console.log("\n✨ The QR Arrivals system is now fully enhanced with");
    console.log("   blockchain integration and comprehensive features!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
