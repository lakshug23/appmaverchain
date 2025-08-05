// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DrugVerification
 * @dev Enhanced contract for drug verification using Merkle proofs with advanced security
 * @notice Implements comprehensive drug authentication and verification system
 */
contract DrugVerification is AccessControl, ReentrancyGuard {
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant BATCH_CREATOR_ROLE = keccak256("BATCH_CREATOR_ROLE");
    
    struct DrugData {
        string name;
        string drugCode; // WHO/FDA drug code
        string manufacturer;
        uint256 batchNumber;
        uint256 manufactureDate;
        uint256 expiryDate;
        string regulatoryApproval; // FDA/WHO approval number
        string additionalData;
    }
    
    struct BatchInfo {
        bytes32 merkleRoot;
        address creator;
        uint256 timestamp;
        uint256 drugCount;
        bool isActive;
        string description;
    }
    
    mapping(bytes32 => BatchInfo) public batchInfo;
    mapping(bytes32 => bool) public verifiedDrugs;
    mapping(bytes32 => uint256) public drugVerificationCount;
    mapping(address => uint256) public verifierCount;
    
    event DrugBatchCreated(
        bytes32 indexed batchHash,
        bytes32 merkleRoot,
        address indexed creator,
        uint256 drugCount,
        uint256 timestamp
    );
    
    event DrugVerificationResult(
        bytes32 indexed drugHash,
        bytes32 indexed batchHash,
        bool isValid,
        address indexed verifier,
        uint256 timestamp
    );
    
    event BatchDeactivated(
        bytes32 indexed batchHash,
        address indexed deactivator,
        string reason
    );

    modifier onlyVerifier() {
        require(hasRole(VERIFIER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
                "Unauthorized verifier");
        _;
    }

    modifier onlyBatchCreator() {
        require(hasRole(BATCH_CREATOR_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
                "Unauthorized batch creator");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(BATCH_CREATOR_ROLE, msg.sender);
    }
    
    function createBatchWithMerkleRoot(
        bytes32 _batchHash,
        bytes32 _merkleRoot,
        uint256 _drugCount,
        string memory _description
    ) external onlyBatchCreator nonReentrant {
        require(_merkleRoot != bytes32(0), "Invalid merkle root");
        require(_drugCount > 0, "Drug count must be positive");
        require(!batchInfo[_batchHash].isActive, "Batch already exists");
        
        batchInfo[_batchHash] = BatchInfo({
            merkleRoot: _merkleRoot,
            creator: msg.sender,
            timestamp: block.timestamp,
            drugCount: _drugCount,
            isActive: true,
            description: _description
        });
        
        emit DrugBatchCreated(_batchHash, _merkleRoot, msg.sender, _drugCount, block.timestamp);
    }
    
    function verifyDrugInBatch(
        bytes32 _batchHash,
        bytes32 _drugHash,
        bytes32[] memory _proof
    ) external onlyVerifier nonReentrant returns (bool) {
        BatchInfo storage batch = batchInfo[_batchHash];
        require(batch.isActive, "Batch not found or inactive");
        require(batch.merkleRoot != bytes32(0), "Invalid batch");
        
        bool isValid = MerkleProof.verify(_proof, batch.merkleRoot, _drugHash);
        
        if (isValid) {
            verifiedDrugs[_drugHash] = true;
            drugVerificationCount[_drugHash]++;
            verifierCount[msg.sender]++;
        }
        
        emit DrugVerificationResult(_drugHash, _batchHash, isValid, msg.sender, block.timestamp);
        return isValid;
    }
    
    function deactivateBatch(
        bytes32 _batchHash, 
        string memory _reason
    ) external onlyBatchCreator {
        require(batchInfo[_batchHash].isActive, "Batch not active");
        
        batchInfo[_batchHash].isActive = false;
        emit BatchDeactivated(_batchHash, msg.sender, _reason);
    }
    
    function isDrugVerified(bytes32 _drugHash) external view returns (bool) {
        return verifiedDrugs[_drugHash];
    }
    
    function getBatchInfo(bytes32 _batchHash) external view returns (BatchInfo memory) {
        return batchInfo[_batchHash];
    }
    
    function getDrugVerificationCount(bytes32 _drugHash) external view returns (uint256) {
        return drugVerificationCount[_drugHash];
    }
    
    // Enhanced utility function to generate drug hash with more comprehensive data
    function generateDrugHash(DrugData memory _drug) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            _drug.name,
            _drug.drugCode,
            _drug.manufacturer,
            _drug.batchNumber,
            _drug.manufactureDate,
            _drug.expiryDate,
            _drug.regulatoryApproval,
            _drug.additionalData
        ));
    }
    
    // Batch hash generator for consistency
    function generateBatchHash(
        string memory _batchName,
        address _manufacturer,
        uint256 _timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_batchName, _manufacturer, _timestamp));
    }
}
