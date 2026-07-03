const fs = require("fs");
const path = require("path");

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../public/pmp/pmp-exam-latest.html"),
];

const OLD = `      .toolbar .secondary.practice-only,
      .toolbar #pageSelect,`;

const NEW = `      .toolbar .secondary.practice-only:not(#filterWrongBtn),
      .toolbar #pageSelect,`;

const MOBILE_BTN = `      #filterWrongBtn {
        display: block !important;
        width: 100%;
        text-align: center;
      }
`;

for (const filePath of FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

  if (html.includes(OLD)) {
    html = html.replace(OLD, NEW);
  } else if (!html.includes(":not(#filterWrongBtn)")) {
    throw new Error(`Mobile toolbar rule not found in ${filePath}`);
  }

  if (!html.includes("#filterWrongBtn {\n        display: block !important;")) {
    const anchor = "      .jump-controls-bottom {\n        display: flex;";
    if (!html.includes(anchor)) {
      throw new Error(`jump-controls-bottom anchor not found in ${filePath}`);
    }
    html = html.replace(anchor, MOBILE_BTN + anchor);
  }

  fs.writeFileSync(filePath, html);
  console.log("Patched:", path.basename(filePath));
}
