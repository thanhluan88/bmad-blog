const fs = require("fs");
const path = require("path");

const pmpDir = path.join(__dirname, "..", "public", "pmp");
const linkTag = '  <link rel="stylesheet" href="pmp-teach-fullscreen.css">\n';

const files = fs
  .readdirSync(pmpDir)
  .filter(
    (f) =>
      f === "pmp-exam-prep-lecture.html" ||
      (f.startsWith("pmp-teach-") && f.endsWith(".html"))
  );

function patchContent(content) {
  if (!content.includes("pmp-teach-fullscreen.css")) {
    content = content.replace("</head>", linkTag + "</head>");
  }

  content = content.replace(
    /\.layout\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*var\(--sidebar-w\)\s*1fr;\s*min-height:\s*100vh;\s*\}/g,
    ".layout { display: grid; grid-template-columns: var(--sidebar-w) 1fr; min-height: 100dvh; width: 100%; }"
  );

  content = content.replace(
    /main\s*\{\s*max-width:\s*860px;\s*padding:/g,
    "main { max-width: none; width: 100%; padding:"
  );

  content = content.replace(
    /body\s*\{\s*margin:\s*0;\s*font-family:/g,
    "body { margin: 0; width: 100%; min-height: 100dvh; font-family:"
  );

  return content;
}

for (const file of files) {
  const filePath = path.join(pmpDir, file);
  const original = fs.readFileSync(filePath, "utf8");
  const updated = patchContent(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log("Updated", file);
  } else {
    console.log("No changes:", file);
  }
}

console.log("Done.");
