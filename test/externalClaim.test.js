require("dotenv").config({ path: "../.env" });
const ethers = require("ethers");
const crypto = require("crypto");
const createVoucher = require("../src/createVoucher");
var env = process.env.NODE_ENV || "testnet";
const config = require("../config")[env];

const rawAbi = require("../build/contracts/Webaverse.json");
const abi = JSON.parse(JSON.stringify(rawAbi));

async function externalClaim() {
  const itx = new ethers.providers.InfuraProvider("rinkeby", config.infura_key);
  const signer = new ethers.Wallet(config.signer_key, itx);
  const claimer = new ethers.Wallet(config.priv_key, itx);

  const contractAddress = "0xe6DeF278807B52f3967C5fbDa11917E08DaB5a80";
  const externalContractAddress = "0x5471510a60AE199eE667bDC4b5EcFF61f5b6E648";
  // const claimer = "0x9bF321A9dF8D89ff4F948Ca2D49F2BC65e56ea50";
  const nonce = crypto.randomBytes(32).readUIntBE(0, 6);
  let expiry = Math.round(+new Date() / 1000 + 1000);

  const WebaverseContract = new ethers.Contract(contractAddress, abi, claimer);
  const voucher = await createVoucher(contractAddress, signer, 10000, nonce, expiry);
  // console.log(await WebaverseContract.connect(itx));
  console.log(voucher);
  let externalClaimtx = await WebaverseContract.externalClaim(
    claimer.address,
    externalContractAddress,
    voucher
  );
  console.log(externalClaimtx);
}

externalClaim();
