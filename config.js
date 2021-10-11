require("dotenv").config({ path: "./.env" });

module.exports = {
    testnet: {
        mnemonic: process.env.TEST_SECRET,
        priv_key: process.env.TEST_PRIV_KEY,
        signer_key: process.env.SIGNER_KEY,
        infura_key: process.env.INFURA_KEY,
        priv_keys: process.env.PRIVATE_KEYS,
    },
    mainnet: {},
};
