const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying Manufacturer Account...");
    
    // The manufacturer account you're importing
    const manufacturerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    
    // Get the deployed contract
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const MedChain = await ethers.getContractFactory("MedChain");
    const medChain = MedChain.attach(contractAddress);
    
    const MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
    
    // Check if the manufacturer account has the role
    const hasManufacturerRole = await medChain.hasRole(MANUFACTURER_ROLE, manufacturerAddress);
    
    // Get balance
    const balance = await ethers.provider.getBalance(manufacturerAddress);
    
    console.log("========================================");
    console.log(`Account: ${manufacturerAddress}`);
    console.log(`Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`Has MANUFACTURER_ROLE: ${hasManufacturerRole}`);
    
    if (hasManufacturerRole) {
        console.log("✅ This account CAN create drug batches!");
        console.log("\n📋 Next steps:");
        console.log("1. Import this account in MetaMask using the private key above");
        console.log("2. Switch to 'Hardhat Local' network in MetaMask");
        console.log("3. Connect your wallet to the frontend");
        console.log("4. Try creating a drug batch - it should work now!");
    } else {
        console.log("❌ This account CANNOT create drug batches!");
        console.log("Something went wrong with role assignment.");
    }
    console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
