const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleMedChain", function () {
    let simpleMedChain;
    let admin, manufacturer, distributor, hospital, patient;
    let accounts;

    beforeEach(async function () {
        // Get signers
        accounts = await ethers.getSigners();
        [admin, manufacturer, distributor, hospital, patient] = accounts;

        // Deploy contract
        const SimpleMedChain = await ethers.getContractFactory("SimpleMedChain");
        simpleMedChain = await SimpleMedChain.deploy();
        await simpleMedChain.deployed();

        // Grant roles
        await simpleMedChain.grantManufacturerRole(manufacturer.address);
        await simpleMedChain.grantDistributorRole(distributor.address);
        await simpleMedChain.grantHospitalRole(hospital.address);
        await simpleMedChain.grantPatientRole(patient.address);
    });

    describe("Deployment", function () {
        it("Should set the right admin", async function () {
            const ADMIN_ROLE = await simpleMedChain.ADMIN_ROLE();
            expect(await simpleMedChain.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
        });

        it("Should have correct initial state", async function () {
            expect(await simpleMedChain.nextBatchId()).to.equal(1);
        });
    });

    describe("Role Management", function () {
        it("Should grant manufacturer role correctly", async function () {
            const MANUFACTURER_ROLE = await simpleMedChain.MANUFACTURER_ROLE();
            expect(await simpleMedChain.hasRole(MANUFACTURER_ROLE, manufacturer.address)).to.equal(true);
        });

        it("Should grant distributor role correctly", async function () {
            const DISTRIBUTOR_ROLE = await simpleMedChain.DISTRIBUTOR_ROLE();
            expect(await simpleMedChain.hasRole(DISTRIBUTOR_ROLE, distributor.address)).to.equal(true);
        });

        it("Should grant hospital role correctly", async function () {
            const HOSPITAL_ROLE = await simpleMedChain.HOSPITAL_ROLE();
            expect(await simpleMedChain.hasRole(HOSPITAL_ROLE, hospital.address)).to.equal(true);
        });

        it("Should grant patient role correctly", async function () {
            const PATIENT_ROLE = await simpleMedChain.PATIENT_ROLE();
            expect(await simpleMedChain.hasRole(PATIENT_ROLE, patient.address)).to.equal(true);
        });
    });

    describe("Drug Batch Creation", function () {
        it("Should create a drug batch successfully", async function () {
            const drugName = "Test Medicine";
            const quantity = 1000;
            const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now
            const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_data"));

            const tx = await simpleMedChain.connect(manufacturer).createDrugBatch(
                drugName,
                quantity,
                expiryDate,
                merkleRoot
            );

            expect(tx).to.emit(simpleMedChain, "DrugBatchCreated");
            
            const batchId = 1;
            const batch = await simpleMedChain.getDrugBatch(batchId);
            
            expect(batch.drugName).to.equal(drugName);
            expect(batch.quantity).to.equal(quantity);
            expect(batch.manufacturer).to.equal(manufacturer.address);
        });

        it("Should fail to create batch with invalid parameters", async function () {
            await expect(
                simpleMedChain.connect(manufacturer).createDrugBatch(
                    "",
                    1000,
                    Math.floor(Date.now() / 1000) + 3600,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"))
                )
            ).to.be.revertedWith("Drug name cannot be empty");
        });

        it("Should fail if non-manufacturer tries to create batch", async function () {
            await expect(
                simpleMedChain.connect(patient).createDrugBatch(
                    "Test Medicine",
                    1000,
                    Math.floor(Date.now() / 1000) + 3600,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"))
                )
            ).to.be.revertedWith("Not a manufacturer");
        });
    });

    describe("Hospital Registration", function () {
        it("Should register hospital successfully", async function () {
            const hospitalName = "Test Hospital";
            const location = "Test City";
            const hospitalType = 0; // Urban
            const threshold = 100;

            await simpleMedChain.connect(admin).registerHospital(
                hospitalName,
                location,
                hospitalType,
                threshold
            );

            const hospitalData = await simpleMedChain.getHospital(admin.address);
            expect(hospitalData.name).to.equal(hospitalName);
            expect(hospitalData.location).to.equal(location);
            expect(hospitalData.isRegistered).to.equal(true);
        });
    });

    describe("Drug Verification", function () {
        let batchId;

        beforeEach(async function () {
            // Create a test batch first
            const drugName = "Test Medicine";
            const quantity = 1000;
            const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
            const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));

            await simpleMedChain.connect(manufacturer).createDrugBatch(
                drugName,
                quantity,
                expiryDate,
                merkleRoot
            );
            batchId = 1;
        });

        it("Should verify drug batch successfully", async function () {
            const result = await simpleMedChain.verifyDrugBatch(batchId);
            const receipt = await result.wait();
            
            expect(receipt.events).to.have.lengthOf.greaterThan(0);
            
            const batch = await simpleMedChain.getDrugBatch(batchId);
            expect(batch.isVerified).to.equal(true);
        });
    });

    describe("Emergency Controls", function () {
        it("Should pause and unpause correctly", async function () {
            await simpleMedChain.connect(admin).emergencyPause();
            expect(await simpleMedChain.paused()).to.equal(true);

            await simpleMedChain.connect(admin).emergencyUnpause();
            expect(await simpleMedChain.paused()).to.equal(false);
        });

        it("Should fail if non-admin tries to pause", async function () {
            await expect(
                simpleMedChain.connect(patient).emergencyPause()
            ).to.be.revertedWith("Not an admin");
        });
    });
});
