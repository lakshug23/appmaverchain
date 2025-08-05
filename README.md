# Maverchain - Blockchain-Based Drug Supply Chain Management System

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/solidity-%5E0.8.19-orange)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/hardhat-%5E2.0.0-yellow)](https://hardhat.org/)

## Table of Contents

- [Overview](#overview)
- [Team](#team)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

Maverchain is a comprehensive blockchain-based drug supply chain management system that ensures transparency, authenticity, and traceability of pharmaceutical products from manufacturer to end consumer. Built on Ethereum blockchain technology, it prevents counterfeit drugs from entering the supply chain while providing real-time tracking and verification capabilities.

## Team

**Team Name:** Maverchain Innovation Team

**Team Members:**
- Lead Developer & Blockchain Architect
- Frontend Developer & UI/UX Designer  
- Smart Contract Developer
- QA Engineer & Security Specialist

## Problem Statement

The pharmaceutical industry faces critical challenges:

- **Counterfeit Drugs**: WHO estimates that 10% of medical products in developing countries are counterfeit
- **Supply Chain Opacity**: Lack of transparency in drug distribution networks
- **Verification Difficulties**: No reliable way to verify drug authenticity at point of sale
- **Inventory Management**: Inefficient tracking of drug batches and expiration dates
- **Regulatory Compliance**: Difficulty in maintaining audit trails for regulatory bodies

## Solution

Maverchain provides a decentralized, transparent, and secure platform for managing pharmaceutical supply chains using blockchain technology. The system creates an immutable record of each drug's journey from manufacturer to patient, ensuring authenticity and enabling rapid identification of counterfeit products.

## Key Features

### 🔗 **Blockchain Integration**
- Ethereum-based smart contracts for immutable record keeping
- Decentralized verification system
- Transparent transaction history

### 📱 **Multi-Role Dashboard System**
- **Admin Dashboard**: System oversight and user management
- **Manufacturer Interface**: Drug registration and batch creation
- **Distributor Portal**: Inventory management and order processing
- **Hospital Dashboard**: Stock management and patient dispensing
- **Consumer Portal**: Drug verification and authenticity checking

### 🗺️ **Interactive Map Integration**
- Real-time distributor network visualization
- Geographic tracking of drug shipments
- Location-based inventory management
- Enhanced map backgrounds with geographical landmarks

### 📱 **QR Code Technology**
- Unique QR codes for each drug batch
- Mobile-friendly scanning interface
- Instant verification capabilities
- Batch tracking and expiration monitoring

### 🔒 **Security Features**
- Role-based access control
- Cryptographic verification
- Tamper-proof records
- Multi-signature transactions

### 📊 **Analytics & Reporting**
- Real-time inventory tracking
- Supply chain analytics
- Compliance reporting
- Audit trail generation

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Ethereum)    │
│                 │    │                 │    │                 │
│ • Admin Panel   │    │ • API Layer     │    │ • Smart         │
│ • Dashboards    │    │ • Authentication│    │   Contracts     │
│ • QR Scanner    │    │ • Data          │    │ • Token         │
│ • Map Interface │    │   Processing    │    │   Management    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                     ┌─────────────────┐
                     │   Database      │
                     │   (Local/IPFS)  │
                     │                 │
                     │ • User Data     │
                     │ • Metadata      │
                     │ • Cache         │
                     └─────────────────┘
```

## Technologies Used

### **Blockchain & Smart Contracts**
- **Solidity ^0.8.19** - Smart contract development
- **Hardhat** - Development environment and testing framework
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js** - Ethereum interaction library

### **Frontend**
- **React ^18.0.0** - User interface framework
- **JavaScript/JSX** - Programming languages
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing

### **Development Tools**
- **Node.js ^14.0.0** - Runtime environment
- **npm/pnpm** - Package management
- **Git** - Version control
- **VS Code** - Development environment

### **Integration Libraries**
- **QR Code Libraries** - QR generation and scanning
- **Web3 Libraries** - Blockchain interaction
- **Crypto Libraries** - Cryptographic operations

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 14.0.0 or higher)
- **npm** or **pnpm** package manager
- **Git** for version control
- **MetaMask** or compatible Web3 wallet
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/swethaswini/maverchain.git
cd maverchain/maverchain-main
```

### 2. Install Dependencies

```bash
# Install blockchain dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Network Configuration
NETWORK=localhost
PORT=8545

# Wallet Configuration (Optional for local development)
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id

# Frontend Configuration
REACT_APP_NETWORK=localhost
REACT_APP_CONTRACT_ADDRESS=will_be_populated_after_deployment
```

## Usage

### 1. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat local network
npm run node
```

### 2. Deploy Smart Contracts

```bash
# Terminal 2: Deploy contracts to local network
npm run deploy
```

### 3. Start Frontend Application

```bash
# Terminal 3: Start React frontend
npm run frontend
```

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3001
- **Blockchain RPC**: http://localhost:8545

### 5. Setup MetaMask

1. Install MetaMask browser extension
2. Add local network:
   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

### 6. Import Test Accounts

Use the private keys displayed when starting the Hardhat node to import test accounts into MetaMask.

## API Documentation

### Smart Contract Methods

#### Drug Registration
```solidity
function registerDrug(
    string memory name,
    string memory manufacturer,
    uint256 expiryDate,
    string memory batchId
) external onlyManufacturer returns (uint256)
```

#### Batch Verification
```solidity
function verifyBatch(uint256 tokenId) 
    external view returns (
        string memory name,
        string memory manufacturer,
        uint256 expiryDate,
        bool isAuthentic
    )
```

#### Transfer Ownership
```solidity
function transferDrug(uint256 tokenId, address to) 
    external onlyAuthorized
```

### Frontend API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

#### Drug Management
- `GET /api/drugs` - Get all drugs
- `POST /api/drugs` - Register new drug
- `GET /api/drugs/{id}` - Get drug details
- `PUT /api/drugs/{id}` - Update drug information

## Testing

### Running Tests

```bash
# Run smart contract tests
npm test

# Run specific test file
npx hardhat test test/DrugVerification.test.js

# Run tests with coverage
npx hardhat coverage
```

### Test Structure

```
test/
├── DrugVerification.test.js     # Smart contract tests
├── Integration.test.js          # Integration tests
└── helpers/
    └── testHelpers.js          # Test utilities
```

### Example Test

```javascript
describe("Drug Registration", function() {
  it("Should register a new drug successfully", async function() {
    const [manufacturer] = await ethers.getSigners();
    const drugName = "Paracetamol";
    const expiryDate = Math.floor(Date.now() / 1000) + 31536000; // 1 year
    
    const tx = await contract.registerDrug(
      drugName,
      "PharmaCorp",
      expiryDate,
      "BATCH001"
    );
    
    expect(tx).to.emit(contract, "DrugRegistered");
  });
});
```

## Deployment

### Local Deployment

```bash
# Deploy to local Hardhat network
npm run deploy
```

### Testnet Deployment

```bash
# Deploy to Ethereum testnet (Sepolia/Goerli)
npx hardhat run scripts/deploy.js --network sepolia
```

### Production Deployment

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### Frontend Deployment

```bash
# Build for production
cd frontend
npm run build

# Deploy to hosting service (Vercel, Netlify, etc.)
```

## Contributing

We welcome contributions from the community! Please follow these steps:

### 1. Fork the Repository

```bash
git fork https://github.com/swethaswini/maverchain.git
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed

### 4. Commit Changes

```bash
git commit -m "feat: add your feature description"
```

### 5. Submit Pull Request

- Provide clear description of changes
- Reference any related issues
- Ensure all tests pass

### Development Guidelines

- **Code Style**: Follow JavaScript/Solidity best practices
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update README and inline comments
- **Security**: Follow security best practices for smart contracts

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Mavericks Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

### Contact Information

- **Email**: support@medchain.dev
- **GitHub**: https://github.com/swethaswini/maverchain
- **Website**: https://medchain.dev

### FAQ

**Q: How do I reset the local blockchain?**
A: Stop the Hardhat node and restart it. This will reset all data.

**Q: Can I use this on testnets?**
A: Yes, configure the network in `hardhat.config.js` and update your `.env` file.

**Q: How do I add new user roles?**
A: Modify the smart contracts to include new roles and update the frontend accordingly.

**Q: Is this production-ready?**
A: This is a development version. Additional security audits and testing are recommended for production use.

---

**Built by the Mavericks Team**

*Securing pharmaceutical supply chains through blockchain technology*
REACT_APP_CONTRACT_ADDRESS=[your-contract-address]
REACT_APP_NETWORK_URL=http://localhost:8545
```

### Running

```bash
npm start
```

## Usage Examples

### Verify a Drug

```javascript
const isValid = await contract.verifyDrugInBatch(batchHash, drugHash, proof);
```

### Create Drug Batch

```javascript
await contract.createDrugBatch("Medicine", rootHash, ipfsHash, 1000, expiry);
```

## API Reference

[See full API documentation in DOCUMENTATION.md]

## License

MIT
