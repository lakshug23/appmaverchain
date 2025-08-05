// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SimpleMedChain is AccessControl, ReentrancyGuard, Pausable {
    // Role definitions
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant HOSPITAL_ROLE = keccak256("HOSPITAL_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Enums
    enum DrugStatus { 
        Manufactured, 
        WithDistributor, 
        WithHospital, 
        DispensedToPatient, 
        Expired 
    }

    enum HospitalType { Urban, Rural }
    enum RequestStatus { Pending, Approved, Rejected, Fulfilled }

    // Structs
    struct DrugBatch {
        uint256 id;
        string drugName;
        address manufacturer;
        uint256 quantity;
        uint256 manufactureDate;
        uint256 expiryDate;
        bytes32 merkleRoot;
        DrugStatus status;
        address currentHolder;
        bool isVerified;
    }

    struct Hospital {
        address hospitalAddress;
        string name;
        string location;
        HospitalType hospitalType;
        bool isRegistered;
        uint256 currentStock;
        uint256 threshold;
    }

    struct ExpiredDrugReport {
        uint256 batchId;
        address reportedBy;
        uint256 reportDate;
        string reason;
        bool isVerified;
    }

    // State variables
    mapping(uint256 => DrugBatch) public drugBatches;
    mapping(address => Hospital) public hospitals;
    mapping(bytes32 => bool) public whoApprovedDrugs;
    mapping(uint256 => ExpiredDrugReport) public expiredReports;
    mapping(address => uint256[]) public patientBatches;
    
    uint256 public nextBatchId = 1;
    uint256 public nextReportId = 1;

    // Events
    event DrugBatchCreated(
        uint256 indexed batchId, 
        string drugName, 
        address manufacturer, 
        bytes32 merkleRoot, 
        uint256 quantity
    );
    
    event DrugTransferred(
        uint256 indexed batchId, 
        address indexed from, 
        address indexed to, 
        DrugStatus newStatus
    );
    
    event DrugVerified(uint256 indexed batchId, address verifier, bool isValid);
    
    event HospitalRegistered(address indexed hospital, string name, string location);

    event StockThresholdReached(address indexed hospital, uint256 currentStock, uint256 threshold);

    event WHODrugAdded(bytes32 indexed drugHash, string drugName);
    event WHODrugRemoved(bytes32 indexed drugHash, string drugName);    // Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not an admin");
        _;
    }

    modifier onlyManufacturer() {
        require(hasRole(MANUFACTURER_ROLE, msg.sender), "Not a manufacturer");
        _;
    }

    modifier onlyDistributor() {
        require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "Not a distributor");
        _;
    }

    modifier onlyHospital() {
        require(hasRole(HOSPITAL_ROLE, msg.sender), "Not a hospital");
        _;
    }

    modifier validBatch(uint256 _batchId) {
        require(_batchId > 0 && _batchId < nextBatchId, "Invalid batch ID");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Role management functions
    function grantManufacturerRole(address account) external onlyAdmin {
        _grantRole(MANUFACTURER_ROLE, account);
    }

    function grantDistributorRole(address account) external onlyAdmin {
        _grantRole(DISTRIBUTOR_ROLE, account);
    }

    function grantHospitalRole(address account) external onlyAdmin {
        _grantRole(HOSPITAL_ROLE, account);
    }

    function grantPatientRole(address account) external onlyAdmin {
        _grantRole(PATIENT_ROLE, account);
    }

    // Drug batch creation
    function createDrugBatch(
        string memory _drugName,
        string memory _drugCode,
        string memory _regulatoryApproval,
        bytes32 _merkleRoot,
        string memory _ipfsHash,
        uint256 _quantity,
        uint256 _expiryDate
    ) external onlyManufacturer nonReentrant returns (uint256) {
        require(bytes(_drugName).length > 0, "Drug name cannot be empty");
        require(bytes(_drugCode).length > 0, "Drug code cannot be empty");
        require(bytes(_regulatoryApproval).length > 0, "Regulatory approval required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_expiryDate > block.timestamp, "Expiry date must be in the future");

        uint256 batchId = nextBatchId++;
        
        drugBatches[batchId] = DrugBatch({
            id: batchId,
            drugName: _drugName,
            manufacturer: msg.sender,
            quantity: _quantity,
            manufactureDate: block.timestamp,
            expiryDate: _expiryDate,
            merkleRoot: _merkleRoot,
            status: DrugStatus.Manufactured,
            currentHolder: msg.sender,
            isVerified: false
        });

        emit DrugBatchCreated(batchId, _drugName, msg.sender, _merkleRoot, _quantity);
        return batchId;
    }

    // Transfer drug batch
    function transferDrugBatch(
        uint256 _batchId, 
        address _to, 
        DrugStatus _newStatus
    ) external validBatch(_batchId) nonReentrant {
        DrugBatch storage batch = drugBatches[_batchId];
        require(batch.currentHolder == msg.sender, "Not the current holder");
        require(_to != address(0), "Invalid recipient address");

        batch.currentHolder = _to;
        batch.status = _newStatus;

        emit DrugTransferred(_batchId, msg.sender, _to, _newStatus);
    }

    // Hospital registration (updated to match frontend expectations)
    function registerHospital(
        address _hospitalAddress,
        string memory _name,
        string memory _registrationNumber,
        HospitalType _hospitalType,
        uint256 _stockThreshold,
        uint256 _capacity
    ) external onlyAdmin {
        hospitals[_hospitalAddress] = Hospital({
            hospitalAddress: _hospitalAddress,
            name: _name,
            location: _registrationNumber, // Using location field for registration number
            hospitalType: _hospitalType,
            isRegistered: true,
            currentStock: 0,
            threshold: _stockThreshold
        });

        // Grant hospital role to the address
        _grantRole(HOSPITAL_ROLE, _hospitalAddress);

        emit HospitalRegistered(_hospitalAddress, _name, _registrationNumber);
    }

    // WHO approved drug functions
    function addWHOApprovedDrug(bytes32 _drugHash) external onlyAdmin {
        whoApprovedDrugs[_drugHash] = true;
        emit WHODrugAdded(_drugHash, ""); // Empty string for drug name as we only have hash
    }

    function addWHOApprovedDrugWithName(string memory _drugName) external onlyAdmin {
        bytes32 drugHash = keccak256(abi.encodePacked(_drugName));
        whoApprovedDrugs[drugHash] = true;
        emit WHODrugAdded(drugHash, _drugName);
    }

    function removeWHOApprovedDrug(bytes32 _drugHash) external onlyAdmin {
        whoApprovedDrugs[_drugHash] = false;
        emit WHODrugRemoved(_drugHash, "");
    }

    function isWHOApproved(bytes32 _drugHash) external view returns (bool) {
        return whoApprovedDrugs[_drugHash];
    }

    function isWHOApprovedByName(string memory _drugName) external view returns (bool) {
        bytes32 drugHash = keccak256(abi.encodePacked(_drugName));
        return whoApprovedDrugs[drugHash];
    }

    // Verify drug batch
    function verifyDrugBatch(uint256 _batchId) external validBatch(_batchId) returns (bool) {
        DrugBatch storage batch = drugBatches[_batchId];
        
        // Simple verification logic - can be enhanced
        bool isValid = batch.expiryDate > block.timestamp && batch.quantity > 0;
        batch.isVerified = isValid;

        emit DrugVerified(_batchId, msg.sender, isValid);
        return isValid;
    }

    // Get drug batch details
    function getDrugBatch(uint256 _batchId) external view validBatch(_batchId) returns (DrugBatch memory) {
        return drugBatches[_batchId];
    }

    // Get hospital details
    function getHospital(address _hospital) external view returns (Hospital memory) {
        require(hospitals[_hospital].isRegistered, "Hospital not registered");
        return hospitals[_hospital];
    }

    // Utility functions
    function getCurrentBatchId() external view returns (uint256) {
        return nextBatchId;
    }

    function getTotalBatches() external view returns (uint256) {
        return nextBatchId - 1;
    }

    // Emergency functions
    function emergencyPause() external onlyAdmin {
        _pause();
    }

    function emergencyUnpause() external onlyAdmin {
        _unpause();
    }
}
