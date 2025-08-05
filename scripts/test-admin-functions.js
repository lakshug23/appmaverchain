const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Checking admin roles and permissions...");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync("deployments/localhost.json", "utf8"));
  const medChainAddress = deploymentInfo.contracts.MedChain;

  // Get contract instance
  const MedChain = await ethers.getContractFactory("MedChain");
  const medChain = MedChain.attach(medChainAddress);

  // Get accounts
  const [admin, manufacturer, distributor, hospital, patient] = await ethers.getSigners();

  console.log("Contract address:", medChainAddress);
  console.log("Admin address:", admin.address);

  // Check admin role
  const adminRole = await medChain.ADMIN_ROLE();
  const defaultAdminRole = await medChain.DEFAULT_ADMIN_ROLE();
  
  console.log("Admin role hash:", adminRole);
  console.log("Default admin role hash:", defaultAdminRole);

  const hasAdminRole = await medChain.hasRole(adminRole, admin.address);
  const hasDefaultAdminRole = await medChain.hasRole(defaultAdminRole, admin.address);
  
  console.log("Admin has ADMIN_ROLE:", hasAdminRole);
  console.log("Admin has DEFAULT_ADMIN_ROLE:", hasDefaultAdminRole);

  // If admin doesn't have the role, grant it
  if (!hasAdminRole) {
    console.log("Granting ADMIN_ROLE to admin...");
    try {
      const tx = await medChain.connect(admin).grantRole(adminRole, admin.address);
      await tx.wait();
      console.log("✅ ADMIN_ROLE granted successfully");
    } catch (error) {
      console.error("❌ Error granting admin role:", error.message);
    }
  }

  // Test hospital registration (this is what's failing in the frontend)
  console.log("\nTesting hospital registration...");
  try {
    const testHospitalAddress = hospital.address; // Use one of the test accounts
    const testHospitalName = "Test Hospital";
    const registrationNumber = "REG-2024-001";
    const hospitalType = 0; // Urban
    const stockThreshold = 100;
    const capacity = 500;

    console.log("Hospital address:", testHospitalAddress);

    const tx = await medChain.connect(admin).registerHospital(
      testHospitalAddress,
      testHospitalName,
      registrationNumber,
      hospitalType,
      stockThreshold,
      capacity
    );
    await tx.wait();
    console.log("✅ Hospital registration successful!");
    console.log("Transaction hash:", tx.hash);
  } catch (error) {
    console.error("❌ Error registering hospital:", error.message);
  }

  // Test role granting
  console.log("\nTesting role granting...");
  try {
    const distributorRole = await medChain.DISTRIBUTOR_ROLE();
    const tx = await medChain.connect(admin).grantRole(distributorRole, distributor.address);
    await tx.wait();
    console.log("✅ Role granting successful!");
    console.log("Transaction hash:", tx.hash);
  } catch (error) {
    console.error("❌ Error granting role:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
