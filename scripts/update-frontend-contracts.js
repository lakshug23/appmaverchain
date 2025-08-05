const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Updating frontend contract artifacts...");

  // Define paths
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  // Ensure frontend contracts directory exists
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Contract names to copy
  const contracts = ["MedChain.sol", "IPFSStorage.sol", "DrugVerification.sol"];

  // Copy each contract
  for (const contractFilename of contracts) {
    const contractName = path.basename(contractFilename, ".sol");
    const artifactPath = path.join(artifactsDir, contractFilename, `${contractName}.json`);
    const destPath = path.join(frontendContractsDir, `${contractName}.json`);

    if (!fs.existsSync(artifactPath)) {
      console.error(`❌ Artifact not found: ${artifactPath}`);
      continue;
    }

    // Read the artifact
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Write only the necessary parts to the frontend
    const frontendArtifact = {
      contractName: artifact.contractName,
      sourceName: artifact.sourceName,
      abi: artifact.abi,
      bytecode: artifact.bytecode
    };

    fs.writeFileSync(destPath, JSON.stringify(frontendArtifact, null, 2));
    console.log(`✅ Updated ${contractName} contract in frontend`);
  }

  console.log("✅ All frontend contracts updated successfully!");
  
  // Also update contract addresses from deployment
  updateContractAddresses();
}

function updateContractAddresses() {
  const deploymentPath = path.join(__dirname, "..", "deployments", "localhost.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.warn("⚠️ Deployment info not found. Contract addresses not updated.");
    return;
  }

  // Read deployment info
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  // Path to frontend contracts config
  const contractsConfigPath = path.join(__dirname, "..", "frontend", "src", "config", "contracts.js");
  
  if (!fs.existsSync(contractsConfigPath)) {
    console.warn(`⚠️ Frontend contracts config not found at ${contractsConfigPath}`);
    return;
  }
  
  // Read the current config file
  let contractsConfig = fs.readFileSync(contractsConfigPath, "utf8");
  
  // Update MedChain address
  if (deployment.contracts.MedChain) {
    contractsConfig = contractsConfig.replace(
      /address:\s*"0x[a-fA-F0-9]{40}",\s*\/\/\s*MedChain/,
      `address: "${deployment.contracts.MedChain}", // MedChain`
    );
    contractsConfig = contractsConfig.replace(
      /MedChain:\s*{\s*address:\s*"0x[a-fA-F0-9]{40}"/,
      `MedChain: {\n    address: "${deployment.contracts.MedChain}"`
    );
  }
  
  // Update IPFSStorage address
  if (deployment.contracts.IPFSStorage) {
    contractsConfig = contractsConfig.replace(
      /address:\s*"0x[a-fA-F0-9]{40}",\s*\/\/\s*IPFSStorage/,
      `address: "${deployment.contracts.IPFSStorage}", // IPFSStorage`
    );
    contractsConfig = contractsConfig.replace(
      /IPFSStorage:\s*{\s*address:\s*"0x[a-fA-F0-9]{40}"/,
      `IPFSStorage: {\n    address: "${deployment.contracts.IPFSStorage}"`
    );
  }
  
  // Update DrugVerification address
  if (deployment.contracts.DrugVerification) {
    contractsConfig = contractsConfig.replace(
      /address:\s*"0x[a-fA-F0-9]{40}",\s*\/\/\s*DrugVerification/,
      `address: "${deployment.contracts.DrugVerification}", // DrugVerification`
    );
    contractsConfig = contractsConfig.replace(
      /DrugVerification:\s*{\s*address:\s*"0x[a-fA-F0-9]{40}"/,
      `DrugVerification: {\n    address: "${deployment.contracts.DrugVerification}"`
    );
  }
  
  // Write the updated config back to the file
  fs.writeFileSync(contractsConfigPath, contractsConfig);
  console.log("✅ Contract addresses updated in frontend config");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error updating frontend contracts:", error);
    process.exit(1);
  });
