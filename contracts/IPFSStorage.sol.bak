// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title IPFSStorage
 * @dev Enhanced utility contract for managing IPFS hashes and metadata with access control
 * @notice Manages decentralized storage references with enhanced security and validation
 */
contract IPFSStorage is AccessControl, ReentrancyGuard {
    
    bytes32 public constant UPLOADER_ROLE = keccak256("UPLOADER_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    
    struct IPFSData {
        string hash;
        uint256 timestamp;
        address uploader;
        string metadata;
        string category; // Enhanced: Drug data, health record, etc.
        uint256 fileSize; // Enhanced: File size tracking
        bool exists;
        bool isActive; // Enhanced: Deactivation capability
        string checksum; // Enhanced: File integrity verification
    }
    
    mapping(bytes32 => IPFSData) public ipfsData;
    mapping(address => bytes32[]) public userUploads;
    mapping(string => bool) public usedHashes; // Enhanced: Prevent duplicate hashes
    mapping(string => bytes32) public hashToKey; // Enhanced: Hash lookup
    
    uint256 public totalUploads;
    uint256 public maxFileSize = 50 * 1024 * 1024; // 50MB default limit
    
    event IPFSHashStored(
        bytes32 indexed key,
        string ipfsHash,
        address indexed uploader,
        string category,
        uint256 timestamp
    );
    
    event IPFSDataDeactivated(
        bytes32 indexed key,
        address indexed deactivator,
        string reason
    );
    
    event MaxFileSizeUpdated(
        uint256 oldSize,
        uint256 newSize,
        address updatedBy
    );

    modifier onlyUploader() {
        require(hasRole(UPLOADER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
                "Unauthorized uploader");
        _;
    }

    modifier onlyModerator() {
        require(hasRole(MODERATOR_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
                "Unauthorized moderator");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPLOADER_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
    }
    
    function storeIPFSHash(
        bytes32 _key,
        string memory _ipfsHash,
        string memory _metadata,
        string memory _category,
        uint256 _fileSize,
        string memory _checksum
    ) external onlyUploader nonReentrant {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!ipfsData[_key].exists, "Key already exists");
        require(!usedHashes[_ipfsHash], "IPFS hash already used");
        require(_fileSize <= maxFileSize, "File size exceeds limit");
        require(bytes(_checksum).length > 0, "Checksum required");
        
        ipfsData[_key] = IPFSData({
            hash: _ipfsHash,
            timestamp: block.timestamp,
            uploader: msg.sender,
            metadata: _metadata,
            category: _category,
            fileSize: _fileSize,
            exists: true,
            isActive: true,
            checksum: _checksum
        });
        
        userUploads[msg.sender].push(_key);
        usedHashes[_ipfsHash] = true;
        hashToKey[_ipfsHash] = _key;
        totalUploads++;
        
        emit IPFSHashStored(_key, _ipfsHash, msg.sender, _category, block.timestamp);
    }
    
    function deactivateIPFSData(
        bytes32 _key, 
        string memory _reason
    ) external onlyModerator {
        require(ipfsData[_key].exists, "IPFS data does not exist");
        require(ipfsData[_key].isActive, "IPFS data already inactive");
        
        ipfsData[_key].isActive = false;
        emit IPFSDataDeactivated(_key, msg.sender, _reason);
    }
    
    function updateMaxFileSize(uint256 _newMaxSize) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Admin only");
        require(_newMaxSize > 0, "Invalid file size");
        
        uint256 oldSize = maxFileSize;
        maxFileSize = _newMaxSize;
        
        emit MaxFileSizeUpdated(oldSize, _newMaxSize, msg.sender);
    }
    
    function getIPFSHash(bytes32 _key) external view returns (string memory) {
        require(ipfsData[_key].exists, "IPFS data does not exist");
        require(ipfsData[_key].isActive, "IPFS data is inactive");
        return ipfsData[_key].hash;
    }
    
    function getIPFSData(bytes32 _key) external view returns (IPFSData memory) {
        require(ipfsData[_key].exists, "IPFS data does not exist");
        return ipfsData[_key];
    }
    
    function getActiveIPFSData(bytes32 _key) external view returns (IPFSData memory) {
        require(ipfsData[_key].exists, "IPFS data does not exist");
        require(ipfsData[_key].isActive, "IPFS data is inactive");
        return ipfsData[_key];
    }
    
    function getUserUploads(address _user) external view returns (bytes32[] memory) {
        return userUploads[_user];
    }
    
    function getKeyByHash(string memory _ipfsHash) external view returns (bytes32) {
        require(usedHashes[_ipfsHash], "Hash not found");
        return hashToKey[_ipfsHash];
    }
    
    function isHashUsed(string memory _ipfsHash) external view returns (bool) {
        return usedHashes[_ipfsHash];
    }
    
    function getTotalUploads() external view returns (uint256) {
        return totalUploads;
    }
    
    function verifyChecksum(bytes32 _key, string memory _checksum) external view returns (bool) {
        require(ipfsData[_key].exists, "IPFS data does not exist");
        return keccak256(abi.encodePacked(ipfsData[_key].checksum)) == keccak256(abi.encodePacked(_checksum));
    }
}
