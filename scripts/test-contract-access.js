const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing contract accessibility from web3 perspective...");
  
  // Test with the same address the frontend is using
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  // Create a provider that mimics what the frontend would use
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  console.log("📡 Provider network:", await provider.getNetwork());
  
  // Test basic contract call
  try {
    const code = await provider.getCode(contractAddress);
    console.log("✅ Contract code exists at address:", contractAddress);
    console.log("📄 Code length:", code.length);
    
    if (code === "0x") {
      console.error("❌ No code deployed at this address!");
      return;
    }
    
    // Load ABI and test function call
    const MedChain = await ethers.getContractFactory("MedChain");
    const contract = MedChain.attach(contractAddress);
    
    // Test a simple view function
    const manufacturerRole = await contract.MANUFACTURER_ROLE();
    console.log("✅ MANUFACTURER_ROLE:", manufacturerRole);
    
    // Check if the deployment info matches
    const deploymentInfo = require("../deployments/localhost.json");
    console.log("📋 Deployment info:", deploymentInfo.contracts);
    
    if (deploymentInfo.contracts.MedChain !== contractAddress) {
      console.error("❌ Address mismatch!");
      console.error("Frontend config:", contractAddress);
      console.error("Deployment file:", deploymentInfo.contracts.MedChain);
    } else {
      console.log("✅ Addresses match perfectly!");
    }
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
}

main().catch(console.error);
