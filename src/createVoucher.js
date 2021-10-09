const { LazyMinter } = require("./lib");
const ethers = require("ethers");

async function createVoucher(contractAddress, minter, tokenId, nonce, expiry) {
  const lazyMinter = new LazyMinter({ contractAddress: contractAddress, signer: minter });

  let voucher = await lazyMinter.createVoucher(tokenId, nonce, expiry);

  return voucher;
}

module.exports = createVoucher;
