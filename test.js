const fs = require("fs");

fs.copyFile(
  "/home/mohsin/Documents/Ghoulies/1.jpg",
  "/home/mohsin/Documents/Ghoulies-1/1.jpg",
  (err) => {
    if (err) throw err;
  }
);
