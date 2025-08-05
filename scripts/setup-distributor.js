const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Setting up Distributor Account for Testing...");
    
    const accounts = await ethers.getSigners();
    const admin = accounts[0]; // Admin account
    const distributorAccount = accounts[2]; // Third account will be distributor
    
    console.log("Admin account:", admin.address);
    console.log("Distributor account:", distributorAccount.address);
    
    // Get the deployed contract
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const MedChain = await ethers.getContractFactory("MedChain");
    const medChain = MedChain.attach(contractAddress);
    
    const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
    
    // Check if distributor already has role
    const hasDistributorRole = await medChain.hasRole(DISTRIBUTOR_ROLE, distributorAccount.address);
    
    if (!hasDistributorRole) {
        console.log("🔧 Granting distributor role...");
        await medChain.grantDistributorRole(distributorAccount.address);
        console.log("✅ Distributor role granted!");
    } else {
        console.log("✅ Account already has distributor role");
    }
    
    // Get account balance
    const balance = await ethers.provider.getBalance(distributorAccount.address);
    
    console.log("\n========================================");
    console.log("🏪 DISTRIBUTOR ACCOUNT DETAILS");
    console.log("========================================");
    console.log(`Address: ${distributorAccount.address}`);
    console.log(`Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`Has DISTRIBUTOR_ROLE: ${await medChain.hasRole(DISTRIBUTOR_ROLE, distributorAccount.address)}`);
    
    console.log("\n📋 Instructions:");
    console.log("1. Import this account in MetaMask using the private key above");
    console.log("2. Switch to 'Hardhat Local' network in MetaMask");
    console.log("3. Go to the frontend and navigate to Distributor Dashboard");
    console.log("4. Connect with this account to access distributor features");
    console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
