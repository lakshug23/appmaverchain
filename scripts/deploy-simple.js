const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting SimpleMedChain deployment...");

    // Get the ContractFactory and Signers here.
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying contracts with the account:", deployer.address);
    console.log("💰 Account balance:", (await deployer.getBalance()).toString());

    // Deploy SimpleMedChain contract
    console.log("\n📦 Deploying SimpleMedChain contract...");
    const SimpleMedChain = await ethers.getContractFactory("SimpleMedChain");
    const simpleMedChain = await SimpleMedChain.deploy();

    await simpleMedChain.deployed();

    console.log("✅ SimpleMedChain deployed to:", simpleMedChain.address);

    // Setup initial roles and test data
    console.log("\n🔧 Setting up initial configuration...");
    
    // Get additional test accounts
    const [admin, manufacturer, distributor, hospital, patient] = await ethers.getSigners();
    
    // Grant roles
    console.log("👥 Granting roles to test accounts...");
    await simpleMedChain.grantManufacturerRole(manufacturer.address);
    await simpleMedChain.grantDistributorRole(distributor.address);
    await simpleMedChain.grantHospitalRole(hospital.address);
    await simpleMedChain.grantPatientRole(patient.address);
    
    console.log("🏭 Manufacturer role granted to:", manufacturer.address);
    console.log("🚚 Distributor role granted to:", distributor.address);
    console.log("🏥 Hospital role granted to:", hospital.address);
    console.log("👤 Patient role granted to:", patient.address);

    // Register a test hospital
    console.log("\n🏥 Registering test hospital...");
    await simpleMedChain.connect(admin).registerHospital(
        hospital.address, // hospital address
        "Apollo Hospital Hyderabad", // name
        "REG-12345", // registration number
        0, // Urban hospital type
        100, // stock threshold
        500 // capacity
    );
    console.log("✅ Hospital registered successfully");

    // Create a test drug batch
    console.log("\n💊 Creating test drug batch...");
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_batch_data"));
    const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now
    
    const tx = await simpleMedChain.connect(manufacturer).createDrugBatch(
        "Paracetamol 500mg", // _drugName
        "paracetamol_500mg", // _drugCode
        "WHO_APPROVED_2024", // _regulatoryApproval
        merkleRoot, // _merkleRoot
        "QmSampleIPFSHash123", // _ipfsHash
        1000, // _quantity
        expiryDate // _expiryDate
    );
    
    const receipt = await tx.wait();
    console.log("✅ Test drug batch created successfully");

    // Save deployment information
    const deploymentInfo = {
        contractAddress: simpleMedChain.address,
        deployer: deployer.address,
        manufacturer: manufacturer.address,
        distributor: distributor.address,
        hospital: hospital.address,
        patient: patient.address,
        networkName: network.name,
        deploymentTime: new Date().toISOString()
    };

    console.log("\n📋 Deployment Summary:");
    console.log("====================");
    console.log("Contract Address:", simpleMedChain.address);
    console.log("Network:", network.name);
    console.log("Deployer:", deployer.address);
    console.log("Gas Used:", receipt.gasUsed.toString());
    
    console.log("\n🎯 Test Accounts:");
    console.log("Admin/Deployer:", deployer.address);
    console.log("Manufacturer:", manufacturer.address);
    console.log("Distributor:", distributor.address);
    console.log("Hospital:", hospital.address);
    console.log("Patient:", patient.address);

    // Write deployment info to file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentPath = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(deploymentPath, 'simple-localhost.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Deployment info saved to deployments/simple-localhost.json");
    console.log("\n🎉 Deployment completed successfully!");
    
    return {
        simpleMedChain,
        accounts: {
            admin: deployer,
            manufacturer,
            distributor,
            hospital,
            patient
        }
    };
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
