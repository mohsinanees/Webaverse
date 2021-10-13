require("dotenv").config({ path: "../.env" });
const { expect } = require("chai");
const { BN, constants, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;
const ethers = require("ethers");
const HDWallet = require("truffle-hdwallet-provider");
var env = process.env.NODE_ENV || "testnet";
const config = require("../config")[env];

const developmentMnemonic = require("../config");
const { LazyMinter } = require("../src/lib");

const WebaverseContract = artifacts.require("Webaverse");
const ERC721Mock = artifacts.require("ERC721Mock");
var Webaverse;
var ERC721;

contract("Webaverse", async function (accounts) {
    // intialize wallets
    const provider = new ethers.providers.InfuraProvider("rinkeby", config.infura_key);
    const signer = new ethers.Wallet(config.signer_key, provider);
    const claimer = new ethers.Wallet(config.claimer_key, provider);
    const externalSigner = new ethers.Wallet(config.external_signer_key, provider);
    before(async function () {
        Webaverse = await WebaverseContract.new();
        await Webaverse.mint(signer.address, 1, "abcdef");
        await Webaverse.mint(signer.address, 2, "xyzder");
        await Webaverse.mint(signer.address, 3, "qwerty");
        ERC721 = await ERC721Mock.new("ExternalContract", "test");
        await ERC721.mint(externalSigner.address, 1);
        await ERC721.mint(externalSigner.address, 2);
        await ERC721.mint(externalSigner.address, 3);
    });

    describe("Claim", async function () {
        var validTokenIds = [1, 2, 3];
        var nonce = ethers.BigNumber.from(ethers.utils.randomBytes(4)).toNumber();
        var expiry = ethers.BigNumber.from(Math.round(+new Date() / 1000 + 10)).toNumber();
        context("With valid signature, valid nonce, valid expiry", async function () {
            it("Should redeem an NFT from a signed voucher", async function () {
                const lazyMinter = new LazyMinter({
                    contract: Webaverse,
                    signer: signer,
                });
                const voucher = await lazyMinter.createVoucher(validTokenIds[0], nonce, expiry);

                //check if event transfer is emitted
                const { logs } = await Webaverse.claim(claimer.address, voucher);
                await expectEvent.inLogs(logs, "Transfer", {
                    from: signer.address,
                    to: claimer.address,
                    tokenId: new BN(validTokenIds[0]),
                });
            });
        });

        context("With invalid signature, invalid nonce, invalid expiry", async function () {
            it("Should fail to redeem an NFT with invalid signer", async function () {
                const lazyMinter = new LazyMinter({
                    contract: Webaverse,
                    signer: claimer,
                });
                const voucher = await lazyMinter.createVoucher(validTokenIds[1], nonce + 1, expiry);
                await expectRevert(
                    Webaverse.claim(claimer.address, voucher),
                    "Authorization failed: Invalid signature"
                );
            });

            it("Should fail to redeem an NFT after the expiry has passed", async function () {
                await new Promise((resolve) => setTimeout(resolve, 10000));
                const lazyMinter = new LazyMinter({
                    contract: Webaverse,
                    signer: claimer,
                });
                const voucher = await lazyMinter.createVoucher(validTokenIds[0], nonce + 1, expiry);
                await expectRevert(
                    Webaverse.claim(claimer.address, voucher),
                    "Voucher has already expired"
                );
            });

            it("Should fail to redeem an NFT with already used nonce", async function () {
                await new Promise((resolve) => setTimeout(resolve, 10000));
                const lazyMinter = new LazyMinter({
                    contract: Webaverse,
                    signer: claimer,
                });
                const voucher = await lazyMinter.createVoucher(
                    validTokenIds[0],
                    nonce,
                    expiry + 50
                );
                await expectRevert(
                    Webaverse.claim(claimer.address, voucher),
                    "Invalid nonce value"
                );
            });
        });
    });

    describe("externalClaim", async function () {
        var validTokenIds = [1, 2, 3];
        var nonce = ethers.BigNumber.from(ethers.utils.randomBytes(4)).toNumber();
        var expiry = ethers.BigNumber.from(Math.round(+new Date() / 1000 + 10)).toNumber();
        context("With valid signature, valid nonce, valid expiry", async function () {
            it("Should redeem an NFT from a signed voucher", async function () {
                const lazyMinter = new LazyMinter({
                    contract: Webaverse,
                    signer: externalSigner,
                });
                const voucher = await lazyMinter.createVoucher(validTokenIds[0], nonce, expiry);
                console.log(await ERC721.ownerOf(1));
                // set external wallet for truffle

                console.log(externalSigner.address);
                await ERC721.approve(Webaverse.address, validTokenIds[0], {
                    from: externalSigner.address,
                });
                //check if event transfer is emitted
                const { logs } = await Webaverse.externalClaim(claimer.address, voucher);
                await expectEvent.inLogs(logs, "Transfer", {
                    from: signer.address,
                    to: claimer.address,
                    tokenId: new BN(validTokenIds[0]),
                });
            });
        });

        // context("With invalid signature, invalid nonce, invalid expiry", async function () {
        //     it("Should fail to redeem an NFT with invalid signer", async function () {
        //         const lazyMinter = new LazyMinter({
        //             contract: Webaverse,
        //             signer: claimer,
        //         });
        //         const voucher = await lazyMinter.createVoucher(validTokenIds[1], nonce + 1, expiry);
        //         await expectRevert(
        //             Webaverse.claim(claimer.address, voucher),
        //             "Authorization failed: Invalid signature"
        //         );
        //     });

        //     it("Should fail to redeem an NFT after the expiry has passed", async function () {
        //         await new Promise(resolve => setTimeout(resolve, 10000));
        //         const lazyMinter = new LazyMinter({
        //             contract: Webaverse,
        //             signer: claimer,
        //         });
        //         const voucher = await lazyMinter.createVoucher(validTokenIds[0], nonce + 1, expiry);
        //         await expectRevert(
        //             Webaverse.claim(claimer.address, voucher),
        //             "Voucher has already expired"
        //         );
        //     });

        //     it("Should fail to redeem an NFT with already used nonce", async function () {
        //         await new Promise(resolve => setTimeout(resolve, 10000));
        //         const lazyMinter = new LazyMinter({
        //             contract: Webaverse,
        //             signer: claimer,
        //         });
        //         const voucher = await lazyMinter.createVoucher(validTokenIds[0], nonce, expiry + 50);
        //         await expectRevert(
        //             Webaverse.claim(claimer.address, voucher),
        //             "Invalid nonce value"
        //         );
        //     });
        // });
    });
});
