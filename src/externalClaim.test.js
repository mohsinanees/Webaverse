const ethers = require("ethers");
const crypto = require("crypto");
const createVoucher = require("./createVoucher");

const rawAbi = require("./abi.json");
const abi = JSON.parse(JSON.stringify(rawAbi));

async function externalClaim() {
  const itx = new ethers.providers.InfuraProvider("rinkeby", "63ded85a9a5442c6ae2b94c2e97fb8c4");
  const minter = new ethers.Wallet(
    "abd445f0700f2f164bcce0a54da23037b06f83c4e1838cf91b2d7453651fe75d",
    itx
  );
  const claimer = new ethers.Wallet(
    "568a79760416b1f0e7c0fea875bf8dfcd2eb967182c1c1f2c0e3e4e1f532faf9",
    itx
  );

  const contractAddress = "0xe6DeF278807B52f3967C5fbDa11917E08DaB5a80";
  const externalContractAddress = "0x5471510a60AE199eE667bDC4b5EcFF61f5b6E648";
  // const claimer = "0x9bF321A9dF8D89ff4F948Ca2D49F2BC65e56ea50";
  const nonce = crypto.randomBytes(32).readUIntBE(0, 6);

  const WebaverseContract = new ethers.Contract(contractAddress, abi, claimer);
  const voucher = await createVoucher(
    contractAddress,
    minter,
    10000,
    nonce,
    Math.round(+new Date() / 1000 + 1000)
  );
  // console.log(await WebaverseContract.connect(itx));
  console.log(voucher);
  let tokenId = await WebaverseContract.externalClaim(
    claimer.address,
    externalContractAddress,
    voucher
  );
  console.log(tokenId);
}

externalClaim();
