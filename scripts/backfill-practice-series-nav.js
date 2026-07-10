const fs = require("fs");
const path = require("path");
const { SERIES, GROUPS } = require("./pmp-teach-series");

const dir = path.join(__dirname, "../public/pmp");

function buildSeriesBlock(currentHref) {
  let out = '        <div class="nav-series">Practice Series</div>\n';
  out +=
    '        <a href="pmp-teach-series-index.html" class="nav-series-index">📚 Nhóm theo chủ đề</a>\n';
  GROUPS.forEach(function (group) {
    const items = SERIES.slice(group.from - 1, group.to);
    const hasCurrent = items.some(function (entry) {
      return entry[0] === currentHref;
    });
    out +=
      '        <details class="nav-series-group"' +
      (hasCurrent ? " open" : "") +
      ">\n";
    out +=
      "          <summary>Q" +
      group.from +
      "–" +
      group.to +
      " · " +
      group.title +
      "</summary>\n";
    items.forEach(function (entry) {
      const cls = entry[0] === currentHref ? ' class="series-current"' : "";
      out +=
        '          <a href="' + entry[0] + '"' + cls + ">" + entry[1] + "</a>\n";
    });
    out += "        </details>\n";
  });
  return out;
}

let updated = 0;
fs.readdirSync(dir)
  .filter((f) => f.startsWith("pmp-teach-") && f.endsWith(".html"))
  .forEach(function (file) {
    const filePath = path.join(dir, file);
    let text = fs.readFileSync(filePath, "utf8");
    if (!text.includes('class="nav-series"')) {
      console.warn("Skip (no Practice Series): " + file);
      return;
    }
    const re =
      /        <div class="nav-series">Practice Series<\/div>[\s\S]*?(?=      <\/nav>)/;
    if (!re.test(text)) {
      console.warn("Skip (pattern mismatch): " + file);
      return;
    }
    const block = buildSeriesBlock(file);
    const next = text.replace(re, block);
    if (next !== text) {
      fs.writeFileSync(filePath, next);
      updated++;
      console.log("Updated nav: " + file);
    }
  });

console.log("Done. Updated " + updated + " files.");
