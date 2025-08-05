const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Testing frontend compatibility...");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync("deployments/localhost.json", "utf8"));
  const medChainAddress = deploymentInfo.contracts.MedChain;

  // Get contract instance
  const MedChain = await ethers.getContractFactory("MedChain");
  const medChain = MedChain.attach(medChainAddress);

  // Get accounts
  const [admin, manufacturer] = await ethers.getSigners();

  console.log("Testing compatibility wrapper pattern...");
  
  // Test the pattern used by the frontend compatibility wrapper
  const drugName = "Frontend Test Drug";
  const drugCode = drugName.toLowerCase().replace(/\s+/g, '_');
  const regulatoryApproval = 'AUTO_APPROVED';
  const merkleRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const ipfsHash = 'QmDefault123';
  const quantity = 500;
  const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

  console.log("Creating batch with frontend-style parameters...");
  const tx = await medChain.connect(manufacturer).createDrugBatch(
    drugName,
    drugCode,
    regulatoryApproval,
    merkleRoot,
    ipfsHash,
    quantity,
    expiryDate
  );

  const receipt = await tx.wait();
  console.log("✅ Frontend compatibility test passed!");
  console.log("Transaction hash:", receipt.hash);
  
  // Get the created batch
  const batchInfo = await medChain.getDrugBatch(2); // Second batch
  console.log("Batch details:", {
    id: batchInfo.batchId.toString(),
    drugName: batchInfo.drugName,
    drugCode: batchInfo.drugCode,
    quantity: batchInfo.quantity.toString(),
    status: batchInfo.status.toString()
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
