require("dotenv").config({ path: "./.env" });

module.exports = {
  testnet: {
    secret: process.env.SECRET,
    priv_key: process.env.TEST_PRIV_KEY,
    signer_key: process.env.SIGNER_KEY,
    infura_key: process.env.INFURA_KEY,
  },
  mainnet: {},
};
