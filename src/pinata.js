const pinataApiKey = "b6cb46395764543a78fd";
const pinataSecretApiKey = "d07e23c6bb7482b61de6af968f5f583d42a520be0242441698a69d1d509860b6";

const fs = require("fs");

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

const pinFile = async function (filePath, filename) {
  if (filePath == null) {
    throw Error("File path missing");
  }

  let fileName = "";
  if (filename != null) {
    fileName = filename;
  }

  var fileData = fs.createReadStream(filePath);
  pinata
    .testAuthentication()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });

  var options = {
    pinataMetadata: {
      name: fileName,
    },
    pinataOptions: {
      cidVersion: 1,
      wrapWithDirectory: false,
    },
  };

  pinata
    .pinFileToIPFS(fileData, options)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

const pinJSON = async function (object, filename) {
  pinata
    .testAuthentication()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });

  var options = {
    pinataMetadata: {
      name: filename,
    },
    pinataOptions: {
      cidVersion: 1,
      wrapWithDirectory: false,
    },
  };

  pinata
    .pinJSONToIPFS(object, options)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

// pinFile("/home/mohsin/Documents/1.jpg", "werwe.jpg");

let object = {
  title: "Ghoulie NFT",
  type: "object",
  description:
    "test is one of the rarest 11 1 of 1 Ghoulies available. This ghoulie posesses only 2 attributes unlike all other Ghoulies",
  image: "https://ipfs.io/ipfs/bafybeidpqodfa743lsgvglgaakf7fx3jssfjhrsmur2a3oy3sxvibokyoi",
  background_color: "#000000",
  attributes: [
    {
      trait_type: "Name",
      value: "OG Sketch",
    },
    {
      trait_type: "Mythical",
      value: "Mythical",
    },
  ],
};

pinJSON(object, "test.json");
