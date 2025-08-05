const { ethers } = require("hardhat");

async function main() {
    console.log("🔑 Hardhat Test Accounts Information");
    console.log("=====================================");
    
    const accounts = await ethers.getSigners();
    
    console.log("Import these accounts into MetaMask:\n");
    
    // These are the standard Hardhat test account private keys
    const testAccountKeys = [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
    ];
    
    for (let i = 0; i < Math.min(accounts.length, 5); i++) {
        const balance = await ethers.provider.getBalance(accounts[i].address);
        console.log(`Account ${i + 1}:`);
        console.log(`  Address: ${accounts[i].address}`);
        console.log(`  Private Key: ${testAccountKeys[i]}`);
        console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
        
        if (i === 0) {
            console.log(`  Role: ADMIN + MANUFACTURER (✅ Can create batches)`);
        } else if (i === 1) {
            console.log(`  Role: MANUFACTURER (✅ Can create batches)`);
        } else {
            console.log(`  Role: None (❌ Cannot create batches)`);
        }
        console.log();
    }
    
    console.log("📋 Instructions:");
    console.log("1. Copy the private key of Account 1 or Account 2");
    console.log("2. In MetaMask, click 'Import Account'");
    console.log("3. Paste the private key");
    console.log("4. Make sure you're connected to 'Hardhat Local' network");
    console.log("5. Refresh your frontend and try creating a batch");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
