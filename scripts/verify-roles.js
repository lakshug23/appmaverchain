const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Quick role verification...");
    
    // Get the deployed contract
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const MedChain = await ethers.getContractFactory("MedChain");
    const medChain = MedChain.attach(contractAddress);
    
    // The account you're using in frontend
    const frontendAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    
    const MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
    
    const hasManufacturerRole = await medChain.hasRole(MANUFACTURER_ROLE, frontendAccount);
    
    console.log(`Frontend account (${frontendAccount}):`);
    console.log(`Has MANUFACTURER_ROLE: ${hasManufacturerRole}`);
    
    if (hasManufacturerRole) {
        console.log("✅ Account has manufacturer role - frontend should work!");
    } else {
        console.log("❌ Account still doesn't have manufacturer role - need to debug further");
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
