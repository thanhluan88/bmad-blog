const fs = require("fs");
const path = require("path");

const OLD_SNIPPET =
  "Work Package Planned Value (PV) Earned Value (PV) Site Preparation 200,000 200,000 Foundation 300,000 250,000 Framing 400,000 300,000 Roofing 100,000 80,000";

const NEW_SNIPPET =
  "Work Package Planned Value (PV) Earned Value (EV) Actual Cost (AC) Site Preparation 200,000 200,000 220,000 Foundation 300,000 250,000 260,000 Framing 400,000 300,000 280,000 Roofing 100,000 80,000 90,000";

const FILES = [
  path.join(__dirname, "../public/pmp/pmp-full-questions.html"),
  path.join(__dirname, "../PMP_Full_Questions.html"),
];

const PARSER_OLD = `    function parseWorkPackageEvTable(text) {
      const headerRe = /Work Package\\s+Planned Value\\s*\\(PV\\)\\s+Earned Value\\s*\\(P[V E]\\)/i;
      const headerMatch = text.match(headerRe);
      if (!headerMatch) return null;

      const intro = text.slice(0, headerMatch.index).trim();
      const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
      const promptMatch =
        body.match(/\\s+(Based on[\\s\\S]*)$/i) ||
        body.match(/\\s+(What[\\s\\S]*)$/i);
      const tableBody = promptMatch
        ? body.slice(0, body.length - promptMatch[0].length).trim()
        : body;
      const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

      const rowRe = /([A-Za-z][A-Za-z\\s]*?)\\s+([\\d,]+)\\s+([\\d,]+)/g;
      const rows = [];
      let match;
      while ((match = rowRe.exec(tableBody)) !== null) {
        const name = match[1].trim();
        if (/work package|planned value|earned value/i.test(name)) continue;
        rows.push([name, match[2], match[3]]);
      }

      if (rows.length === 0) return null;
      return {
        intro,
        questionPrompt,
        caption: "Work package performance (USD)",
        columns: ["Work Package", "Planned Value (PV)", "Earned Value (EV)"],
        rows,
      };
    }`;

const PARSER_NEW = `    function parseWorkPackageEvTable(text) {
      const headerRe =
        /Work Package\\s+Planned Value\\s*\\(PV\\)\\s+Earned Value\\s*\\(E[V P][V ]?\\)(?:\\s+Actual Cost\\s*\\(AC\\))?/i;
      const headerMatch = text.match(headerRe);
      if (!headerMatch) return null;

      const intro = text.slice(0, headerMatch.index).trim();
      const body = text.slice(headerMatch.index + headerMatch[0].length).trim();
      const promptMatch =
        body.match(/\\s+(Based on[\\s\\S]*)$/i) ||
        body.match(/\\s+(What[\\s\\S]*)$/i);
      const tableBody = promptMatch
        ? body.slice(0, body.length - promptMatch[0].length).trim()
        : body;
      const questionPrompt = promptMatch ? promptMatch[1].trim() : "";

      const hasAc = /Actual Cost\\s*\\(AC\\)/i.test(headerMatch[0]);
      const rowRe = hasAc
        ? /([A-Za-z][A-Za-z\\s]*?)\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)/g
        : /([A-Za-z][A-Za-z\\s]*?)\\s+([\\d,]+)\\s+([\\d,]+)/g;
      const rows = [];
      let match;
      while ((match = rowRe.exec(tableBody)) !== null) {
        const name = match[1].trim();
        if (/work package|planned value|earned value|actual cost/i.test(name)) continue;
        rows.push(
          hasAc
            ? [name, match[2], match[3], match[4]]
            : [name, match[2], match[3]],
        );
      }

      if (rows.length === 0) return null;
      return {
        intro,
        questionPrompt,
        caption: "Work package performance (USD)",
        columns: hasAc
          ? [
              "Work Package",
              "Planned Value (PV)",
              "Earned Value (EV)",
              "Actual Cost (AC)",
            ]
          : ["Work Package", "Planned Value (PV)", "Earned Value (EV)"],
        rows,
      };
    }`;

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.warn("Skip:", file);
    continue;
  }
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes(OLD_SNIPPET)) {
    if (html.includes(NEW_SNIPPET)) {
      console.log("Data already fixed:", path.basename(file));
    } else {
      throw new Error(`Q627 table snippet not found in ${file}`);
    }
  } else {
    html = html.replace(OLD_SNIPPET, NEW_SNIPPET);
  }

  if (html.includes(PARSER_OLD)) {
    html = html.replace(PARSER_OLD, PARSER_NEW);
  } else if (!html.includes('"Actual Cost (AC)"')) {
    console.log("Parser skip (not present):", path.basename(file));
  }

  fs.writeFileSync(file, html);
  console.log("Patched:", path.basename(file));
}
