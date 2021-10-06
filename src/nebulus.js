const Nebulus = require("nebulus");
const nebulus = new Nebulus();
var XLSX = require("xlsx");

let object = {
  title: "Ghoulie NFT",
  type: "object",
  description:
    "#10001 is one of the rarest 11 1 of 1 Ghoulies available. This ghoulie posesses only 2 attributes unlike all other Ghoulies",
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

const run = async (amount) => {
  var workbook = XLSX.readFile("../Final.xlsx");
  var sheets = workbook.SheetNames;

  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
  console.log(Object.keys(xlData[100]));

  // for (let i = 1; i <= amount; i++) {
  //   image = file[i.toString()]["image"];

  //   let keys = Object.keys(xlData[i]);
  //   let values = Object.values(xlData[i]);
  //   // Working
  //   let obj = {
  //     description: "Ghoulie NFT no. " + i,
  //     image: image,
  //     background_color: values[1],
  //     attributes: [
  //       {
  //         trait_type: keys[2],
  //         value: values[2],
  //       },
  //       {
  //         trait_type: keys[3],
  //         value: values[3],
  //       },
  //       {
  //         trait_type: keys[4],
  //         value: values[4],
  //       },
  //       {
  //         trait_type: keys[5],
  //         value: values[5],
  //       },
  //       {
  //         trait_type: keys[6],
  //         value: values[6],
  //       },
  //     ],
  //   };

  // console.log(obj);

  // const cid = await nebulus.add(Buffer.from(JSON.stringify(object)));
  // const cid = await nebulus.add(`/home/mohsin/Documents/10001.jpg`);

  // nebulus.on("push", (pushed_cid) => {
  //   // check the following pushed URL in the browser
  //   console.log("https://ipfs.io/ipfs/" + pushed_cid);
  // });
  // await nebulus.push(cid);
  // await nebulus.push("bafybeidpqodfa743lsgvglgaakf7fx3jssfjhrsmur2a3oy3sxvibokyoi");

  // await new Promise((resolve) => setTimeout(resolve, 5000));
  // }
};
run(1);
