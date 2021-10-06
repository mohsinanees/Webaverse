const fs = require("fs");

const fileSync = async () => {
  for (let i = 1, j = 421; i <= 2; i++) {
    for (; j <= i * 5000; j++) {
      console.log(j);
      fs.copyFile(
        "/home/mohsin/Documents/GhouliesJSON/" + j + ".json",
        "/home/mohsin/Documents/GhouliesJSON-" + i + "/" + j + ".json",
        (err) => {
          if (err) console.log(err);
        }
      );
    }
  }
};

fileSync();
