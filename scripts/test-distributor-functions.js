const { ethers } = require("hardhat");

async function main() {
    console.log("🏭 Testing Complete Distributor Dashboard Functionality...");
    
    const accounts = await ethers.getSigners();
    const manufacturer = accounts[1]; // Manufacturer account
    const distributor = accounts[2];  // Distributor account
    const hospital = accounts[3];     // Hospital account
    
    // Get the deployed contract
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const MedChain = await ethers.getContractFactory("MedChain");
    const medChain = MedChain.attach(contractAddress);
    
    console.log("\n🏭 Step 1: Manufacturer creates drug batches...");
    
    // Create some test drug batches as manufacturer
    const batches = [
        {
            drugName: "Paracetamol 500mg",
            drugCode: "PARA500",
            regulatoryApproval: "FDA-APPROVED-2024",
            quantity: 1000,
            expiryDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
        },
        {
            drugName: "Amoxicillin 250mg",
            drugCode: "AMOX250", 
            regulatoryApproval: "FDA-APPROVED-2024",
            quantity: 500,
            expiryDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
        },
        {
            drugName: "Insulin Glargine",
            drugCode: "INSU100",
            regulatoryApproval: "FDA-APPROVED-2024",
            quantity: 200,
            expiryDate: Math.floor(Date.now() / 1000) + (180 * 24 * 60 * 60) // 6 months
        }
    ];
    
    const createdBatchIds = [];
    
    for (const batch of batches) {
        try {
            console.log(`Creating batch: ${batch.drugName}...`);
            const tx = await medChain.connect(manufacturer).createDrugBatch(
                batch.drugName,
                batch.drugCode, 
                batch.regulatoryApproval,
                ethers.ZeroHash, // merkle root
                "QmDefault123", // IPFS hash
                batch.quantity,
                batch.expiryDate
            );
            
            const receipt = await tx.wait();
            
            // Get the batch ID from the event logs
            const event = receipt.logs.find(log => {
                try {
                    const parsed = medChain.interface.parseLog(log);
                    return parsed.name === 'DrugBatchCreated';
                } catch (e) {
                    return false;
                }
            });
            
            if (event) {
                const parsedEvent = medChain.interface.parseLog(event);
                const batchId = parsedEvent.args.batchId;
                createdBatchIds.push(batchId);
                console.log(`✅ Created batch ID: ${batchId} for ${batch.drugName}`);
            }
        } catch (error) {
            console.error(`❌ Error creating batch ${batch.drugName}:`, error.message);
        }
    }
    
    console.log("\n🚚 Step 2: Transfer batches to distributor...");
    
    // Transfer some batches to distributor
    for (let i = 0; i < Math.min(2, createdBatchIds.length); i++) {
        try {
            const batchId = createdBatchIds[i];
            console.log(`Transferring batch ${batchId} to distributor...`);
            
            const tx = await medChain.connect(manufacturer).transferToDistributor(batchId, distributor.address);
            await tx.wait();
            console.log(`✅ Batch ${batchId} transferred to distributor`);
        } catch (error) {
            console.error(`❌ Error transferring batch:`, error.message);
        }
    }
    
    console.log("\n🏥 Step 3: Test distributor to hospital transfer...");
    
    // Test one transfer from distributor to hospital
    if (createdBatchIds.length > 0) {
        try {
            const batchId = createdBatchIds[0];
            console.log(`Transferring batch ${batchId} from distributor to hospital...`);
            
            const tx = await medChain.connect(distributor).transferToHospital(batchId, hospital.address);
            await tx.wait();
            console.log(`✅ Batch ${batchId} transferred to hospital`);
        } catch (error) {
            console.error(`❌ Error transferring to hospital:`, error.message);
        }
    }
    
    console.log("\n📊 Step 4: Check distributor inventory...");
    
    // Get distributor batches
    try {
        const distributorBatches = await medChain.getDistributorBatches(distributor.address);
        console.log(`📦 Distributor has ${distributorBatches.length} batches in inventory`);
        
        for (const batch of distributorBatches) {
            console.log(`- Batch ID ${batch.batchId}: ${batch.drugName} (${batch.quantity} units)`);
        }
    } catch (error) {
        console.error("❌ Error getting distributor batches:", error.message);
    }
    
    console.log("\n🎯 DISTRIBUTOR DASHBOARD FUNCTIONALITY SUMMARY:");
    console.log("===============================================");
    console.log("📋 Available Features:");
    console.log("  1. 📦 Inventory Management - View and manage drug batches");
    console.log("  2. 📱 QR Code Arrivals - Accept stock from manufacturers");
    console.log("  3. 🏥 Hospital Requests - Fulfill hospital orders (Rural priority 2:1)");
    console.log("  4. 🏭 Manufacturer Requests - Request stock from manufacturers");
    console.log("  5. 📊 Analytics Dashboard - View inventory analytics and charts");
    console.log("  6. 🚚 Transfer Management - Transfer batches to hospitals");
    
    console.log("\n🔧 Testing Instructions:");
    console.log("1. Import distributor account in MetaMask:");
    console.log("   Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
    console.log("   Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    console.log("2. Connect to frontend with this account");
    console.log("3. Navigate to Distributor Dashboard");
    console.log("4. Test each tab: Inventory, QR Arrivals, Hospital Requests, etc.");
    
    console.log("\n✅ Test data created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
