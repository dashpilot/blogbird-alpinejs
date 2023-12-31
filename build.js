// if you change this, also change it in package.json
const public_folder = "./dist";

const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const { parse } = require("node-html-parser");
const CleanCSS = require("clean-css");

if (!fs.existsSync(public_folder)) {
  fs.mkdirSync(public_folder, 0744);
  fs.mkdirSync(public_folder + "/assets", 0744);
}

var index = fs.readFileSync("./src/index.html", "utf8");
fs.writeFileSync(public_folder + "/index.html", index, "utf8");

var data = [];
data.script = "";
data.style = "";
data.template = "";

const folder = "./src/components/";
let files = fs.readdirSync(folder);
let i = 0;
files.forEach(function (file) {
  extractTags(folder + file, data);
  i++;
});

var output = new CleanCSS().minify(data.style);
fs.writeFileSync(public_folder + "/assets/app.min.css", output.styles, "utf8");

minifyJs(data);

// helpers

function extractTags(filepath, data) {
  var file = fs.readFileSync(filepath, "utf8");
  var filename = path.basename(filepath, ".html");

  const root = parse(file);
  if (root.querySelector("template")) {
    data.template +=
      'document.querySelectorAll("' +
      filename +
      '").forEach(function(e){' +
      "e.innerHTML = `" +
      root.querySelector("template").innerHTML.replace(/\s\s+/g, " ") +
      "`" +
      "})\n";
  }
  if (root.querySelector("script")) {
    data.script += root.querySelector("script").text + "\n";
  }
  if (root.querySelector("style")) {
    data.style += root.querySelector("style").text;
  }

  //console.log(data);
}

async function minifyJs(data) {
  var combined = data.template + " " + data.script;
  var result = await minify(combined, {
    sourceMap: true,
  });
  fs.writeFileSync(public_folder + "/assets/app.min.js", result.code, "utf8");
}
