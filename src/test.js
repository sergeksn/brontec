const path = require("path");
const fs = require("fs");

let testFolder = path.resolve(__dirname, "assets/scss/");

fs.readdirSync(testFolder).forEach(file => {
    console.log(file);
});


fs.appendFileSync(path.resolve(__dirname, "assets/scss/critical.scss"), `\n${data_to_append}`);