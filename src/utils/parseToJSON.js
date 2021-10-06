const fs = require("fs");
var XLSX = require("xlsx");

const parseToJSON = async (amount) => {
  var workbook = XLSX.readFile("../../Final.xlsx");
  var sheets = workbook.SheetNames;

  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]]);

  for (let i = 9001; i <= 10001; i++) {
    let keys = Object.keys(xlData[i - 1]);
    let values = Object.values(xlData[i - 1]);

    let fileName = i + ".json";
    let filePath = "/home/mohsin/Documents/GhouliesJSON/";

    let image =
      "https://gateway.pinata.cloud/ipfs/QmVfXT73jgHKUhcR4ufGVBkG3ZTzrS1GM45CDtzG6r5sso/" +
      i +
      ".jpg";

    // Working
    let obj = {
      description: "Created by GhouliesNFT",
      image: image,
      background_color: values[1],
      attributes: [
        {
          trait_type: keys[2],
          value: values[2],
        },
        {
          trait_type: keys[3],
          value: values[3],
        },
        {
          trait_type: keys[4],
          value: values[4],
        },
        {
          trait_type: keys[5],
          value: values[5],
        },
        {
          trait_type: keys[6],
          value: values[6],
        },
      ],
    };

    console.log(fileName);
    fs.writeFile(filePath + fileName, JSON.stringify(obj, null, 2), "utf-8", (err) => {
      if (err) throw err;
    });
  }
};

parseToJSON(1);
