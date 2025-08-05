const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking and granting roles...");
    
    const accounts = await ethers.getSigners();
    const deployer = accounts[0]; // Admin account
    const manufacturerAccount = accounts[1]; // Should be manufacturer
    
    console.log("Admin account (deployer):", deployer.address);
    console.log("Manufacturer account:", manufacturerAccount.address);
    
    // Get the deployed contract
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const MedChain = await ethers.getContractFactory("MedChain");
    const medChain = MedChain.attach(contractAddress);
    
    // Define role hashes
    const MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    
    console.log("\n🔍 Checking current roles...");
    
    // Check roles for deployer (first account)
    const deployerHasAdmin = await medChain.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const deployerHasAdminRole = await medChain.hasRole(ADMIN_ROLE, deployer.address);
    const deployerHasManufacturer = await medChain.hasRole(MANUFACTURER_ROLE, deployer.address);
    
    console.log(`Deployer (${deployer.address}):`);
    console.log(`  - DEFAULT_ADMIN_ROLE: ${deployerHasAdmin}`);
    console.log(`  - ADMIN_ROLE: ${deployerHasAdminRole}`);
    console.log(`  - MANUFACTURER_ROLE: ${deployerHasManufacturer}`);
    
    // Check roles for manufacturer account (second account)
    const manufacturerHasManufacturer = await medChain.hasRole(MANUFACTURER_ROLE, manufacturerAccount.address);
    
    console.log(`Manufacturer Account (${manufacturerAccount.address}):`);
    console.log(`  - MANUFACTURER_ROLE: ${manufacturerHasManufacturer}`);
    
    // Grant manufacturer role to both accounts for convenience
    console.log("\n🔧 Granting manufacturer role to both accounts...");
    
    if (!deployerHasManufacturer) {
        console.log("Granting manufacturer role to deployer account...");
        await medChain.grantManufacturerRole(deployer.address);
        console.log("✅ Manufacturer role granted to deployer");
    } else {
        console.log("✅ Deployer already has manufacturer role");
    }
    
    if (!manufacturerHasManufacturer) {
        console.log("Granting manufacturer role to manufacturer account...");
        await medChain.grantManufacturerRole(manufacturerAccount.address);
        console.log("✅ Manufacturer role granted to manufacturer account");
    } else {
        console.log("✅ Manufacturer account already has manufacturer role");
    }
    
    console.log("\n🎉 Role setup complete!");
    console.log("Both accounts now have manufacturer role and can create drug batches.");
    
    // Verify the roles were granted
    console.log("\n🔍 Verifying roles after granting...");
    const deployerHasManufacturerAfter = await medChain.hasRole(MANUFACTURER_ROLE, deployer.address);
    const manufacturerHasManufacturerAfter = await medChain.hasRole(MANUFACTURER_ROLE, manufacturerAccount.address);
    
    console.log(`Deployer MANUFACTURER_ROLE: ${deployerHasManufacturerAfter}`);
    console.log(`Manufacturer MANUFACTURER_ROLE: ${manufacturerHasManufacturerAfter}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
