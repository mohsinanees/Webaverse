module.exports = {
  contracts_directory: "./contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic);
      },
      network_id: "4",
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",
    },
  },
  mocha: {
    useColors: true,
  },
};
